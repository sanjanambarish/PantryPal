"""
PantryPal AI – Demo Data Seeder
Run: python seed_demo_data.py

Seeds realistic pantry items, scan sessions, and a shopping list
for the demo user so the dashboard looks fully populated.
"""
import os
import sys
import uuid
import django
from datetime import datetime, timezone, timedelta, date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pantrypal.settings")
django.setup()

from django.contrib.auth.models import User
from api import couchdb_service as db

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
USERNAME = "sanjanambarish"   # change if needed

try:
    user = User.objects.get(username=USERNAME)
except User.DoesNotExist:
    print(f"❌  User '{USERNAME}' not found. Run the app and register first.")
    sys.exit(1)

USER_ID = str(user.id)
NOW     = datetime.now(timezone.utc)

def iso(d): return d.isoformat()
def days(n): return iso(NOW + timedelta(days=n))
def dstr(n): return (date.today() + timedelta(days=n)).isoformat()

print(f"✅  Seeding demo data for user: {user.username} (id={USER_ID})")

# ─────────────────────────────────────────────
# Ensure CouchDB is ready
# ─────────────────────────────────────────────
try:
    db.ensure_database()
    print("✅  CouchDB connected.")
except Exception as e:
    print(f"❌  CouchDB not reachable: {e}")
    print("    Make sure CouchDB is running on http://localhost:5984")
    sys.exit(1)

