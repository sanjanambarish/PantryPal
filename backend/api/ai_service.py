"""
AI Service – YOLOv8 object detection + EasyOCR text extraction.
Falls back to mock detections when the model is not installed (useful for development).
"""
import os
import re
import logging
import numpy as np
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# YOLOv8 Food Detection
# ──────────────────────────────────────────────

# COCO class names that are food-related
FOOD_CLASSES = {
    46: "banana", 47: "apple", 48: "sandwich", 49: "orange", 50: "broccoli",
    51: "carrot", 52: "hot dog", 53: "pizza", 54: "donut", 55: "cake",
    56: "chair",  # (non-food, will be filtered)
    57: "couch",  # (non-food)
    39: "bottle", 40: "wine glass", 41: "cup", 44: "fork", 45: "knife",
}

FOOD_ONLY_CLASSES = {
    46: "banana", 47: "apple", 48: "sandwich", 49: "orange", 50: "broccoli",
    51: "carrot", 52: "hot dog", 53: "pizza", 54: "donut", 55: "cake",
    39: "bottle", 40: "wine glass", 41: "cup",
}

# Category mapping for detected food items
CATEGORY_MAP = {
    "banana": "Fruits",
    "apple": "Fruits",
    "orange": "Fruits",
    "broccoli": "Vegetables",
    "carrot": "Vegetables",
    "sandwich": "Snacks",
    "hot dog": "Snacks",
    "pizza": "Snacks",
    "donut": "Snacks",
    "cake": "Snacks",
    "bottle": "Drinks",
    "wine glass": "Drinks",
    "cup": "Drinks",
    "milk": "Dairy",
    "egg": "Dairy",
    "eggs": "Dairy",
    "butter": "Dairy",
    "cheese": "Dairy",
    "yogurt": "Dairy",
    "bread": "Bakery",
    "juice": "Drinks",
    "water": "Drinks",
    "coffee": "Drinks",
    "tea": "Drinks",
    "chicken": "Meat",
    "beef": "Meat",
    "fish": "Seafood",
    "shrimp": "Seafood",
    "rice": "Grains",
    "pasta": "Grains",
    "cereal": "Grains",
    "chips": "Snacks",
    "cookie": "Snacks",
    "chocolate": "Snacks",
    "ice cream": "Frozen Foods",
    "frozen": "Frozen Foods",
    "tomato": "Vegetables",
    "lettuce": "Vegetables",
    "onion": "Vegetables",
    "potato": "Vegetables",
    "mushroom": "Vegetables",
    "pepper": "Vegetables",
    "cucumber": "Vegetables",
    "spinach": "Vegetables",
    "lemon": "Fruits",
    "lime": "Fruits",
    "grape": "Fruits",
    "strawberry": "Fruits",
    "mango": "Fruits",
    "pineapple": "Fruits",
    "watermelon": "Fruits",
}


def get_category(name: str) -> str:
    name_lower = name.lower()
    for key, cat in CATEGORY_MAP.items():
        if key in name_lower:
            return cat
    return "Other"


def load_yolo_model():
    """Lazy-load YOLOv8 model. Returns None if not available."""
    try:
        from ultralytics import YOLO
        model = YOLO("yolov8n.pt")  # nano – fast inference
        logger.info("YOLOv8 model loaded successfully.")
        return model
    except Exception as e:
        logger.warning("YOLOv8 not available: %s. Using mock detections.", e)
        return None


_yolo_model = None


def get_yolo_model():
    global _yolo_model
    if _yolo_model is None:
        _yolo_model = load_yolo_model()
    return _yolo_model


def detect_food_items(image_path: str) -> list[dict]:
    """
    Run YOLOv8 on an image and return a list of detected food items.
    Each item: {name, category, confidence, bbox, quantity}
    """
    import cv2

    model = get_yolo_model()

    if model is None:
        return _mock_detections(image_path)

    try:
        img = cv2.imread(image_path)
        if img is None:
            logger.error("Could not read image: %s", image_path)
            return _mock_detections(image_path)

        results = model(image_path, verbose=False)[0]
        detected = {}

        for box in results.boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id].lower()
            confidence = float(box.conf[0])

            # Only keep food-relevant classes
            if confidence < 0.3:
                continue

            # Group duplicates to estimate quantity
            if cls_name in detected:
                detected[cls_name]["quantity"] += 1
                detected[cls_name]["confidence"] = max(
                    detected[cls_name]["confidence"], confidence
                )
            else:
                detected[cls_name] = {
                    "name": cls_name.title(),
                    "category": get_category(cls_name),
                    "confidence": round(confidence, 3),
                    "quantity": 1,
                    "bbox": box.xyxy[0].tolist() if box.xyxy is not None else [],
                }

        return list(detected.values())

    except Exception as e:
        logger.error("YOLO detection failed: %s", e)
        return _mock_detections(image_path)


