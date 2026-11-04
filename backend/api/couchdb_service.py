"""
CouchDB service layer.
All pantry documents are stored in CouchDB.
User authentication still uses Django's SQLite DB.
"""
import json
import uuid
import logging
import requests
from datetime import datetime, timezone
from django.conf import settings

logger = logging.getLogger(__name__)


def _auth():
    return (settings.COUCHDB_USER, settings.COUCHDB_PASSWORD)


def _base_url():
    return settings.COUCHDB_URL.rstrip("/")


def _db_url(db_name=None):
    db = db_name or settings.COUCHDB_DB
    return f"{_base_url()}/{db}"


# ──────────────────────────────────────────────
# Database initialisation
# ──────────────────────────────────────────────

def ensure_database():
    """Create the CouchDB database if it doesn't exist."""
    url = _db_url()
    resp = requests.get(url, auth=_auth(), timeout=5)
    if resp.status_code == 404:
        resp = requests.put(url, auth=_auth(), timeout=5)
        if resp.status_code not in (201, 202):
            raise RuntimeError(f"Could not create CouchDB database: {resp.text}")
        logger.info("CouchDB database '%s' created.", settings.COUCHDB_DB)
        _create_design_docs()
    elif resp.status_code != 200:
        raise RuntimeError(f"CouchDB not reachable: {resp.status_code}")
    else:
        logger.info("CouchDB database '%s' already exists.", settings.COUCHDB_DB)


def _create_design_docs():
    """Create views/indexes for efficient querying."""
    design = {
        "_id": "_design/pantry",
        "views": {
            "by_user": {
                "map": "function(doc) { if (doc.type === 'pantry_item') emit(doc.user_id, null); }"
            },
            "by_user_expiry": {
                "map": "function(doc) { if (doc.type === 'pantry_item') emit([doc.user_id, doc.expiry_date], null); }"
            },
            "by_user_category": {
                "map": "function(doc) { if (doc.type === 'pantry_item') emit([doc.user_id, doc.category], null); }"
            },
            "scans_by_user": {
                "map": "function(doc) { if (doc.type === 'scan_session') emit([doc.user_id, doc.created_at], null); }"
            },
        },
    }
    url = f"{_db_url()}/_design/pantry"
    requests.put(url, json=design, auth=_auth(), timeout=5)


# ──────────────────────────────────────────────
# Generic CRUD helpers
# ──────────────────────────────────────────────

def _get_doc(doc_id):
    resp = requests.get(f"{_db_url()}/{doc_id}", auth=_auth(), timeout=5)
    if resp.status_code == 200:
        return resp.json()
    return None


def _save_doc(doc):
    """Create or update a document. Returns the saved doc with _id and _rev."""
    if "_id" not in doc:
        doc["_id"] = str(uuid.uuid4())
    url = f"{_db_url()}/{doc['_id']}"
    resp = requests.put(url, json=doc, auth=_auth(), timeout=10)
    if resp.status_code in (201, 202):
        data = resp.json()
        doc["_id"] = data["id"]
        doc["_rev"] = data["rev"]
        return doc
    raise RuntimeError(f"CouchDB save failed ({resp.status_code}): {resp.text}")


def _delete_doc(doc_id):
    doc = _get_doc(doc_id)
    if not doc:
        return False
    rev = doc["_rev"]
    resp = requests.delete(f"{_db_url()}/{doc_id}?rev={rev}", auth=_auth(), timeout=5)
    return resp.status_code in (200, 202)


def _query_view(design, view, key=None, start_key=None, end_key=None, include_docs=True):
    url = f"{_db_url()}/_design/{design}/_view/{view}"
    params = {"include_docs": "true" if include_docs else "false"}
    if key is not None:
        params["key"] = json.dumps(key)
    if start_key is not None:
        params["startkey"] = json.dumps(start_key)
    if end_key is not None:
        params["endkey"] = json.dumps(end_key)
    resp = requests.get(url, params=params, auth=_auth(), timeout=10)
    if resp.status_code == 200:
        rows = resp.json().get("rows", [])
        if include_docs:
            return [r["doc"] for r in rows if "doc" in r]
        return rows
    logger.error("CouchDB view query failed: %s %s", resp.status_code, resp.text)
    return []


# ──────────────────────────────────────────────
# Pantry Item CRUD
# ──────────────────────────────────────────────