# ─────────────────────────────────────────────
# Pantry Items
# ─────────────────────────────────────────────
PANTRY_ITEMS = [
    # ── Dairy ──
    {
        "name": "Whole Milk",       "category": "Dairy",      "quantity": 2,  "unit": "L",
        "brand": "Mother Dairy",    "expiry_date": dstr(5),   "confidence": 0.94,
        "notes": "Full-fat, 3.5% fat",
    },
    {
        "name": "Eggs",             "category": "Dairy",      "quantity": 12, "unit": "pcs",
        "brand": "Farm Fresh",      "expiry_date": dstr(18),  "confidence": 0.91,
        "notes": "Free-range large eggs",
    },
    {
        "name": "Cheddar Cheese",   "category": "Dairy",      "quantity": 1,  "unit": "block",
        "brand": "Amul",            "expiry_date": dstr(22),  "confidence": 0.88,
        "notes": "Mature cheddar",
    },
    {
        "name": "Butter",           "category": "Dairy",      "quantity": 1,  "unit": "pack",
        "brand": "Amul",            "expiry_date": dstr(30),  "confidence": 0.90,
    },
    {
        "name": "Greek Yogurt",     "category": "Dairy",      "quantity": 2,  "unit": "cups",
        "brand": "Epigamia",        "expiry_date": dstr(2),   "confidence": 0.86,
        "notes": "Honey flavour",
    },

    # ── Fruits ──
    {
        "name": "Banana",           "category": "Fruits",     "quantity": 6,  "unit": "pcs",
        "brand": "",                "expiry_date": dstr(3),   "confidence": 0.97,
    },
    {
        "name": "Apple",            "category": "Fruits",     "quantity": 5,  "unit": "pcs",
        "brand": "",                "expiry_date": dstr(10),  "confidence": 0.95,
        "notes": "Fuji variety",
    },
    {
        "name": "Orange",           "category": "Fruits",     "quantity": 4,  "unit": "pcs",
        "brand": "",                "expiry_date": dstr(8),   "confidence": 0.93,
    },
    {
        "name": "Strawberries",     "category": "Fruits",     "quantity": 1,  "unit": "punnet",
        "brand": "",                "expiry_date": dstr(1),   "confidence": 0.89,
        "notes": "250g punnet",
    },

    # ── Vegetables ──
    {
        "name": "Carrot",           "category": "Vegetables", "quantity": 5,  "unit": "pcs",
        "brand": "",                "expiry_date": dstr(12),  "confidence": 0.92,
    },
    {
        "name": "Spinach",          "category": "Vegetables", "quantity": 1,  "unit": "bag",
        "brand": "Fresh Leaf",      "expiry_date": dstr(4),   "confidence": 0.87,
        "notes": "Baby spinach 200g",
    },
    {
        "name": "Tomato",           "category": "Vegetables", "quantity": 6,  "unit": "pcs",
        "brand": "",                "expiry_date": dstr(7),   "confidence": 0.94,
    },
    {
        "name": "Onion",            "category": "Vegetables", "quantity": 4,  "unit": "pcs",
        "brand": "",                "expiry_date": dstr(20),  "confidence": 0.90,
    },
    {
        "name": "Broccoli",         "category": "Vegetables", "quantity": 1,  "unit": "head",
        "brand": "",                "expiry_date": dstr(5),   "confidence": 0.85,
    },

    # ── Bakery ──
    {
        "name": "Whole Wheat Bread","category": "Bakery",     "quantity": 1,  "unit": "loaf",
        "brand": "Britannia",       "expiry_date": dstr(4),   "confidence": 0.91,
    },
    {
        "name": "Croissants",       "category": "Bakery",     "quantity": 4,  "unit": "pcs",
        "brand": "",                "expiry_date": dstr(2),   "confidence": 0.82,
        "notes": "Butter croissants from bakery",
    },

    # ── Drinks ──
    {
        "name": "Orange Juice",     "category": "Drinks",     "quantity": 1,  "unit": "L",
        "brand": "Tropicana",       "expiry_date": dstr(14),  "confidence": 0.89,
        "notes": "100% pure squeezed, no sugar",
    },
    {
        "name": "Green Tea",        "category": "Drinks",     "quantity": 1,  "unit": "box",
        "brand": "Tetley",          "expiry_date": dstr(180), "confidence": 0.88,
        "notes": "25 tea bags",
    },
    {
        "name": "Coconut Water",    "category": "Drinks",     "quantity": 3,  "unit": "cans",
        "brand": "Raw C",           "expiry_date": dstr(45),  "confidence": 0.84,
    },

    # ── Snacks ──
    {
        "name": "Mixed Nuts",       "category": "Snacks",     "quantity": 1,  "unit": "jar",
        "brand": "Happilo",         "expiry_date": dstr(60),  "confidence": 0.86,
        "notes": "Almonds, cashews, walnuts",
    },
    {
        "name": "Dark Chocolate",   "category": "Snacks",     "quantity": 2,  "unit": "bars",
        "brand": "Lindt 70%",       "expiry_date": dstr(90),  "confidence": 0.88,
    },
    {
        "name": "Rice Crackers",    "category": "Snacks",     "quantity": 1,  "unit": "pack",
        "brand": "Snapea",          "expiry_date": dstr(40),  "confidence": 0.80,
    },

    # ── Grains ──
    {
        "name": "Basmati Rice",     "category": "Grains",     "quantity": 1,  "unit": "kg",
        "brand": "India Gate",      "expiry_date": dstr(365), "confidence": 0.91,
    },
    {
        "name": "Oats",             "category": "Grains",     "quantity": 1,  "unit": "kg",
        "brand": "Quaker",          "expiry_date": dstr(120), "confidence": 0.88,
        "notes": "Rolled oats",
    },
    {
        "name": "Pasta",            "category": "Grains",     "quantity": 2,  "unit": "pack",
        "brand": "Barilla",         "expiry_date": dstr(200), "confidence": 0.87,
        "notes": "Penne rigate 500g",
    },

    # ── Frozen ──
    {
        "name": "Frozen Peas",      "category": "Frozen Foods","quantity": 1, "unit": "bag",
        "brand": "McCain",          "expiry_date": dstr(120), "confidence": 0.83,
        "notes": "Garden peas 500g",
    },
    {
        "name": "Frozen Corn",      "category": "Frozen Foods","quantity": 1, "unit": "bag",
        "brand": "McCain",          "expiry_date": dstr(90),  "confidence": 0.81,
    },

    # ── EXPIRED items (for demo) ──
    {
        "name": "Sour Cream",       "category": "Dairy",      "quantity": 1,  "unit": "tub",
        "brand": "Britannia",       "expiry_date": dstr(-3),  "confidence": 0.85,
        "notes": "Expired 3 days ago",
    },
    {
        "name": "Leftover Hummus",  "category": "Snacks",     "quantity": 1,  "unit": "tub",
        "brand": "",                "expiry_date": dstr(-1),  "confidence": 0.78,
        "notes": "Store-bought",
    },
    {
        "name": "Mango Lassi",      "category": "Drinks",     "quantity": 1,  "unit": "bottle",
        "brand": "Amul",            "expiry_date": dstr(-5),  "confidence": 0.82,
    },
]

def compute_status(expiry_str):
    if not expiry_str: return "fresh"
    try:
        exp   = date.fromisoformat(expiry_str[:10])
        delta = (exp - date.today()).days
        if delta < 0:   return "expired"
        if delta <= 3:  return "expiring_soon"
        return "fresh"
    except ValueError:
        return "fresh"