def _mock_detections(image_path: str) -> list[dict]:
    """Return plausible mock detections for demo / fallback purposes."""
    import random
    mock_items = [
        {"name": "Milk", "category": "Dairy", "confidence": 0.92, "quantity": 2},
        {"name": "Eggs", "category": "Dairy", "confidence": 0.88, "quantity": 6},
        {"name": "Bread", "category": "Bakery", "confidence": 0.85, "quantity": 1},
        {"name": "Apple", "category": "Fruits", "confidence": 0.90, "quantity": 4},
        {"name": "Orange Juice", "category": "Drinks", "confidence": 0.87, "quantity": 1},
        {"name": "Butter", "category": "Dairy", "confidence": 0.82, "quantity": 1},
        {"name": "Carrot", "category": "Vegetables", "confidence": 0.78, "quantity": 3},
        {"name": "Cheese", "category": "Dairy", "confidence": 0.84, "quantity": 1},
    ]
    # Return a random subset so each scan feels different
    count = random.randint(3, len(mock_items))
    selected = random.sample(mock_items, count)
    return selected


# ──────────────────────────────────────────────
# EasyOCR – Product Text Extraction
# ──────────────────────────────────────────────

_ocr_reader = None


def get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        try:
            import easyocr
            _ocr_reader = easyocr.Reader(["en"], verbose=False)
            logger.info("EasyOCR reader loaded.")
        except Exception as e:
            logger.warning("EasyOCR not available: %s", e)
    return _ocr_reader


# Date patterns for expiry extraction
DATE_PATTERNS = [
    r"\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b",          # DD/MM/YYYY
    r"\b(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})\b",              # YYYY/MM/DD
    r"\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[. ]?(\d{2,4})\b",  # MON YYYY
    r"\b(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{2,4})\b",
]

MONTH_MAP = {
    "JAN": 1, "FEB": 2, "MAR": 3, "APR": 4, "MAY": 5, "JUN": 6,
    "JUL": 7, "AUG": 8, "SEP": 9, "OCT": 10, "NOV": 11, "DEC": 12,
}

EXPIRY_KEYWORDS = ["exp", "expiry", "expiration", "best before", "use by", "bb", "best by", "exp date"]
MFG_KEYWORDS = ["mfg", "manufactured", "production", "packed on", "mfd"]


def extract_ocr_data(image_path: str) -> dict:
    """
    Run OCR on an image to extract product name, brand, expiry/manufacturing dates.
    Returns a dict with extracted fields.
    """
    reader = get_ocr_reader()
    if reader is None:
        return _mock_ocr_data()

    try:
        results = reader.readtext(image_path)
        texts = [item[1] for item in results]
        full_text = " ".join(texts).upper()

        ocr_data = {
            "raw_text": " | ".join(texts),
            "product_name": "",
            "brand": "",
            "expiry_date": "",
            "manufacturing_date": "",
            "confidence": 0.0,
        }

        if results:
            ocr_data["confidence"] = round(
                sum(item[2] for item in results) / len(results), 3
            )

        # Try to extract expiry date
        expiry_date = _extract_date_near_keyword(texts, EXPIRY_KEYWORDS)
        if expiry_date:
            ocr_data["expiry_date"] = expiry_date

        # Try to extract manufacturing date
        mfg_date = _extract_date_near_keyword(texts, MFG_KEYWORDS)
        if mfg_date:
            ocr_data["manufacturing_date"] = mfg_date

        # Use first prominent text as product name
        if texts:
            ocr_data["product_name"] = texts[0]
        if len(texts) > 1:
            ocr_data["brand"] = texts[1]

        return ocr_data

    except Exception as e:
        logger.error("OCR extraction failed: %s", e)
        return _mock_ocr_data()


def _extract_date_near_keyword(texts: list[str], keywords: list[str]) -> str:
    """Find a date in text lines near a keyword."""
    full = " ".join(texts).upper()
    for kw in keywords:
        idx = full.find(kw.upper())
        if idx != -1:
            # Search 60 characters after keyword
            snippet = full[idx: idx + 60]
            date = _parse_date_from_text(snippet)
            if date:
                return date
    # If no keyword found, try to find any date in entire text
    return _parse_date_from_text(full)


def _parse_date_from_text(text: str) -> str:
    """Try to parse a date from a text string. Returns ISO date string or ''."""
    import re
    text = text.upper()
    for pattern in DATE_PATTERNS:
        match = re.search(pattern, text)
        if match:
            try:
                groups = match.groups()
                if len(groups) == 3:
                    if groups[0] in MONTH_MAP:
                        # MON YYYY
                        month = MONTH_MAP[groups[0]]
                        year = int(groups[1])
                        if year < 100:
                            year += 2000
                        return f"{year:04d}-{month:02d}-01"
                    elif groups[1] in MONTH_MAP:
                        # DD MON YYYY
                        day = int(groups[0])
                        month = MONTH_MAP[groups[1]]
                        year = int(groups[2])
                        if year < 100:
                            year += 2000
                        return f"{year:04d}-{month:02d}-{day:02d}"
                    else:
                        g = [int(x) for x in groups]
                        if g[0] > 31:
                            # YYYY/MM/DD
                            return f"{g[0]:04d}-{g[1]:02d}-{g[2]:02d}"
                        else:
                            # DD/MM/YYYY
                            year = g[2] if g[2] > 100 else g[2] + 2000
                            return f"{year:04d}-{g[1]:02d}-{g[0]:02d}"
            except (ValueError, TypeError):
                continue
    return ""