def create_pantry_item(user_id, item_data):
    """Create a new pantry item document."""
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "type": "pantry_item",
        "user_id": str(user_id),
        "name": item_data.get("name", "Unknown"),
        "category": item_data.get("category", "Other"),
        "quantity": item_data.get("quantity", 1),
        "unit": item_data.get("unit", ""),
        "expiry_date": item_data.get("expiry_date", ""),
        "date_added": item_data.get("date_added", now),
        "brand": item_data.get("brand", ""),
        "image_path": item_data.get("image_path", ""),
        "confidence": item_data.get("confidence", 0.0),
        "ocr_data": item_data.get("ocr_data", {}),
        "ai_metadata": item_data.get("ai_metadata", {}),
        "scan_session_id": item_data.get("scan_session_id", ""),
        "status": item_data.get("status", "fresh"),  # fresh | expiring_soon | expired
        "notes": item_data.get("notes", ""),
        "created_at": now,
        "updated_at": now,
    }
    return _save_doc(doc)


def get_pantry_items(user_id):
    """Return all pantry items for a user."""
    return _query_view("pantry", "by_user", key=str(user_id))


def get_pantry_item(doc_id):
    return _get_doc(doc_id)


def update_pantry_item(doc_id, updates):
    doc = _get_doc(doc_id)
    if not doc:
        return None
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    doc.update(updates)
    return _save_doc(doc)


def delete_pantry_item(doc_id):
    return _delete_doc(doc_id)


def bulk_create_pantry_items(user_id, items_data):
    """Create multiple pantry items at once (e.g., after a scan)."""
    created = []
    for item_data in items_data:
        try:
            doc = create_pantry_item(user_id, item_data)
            created.append(doc)
        except Exception as e:
            logger.error("Failed to save pantry item: %s", e)
    return created


# ──────────────────────────────────────────────
# Scan Sessions
# ──────────────────────────────────────────────

def create_scan_session(user_id, image_path, detected_items, changes=None):
    """Record a scan session with detected items and diff from previous scan."""
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "type": "scan_session",
        "user_id": str(user_id),
        "image_path": image_path,
        "detected_items": detected_items,
        "changes": changes or {"added": [], "removed": []},
        "created_at": now,
        "item_count": len(detected_items),
    }
    return _save_doc(doc)


def get_scan_sessions(user_id, limit=20):
    """Return the most recent scan sessions for a user."""
    sessions = _query_view(
        "pantry",
        "scans_by_user",
        start_key=[str(user_id), ""],
        end_key=[str(user_id), "\ufff0"],
    )
    # Sort descending by created_at
    sessions.sort(key=lambda s: s.get("created_at", ""), reverse=True)
    return sessions[:limit]


def get_last_scan_session(user_id):
    sessions = get_scan_sessions(user_id, limit=1)
    return sessions[0] if sessions else None


# ──────────────────────────────────────────────
# Shopping List
# ──────────────────────────────────────────────

def get_or_create_shopping_list(user_id):
    list_id = f"shopping_list_{user_id}"
    doc = _get_doc(list_id)
    if doc:
        return doc
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "_id": list_id,
        "type": "shopping_list",
        "user_id": str(user_id),
        "items": [],
        "created_at": now,
        "updated_at": now,
    }
    return _save_doc(doc)


def add_to_shopping_list(user_id, item_name, quantity=1, reason="manual"):
    doc = get_or_create_shopping_list(user_id)
    # Avoid duplicates
    existing = next((i for i in doc["items"] if i["name"].lower() == item_name.lower()), None)
    if existing:
        existing["quantity"] = existing.get("quantity", 1) + quantity
    else:
        doc["items"].append({
            "id": str(uuid.uuid4()),
            "name": item_name,
            "quantity": quantity,
            "reason": reason,
            "checked": False,
            "added_at": datetime.now(timezone.utc).isoformat(),
        })
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    return _save_doc(doc)


def update_shopping_list(user_id, items):
    doc = get_or_create_shopping_list(user_id)
    doc["items"] = items
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    return _save_doc(doc)


def remove_shopping_item(user_id, item_id):
    doc = get_or_create_shopping_list(user_id)
    doc["items"] = [i for i in doc["items"] if i.get("id") != item_id]
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    return _save_doc(doc)