print(f"\n📦  Seeding {len(PANTRY_ITEMS)} pantry items…")
session_id_1 = str(uuid.uuid4())
session_id_2 = str(uuid.uuid4())

saved_items = []
for i, item_data in enumerate(PANTRY_ITEMS):
    item_data["status"]           = compute_status(item_data.get("expiry_date",""))
    item_data["date_added"]       = iso(NOW - timedelta(days=2))
    item_data["scan_session_id"]  = session_id_1 if i < len(PANTRY_ITEMS)//2 else session_id_2
    item_data.setdefault("brand","")
    item_data.setdefault("notes","")

    try:
        doc = db.create_pantry_item(USER_ID, item_data)
        saved_items.append(doc)
        status_icon = {"fresh":"🟢","expiring_soon":"🟡","expired":"🔴"}[item_data["status"]]
        print(f"  {status_icon}  {item_data['name']:28s} {item_data['category']:15s} exp:{item_data.get('expiry_date','—')}")
    except Exception as e:
        print(f"  ❌  Failed to save {item_data['name']}: {e}")

# ─────────────────────────────────────────────
# Scan Session 1  (5 days ago – first scan)
# ─────────────────────────────────────────────
print("\n📸  Creating scan session 1 (5 days ago)…")
first_scan_items = [
    {"name":"Whole Milk","category":"Dairy","quantity":2,"status":"fresh","confidence":0.94},
    {"name":"Eggs","category":"Dairy","quantity":12,"status":"fresh","confidence":0.91},
    {"name":"Butter","category":"Dairy","quantity":1,"status":"fresh","confidence":0.90},
    {"name":"Bread","category":"Bakery","quantity":1,"status":"fresh","confidence":0.88},
    {"name":"Apple","category":"Fruits","quantity":6,"status":"fresh","confidence":0.95},
    {"name":"Carrot","category":"Vegetables","quantity":5,"status":"fresh","confidence":0.92},
    {"name":"Sour Cream","category":"Dairy","quantity":1,"status":"fresh","confidence":0.85},
    {"name":"Orange Juice","category":"Drinks","quantity":1,"status":"fresh","confidence":0.89},
    {"name":"Mango Lassi","category":"Drinks","quantity":1,"status":"fresh","confidence":0.82},
]
s1 = db._save_doc({
    "_id": session_id_1,
    "type": "scan_session",
    "user_id": USER_ID,
    "image_path": "",
    "detected_items": first_scan_items,
    "changes": {"added": [i["name"] for i in first_scan_items], "removed": []},
    "created_at": iso(NOW - timedelta(days=5)),
    "item_count": len(first_scan_items),
})
print(f"  ✅  Session 1 saved ({len(first_scan_items)} items)")

# ─────────────────────────────────────────────
# Scan Session 2  (today – latest scan)
# ─────────────────────────────────────────────
print("📸  Creating scan session 2 (today)…")
second_scan_items = [
    {"name":"Whole Milk","category":"Dairy","quantity":2,"status":"expiring_soon","confidence":0.94},
    {"name":"Eggs","category":"Dairy","quantity":12,"status":"fresh","confidence":0.91},
    {"name":"Cheddar Cheese","category":"Dairy","quantity":1,"status":"fresh","confidence":0.88},
    {"name":"Butter","category":"Dairy","quantity":1,"status":"fresh","confidence":0.90},
    {"name":"Greek Yogurt","category":"Dairy","quantity":2,"status":"expiring_soon","confidence":0.86},
    {"name":"Banana","category":"Fruits","quantity":6,"status":"expiring_soon","confidence":0.97},
    {"name":"Apple","category":"Fruits","quantity":5,"status":"fresh","confidence":0.95},
    {"name":"Orange","category":"Fruits","quantity":4,"status":"fresh","confidence":0.93},
    {"name":"Strawberries","category":"Fruits","quantity":1,"status":"expiring_soon","confidence":0.89},
    {"name":"Carrot","category":"Vegetables","quantity":5,"status":"fresh","confidence":0.92},
    {"name":"Spinach","category":"Vegetables","quantity":1,"status":"expiring_soon","confidence":0.87},
    {"name":"Tomato","category":"Vegetables","quantity":6,"status":"fresh","confidence":0.94},
    {"name":"Whole Wheat Bread","category":"Bakery","quantity":1,"status":"expiring_soon","confidence":0.91},
    {"name":"Orange Juice","category":"Drinks","quantity":1,"status":"fresh","confidence":0.89},
    {"name":"Coconut Water","category":"Drinks","quantity":3,"status":"fresh","confidence":0.84},
    {"name":"Basmati Rice","category":"Grains","quantity":1,"status":"fresh","confidence":0.91},
    {"name":"Oats","category":"Grains","quantity":1,"status":"fresh","confidence":0.88},
]
# Diff: Sour Cream + Mango Lassi + Bread (old) removed, new items added
added_names   = ["Cheddar Cheese","Greek Yogurt","Orange","Strawberries","Spinach","Tomato","Coconut Water","Basmati Rice","Oats"]
removed_names = ["Sour Cream","Mango Lassi","Bread"]