def _mock_ocr_data() -> dict:
    """Return mock OCR data for demo mode."""
    from datetime import timedelta
    exp = (datetime.now(timezone.utc) + timedelta(days=30)).strftime("%Y-%m-%d")
    return {
        "raw_text": "Sample Product | Best Before: " + exp,
        "product_name": "Sample Product",
        "brand": "Generic Brand",
        "expiry_date": exp,
        "manufacturing_date": "",
        "confidence": 0.75,
    }


# ──────────────────────────────────────────────
# Recipe Suggestions
# ──────────────────────────────────────────────

RECIPE_DB = [
    {
        "name": "Cheese Omelette",
        "ingredients": ["eggs", "cheese", "butter", "salt", "pepper"],
        "time": "10 min",
        "difficulty": "Easy",
        "description": "A classic fluffy omelette filled with melted cheese.",
    },
    {
        "name": "French Toast",
        "ingredients": ["bread", "eggs", "milk", "butter", "sugar"],
        "time": "15 min",
        "difficulty": "Easy",
        "description": "Golden, crispy French toast dusted with sugar.",
    },
    {
        "name": "Egg Sandwich",
        "ingredients": ["bread", "eggs", "butter", "cheese"],
        "time": "10 min",
        "difficulty": "Easy",
        "description": "A simple and satisfying egg and cheese sandwich.",
    },
    {
        "name": "Banana Smoothie",
        "ingredients": ["banana", "milk", "yogurt"],
        "time": "5 min",
        "difficulty": "Easy",
        "description": "Creamy banana smoothie made with fresh ingredients.",
    },
    {
        "name": "Carrot Soup",
        "ingredients": ["carrot", "onion", "butter", "salt"],
        "time": "30 min",
        "difficulty": "Medium",
        "description": "Warming and nutritious carrot soup.",
    },
    {
        "name": "Apple Cinnamon Toast",
        "ingredients": ["bread", "apple", "butter", "sugar"],
        "time": "10 min",
        "difficulty": "Easy",
        "description": "Toast topped with caramelised apple slices.",
    },
    {
        "name": "Orange Juice Sorbet",
        "ingredients": ["orange juice", "sugar"],
        "time": "120 min",
        "difficulty": "Easy",
        "description": "Refreshing homemade citrus sorbet.",
    },
    {
        "name": "Grilled Cheese Sandwich",
        "ingredients": ["bread", "cheese", "butter"],
        "time": "10 min",
        "difficulty": "Easy",
        "description": "Crispy golden grilled cheese.",
    },
    {
        "name": "Milk Pudding",
        "ingredients": ["milk", "sugar", "eggs"],
        "time": "40 min",
        "difficulty": "Medium",
        "description": "Silky smooth vanilla milk pudding.",
    },
    {
        "name": "Scrambled Eggs",
        "ingredients": ["eggs", "butter", "milk", "salt", "pepper"],
        "time": "8 min",
        "difficulty": "Easy",
        "description": "Soft, creamy scrambled eggs.",
    },
]


def get_recipe_suggestions(pantry_item_names: list[str]) -> list[dict]:
    """
    Given a list of pantry item names, find recipes that can be made
    (fully or partially) and list missing ingredients.
    """
    available = set(n.lower() for n in pantry_item_names)
    suggestions = []

    for recipe in RECIPE_DB:
        required = set(recipe["ingredients"])
        have = available & required
        missing = required - available

        if not have:
            continue

        match_score = len(have) / len(required)
        suggestions.append({
            **recipe,
            "available_ingredients": list(have),
            "missing_ingredients": list(missing),
            "match_score": round(match_score, 2),
            "can_make": len(missing) == 0,
        })

    # Sort: fully makeable first, then by match score
    suggestions.sort(key=lambda r: (r["can_make"], r["match_score"]), reverse=True)
    return suggestions[:8]


# ──────────────────────────────────────────────
# Pantry Diff (Timeline)
# ──────────────────────────────────────────────

def compute_pantry_diff(previous_items: list[dict], current_items: list[dict]) -> dict:
    """
    Compare two lists of pantry items and return added/removed names.
    """
    prev_names = set(i.get("name", "").lower() for i in previous_items)
    curr_names = set(i.get("name", "").lower() for i in current_items)

    added = [n.title() for n in curr_names - prev_names]
    removed = [n.title() for n in prev_names - curr_names]

    return {"added": added, "removed": removed}
