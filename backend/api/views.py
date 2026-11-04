"""
PantryPal AI – Django REST Framework Views
"""
import os
import logging
from datetime import datetime, timezone, date, timedelta

from django.contrib.auth.models import User
from django.conf import settings
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import RegisterSerializer, UserSerializer, PantryItemSerializer
from . import couchdb_service as db
from . import ai_service as ai

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Auth
# ──────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"message": "Account created successfully.", "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


# ──────────────────────────────────────────────
# Pantry Items
# ──────────────────────────────────────────────

def _compute_status(expiry_date_str: str) -> str:
    """Determine freshness status from expiry date string."""
    if not expiry_date_str:
        return "fresh"
    try:
        exp = date.fromisoformat(expiry_date_str[:10])
        today = date.today()
        delta = (exp - today).days
        if delta < 0:
            return "expired"
        elif delta <= 3:
            return "expiring_soon"
        else:
            return "fresh"
    except ValueError:
        return "fresh"


def _enrich_item(item: dict) -> dict:
    """Recalculate dynamic status field."""
    item["status"] = _compute_status(item.get("expiry_date", ""))
    return item


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pantry_list(request):
    """Return all pantry items for the current user."""
    items = db.get_pantry_items(request.user.id)
    items = [_enrich_item(i) for i in items]
    return Response(items)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pantry_create(request):
    """Manually add a pantry item."""
    serializer = PantryItemSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    data["status"] = _compute_status(data.get("expiry_date", ""))
    item = db.create_pantry_item(request.user.id, data)
    return Response(item, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def pantry_detail(request, doc_id):
    item = db.get_pantry_item(doc_id)
    if not item or item.get("user_id") != str(request.user.id):
        return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(_enrich_item(item))

    if request.method == "PUT":
        updates = request.data
        if "expiry_date" in updates:
            updates["status"] = _compute_status(updates["expiry_date"])
        updated = db.update_pantry_item(doc_id, updates)
        return Response(_enrich_item(updated))

    if request.method == "DELETE":
        db.delete_pantry_item(doc_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────
# AI Scan
# ──────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def scan_image(request):
    """
    Upload an image, run YOLOv8 + OCR, return detected items.
    Items are NOT saved to DB yet – the user reviews them first.
    """
    if "image" not in request.FILES:
        return Response({"error": "No image file provided."}, status=status.HTTP_400_BAD_REQUEST)

    image_file = request.FILES["image"]
    upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    # Save uploaded file
    filename = f"{request.user.id}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{image_file.name}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        for chunk in image_file.chunks():
            f.write(chunk)

    image_url = f"{settings.MEDIA_URL}uploads/{filename}"

    # Run detection
    detected_items = ai.detect_food_items(filepath)

    # Run OCR for text-rich images
    ocr_data = ai.extract_ocr_data(filepath)

    # Enrich detected items with OCR hints and expiry status
    for item in detected_items:
        item["image_path"] = image_url
        item["expiry_date"] = ocr_data.get("expiry_date", "")
        item["ocr_data"] = ocr_data
        item["status"] = _compute_status(item.get("expiry_date", ""))
        item["date_added"] = datetime.now(timezone.utc).isoformat()

    return Response({
        "image_url": image_url,
        "detected_items": detected_items,
        "ocr_data": ocr_data,
        "item_count": len(detected_items),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_scan(request):
    """
    User has reviewed detected items.  Save them to CouchDB,
    record scan session, compute diff with previous scan.
    """
    items_data = request.data.get("items", [])
    image_url = request.data.get("image_url", "")

    if not items_data:
        return Response({"error": "No items provided."}, status=status.HTTP_400_BAD_REQUEST)

    # Enrich statuses
    for item in items_data:
        item["status"] = _compute_status(item.get("expiry_date", ""))

    # Compute diff with last scan
    last_session = db.get_last_scan_session(request.user.id)
    previous_items = last_session.get("detected_items", []) if last_session else []
    changes = ai.compute_pantry_diff(previous_items, items_data)

    # Save scan session
    session = db.create_scan_session(
        user_id=request.user.id,
        image_path=image_url,
        detected_items=items_data,
        changes=changes,
    )

    # Save items to pantry
    for item in items_data:
        item["scan_session_id"] = session["_id"]

    saved_items = db.bulk_create_pantry_items(request.user.id, items_data)

    return Response({
        "session": session,
        "saved_items": saved_items,
        "changes": changes,
    }, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# Scan History / Timeline
# ──────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def scan_history(request):
    sessions = db.get_scan_sessions(request.user.id)
    return Response(sessions)


# ──────────────────────────────────────────────
# Analytics
# ──────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def analytics(request):
    items = db.get_pantry_items(request.user.id)
    items = [_enrich_item(i) for i in items]

    total = len(items)
    fresh = sum(1 for i in items if i["status"] == "fresh")
    expiring_soon = sum(1 for i in items if i["status"] == "expiring_soon")
    expired = sum(1 for i in items if i["status"] == "expired")

    # Category distribution
    category_counts: dict[str, int] = {}
    for i in items:
        cat = i.get("category", "Other")
        category_counts[cat] = category_counts.get(cat, 0) + 1

    # Most frequent items
    name_counts: dict[str, int] = {}
    for i in items:
        name = i.get("name", "Unknown")
        name_counts[name] = name_counts.get(name, 0) + 1
    top_items = sorted(name_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    # Food waste % (expired / total)
    waste_pct = round((expired / total * 100) if total > 0 else 0, 1)

    # Expiry alerts
    alerts = []
    today = date.today()
    for i in items:
        exp = i.get("expiry_date", "")
        if not exp:
            continue
        try:
            exp_date = date.fromisoformat(exp[:10])
            delta = (exp_date - today).days
            if delta == 0:
                alerts.append(f"{i['name']} expires today!")
            elif delta == 1:
                alerts.append(f"{i['name']} expires tomorrow.")
            elif 1 < delta <= 7:
                alerts.append(f"{i['name']} expires in {delta} days.")
        except ValueError:
            continue

    return Response({
        "total": total,
        "fresh": fresh,
        "expiring_soon": expiring_soon,
        "expired": expired,
        "category_distribution": category_counts,
        "top_items": [{"name": n, "count": c} for n, c in top_items],
        "waste_percentage": waste_pct,
        "alerts": alerts[:10],
    })


# ──────────────────────────────────────────────
# Recipe Suggestions
# ──────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recipes(request):
    items = db.get_pantry_items(request.user.id)
    item_names = [i.get("name", "") for i in items]
    suggestions = ai.get_recipe_suggestions(item_names)
    return Response(suggestions)


# ──────────────────────────────────────────────
# Shopping List
# ──────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shopping_list(request):
    doc = db.get_or_create_shopping_list(request.user.id)
    return Response(doc)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def shopping_list_add(request):
    name = request.data.get("name", "").strip()
    quantity = int(request.data.get("quantity", 1))
    reason = request.data.get("reason", "manual")
    if not name:
        return Response({"error": "Item name required."}, status=status.HTTP_400_BAD_REQUEST)
    doc = db.add_to_shopping_list(request.user.id, name, quantity, reason)
    return Response(doc)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def shopping_list_update(request):
    items = request.data.get("items", [])
    doc = db.update_shopping_list(request.user.id, items)
    return Response(doc)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def shopping_list_remove(request, item_id):
    doc = db.remove_shopping_item(request.user.id, item_id)
    return Response(doc)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_shopping_list(request):
    """Auto-generate shopping list from expired items + recipe missing ingredients."""
    items = db.get_pantry_items(request.user.id)
    items = [_enrich_item(i) for i in items]

    added_count = 0

    # Add expired items
    for i in items:
        if i["status"] == "expired":
            db.add_to_shopping_list(
                request.user.id, i["name"],
                quantity=i.get("quantity", 1),
                reason="expired",
            )
            added_count += 1

    # Add missing ingredients from top recipes
    item_names = [i.get("name", "") for i in items]
    recipes = ai.get_recipe_suggestions(item_names)
    for recipe in recipes[:3]:
        for ingredient in recipe.get("missing_ingredients", []):
            db.add_to_shopping_list(
                request.user.id, ingredient.title(),
                quantity=1, reason=f"Recipe: {recipe['name']}",
            )
            added_count += 1

    doc = db.get_or_create_shopping_list(request.user.id)
    return Response({"message": f"Added {added_count} items.", "list": doc})


# ──────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    # Check CouchDB connectivity
    try:
        db.ensure_database()
        couch_ok = True
    except Exception:
        couch_ok = False

    return Response({
        "status": "ok",
        "couchdb": "connected" if couch_ok else "unavailable",
        "version": "1.0.0",
    })