s2 = db._save_doc({
    "_id": session_id_2,
    "type": "scan_session",
    "user_id": USER_ID,
    "image_path": "",
    "detected_items": second_scan_items,
    "changes": {"added": added_names, "removed": removed_names},
    "created_at": iso(NOW - timedelta(hours=2)),
    "item_count": len(second_scan_items),
})
print(f"  ✅  Session 2 saved ({len(second_scan_items)} items)")

# ─────────────────────────────────────────────
# Shopping List
# ─────────────────────────────────────────────
print("\n🛒  Creating shopping list…")
shopping_items = [
    {"id": str(uuid.uuid4()), "name": "Almond Milk",     "quantity": 2, "reason": "manual",              "checked": False, "added_at": iso(NOW)},
    {"id": str(uuid.uuid4()), "name": "Sour Cream",      "quantity": 1, "reason": "expired",             "checked": False, "added_at": iso(NOW)},
    {"id": str(uuid.uuid4()), "name": "Mango Lassi",     "quantity": 1, "reason": "expired",             "checked": False, "added_at": iso(NOW)},
    {"id": str(uuid.uuid4()), "name": "Leftover Hummus", "quantity": 1, "reason": "expired",             "checked": False, "added_at": iso(NOW)},
    {"id": str(uuid.uuid4()), "name": "Salt",            "quantity": 1, "reason": "Recipe: Carrot Soup", "checked": False, "added_at": iso(NOW)},
    {"id": str(uuid.uuid4()), "name": "Sugar",           "quantity": 1, "reason": "Recipe: French Toast","checked": False, "added_at": iso(NOW)},
    {"id": str(uuid.uuid4()), "name": "Avocados",        "quantity": 3, "reason": "manual",              "checked": False, "added_at": iso(NOW)},
    {"id": str(uuid.uuid4()), "name": "Olive Oil",       "quantity": 1, "reason": "manual",              "checked": False, "added_at": iso(NOW)},
    {"id": str(uuid.uuid4()), "name": "Lemon",           "quantity": 4, "reason": "manual",              "checked": True,  "added_at": iso(NOW)},
    {"id": str(uuid.uuid4()), "name": "Garlic",          "quantity": 1, "reason": "manual",              "checked": True,  "added_at": iso(NOW)},
]

list_doc = {
    "_id": f"shopping_list_{USER_ID}",
    "type": "shopping_list",
    "user_id": USER_ID,
    "items": shopping_items,
    "created_at": iso(NOW),
    "updated_at": iso(NOW),
}
# Remove existing list if present
existing = db._get_doc(f"shopping_list_{USER_ID}")
if existing:
    list_doc["_rev"] = existing["_rev"]

db._save_doc(list_doc)
print(f"  ✅  Shopping list saved ({len(shopping_items)} items)")

# ─────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────
all_items = db.get_pantry_items(USER_ID)
fresh        = sum(1 for i in all_items if i.get("status")=="fresh")
expiring     = sum(1 for i in all_items if i.get("status")=="expiring_soon")
expired_cnt  = sum(1 for i in all_items if i.get("status")=="expired")

print(f"""
╔═══════════════════════════════════════╗
║       Demo Data Seeded Successfully   ║
╠═══════════════════════════════════════╣
║  Pantry Items : {len(all_items):<3}                    ║
║    🟢 Fresh         : {fresh:<3}                ║
║    🟡 Expiring Soon : {expiring:<3}                ║
║    🔴 Expired       : {expired_cnt:<3}                ║
║  Scan Sessions : 2                    ║
║  Shopping List : {len(shopping_items)} items               ║
╚═══════════════════════════════════════╝

Login with:  {USERNAME} / pantry123
""")
