# 🥗 PantryPal AI – Virtual Smart Pantry

An AI-powered full-stack web application that turns a photo of your fridge or pantry into a fully organised, searchable digital pantry with expiry tracking, recipe suggestions, and shopping list generation.

---

## ✨ Features

| Feature | Details |
|---|---|
| **AI Pantry Scanner** | Upload any photo → YOLOv8 detects all food items automatically |
| **OCR Extraction** | EasyOCR reads product names, brands, and expiry dates from packaging |
| **Virtual Pantry** | Searchable, filterable grid with Fresh / Expiring Soon / Expired badges |
| **Pantry Timeline** | Every scan is recorded; added/removed items are highlighted |
| **Expiry Monitoring** | Live alerts for items expiring today, tomorrow, or this week |
| **Recipe Generator** | Matches pantry contents to 10+ built-in recipes, shows missing ingredients |
| **Shopping List** | Manual entry + one-click auto-generation from expired items & recipes |
| **Analytics Dashboard** | Chart.js charts: category distribution, status breakdown, waste %, top items |
| **JWT Authentication** | Register, login, personal pantry per user |
| **CouchDB** | All pantry documents stored as flexible JSON documents |

---

## 🛠 Technology Stack

- **Frontend** – React 18, Vite, Tailwind CSS, Chart.js, Framer Motion
- **Backend** – Django 4.2, Django REST Framework, Simple JWT
- **Database** – Apache CouchDB 3 (via HTTP REST API)
- **AI / CV** – YOLOv8 (Ultralytics), EasyOCR, OpenCV
- **Deployment** – Docker + Docker Compose, Gunicorn, Nginx

---

## 🚀 Quick Start (Docker)

> Requires Docker Desktop.

```bash
# 1. Clone / open the project folder
cd "virtual pantry"

# 2. Start all services
docker-compose up --build

# 3. Open the app
#    Frontend  →  http://localhost:3000
#    Backend   →  http://localhost:8000/api/
#    CouchDB   →  http://localhost:5984/_utils/
```

Register a new account and start scanning!

---

## 🖥 Local Development (no Docker)

### Prerequisites
- Python 3.10+
- Node.js 18+
- CouchDB 3 running locally (`http://localhost:5984`, user: `admin`, pass: `admin`)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file and edit if needed
copy .env.example .env

# Run migrations (for Django auth DB)
python manage.py migrate

# Create a superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Frontend

```bash
cd frontend

npm install
npm run dev
# Opens at http://localhost:3000
```

---

## 📁 Project Structure

```
virtual pantry/
├── backend/
│   ├── pantrypal/          # Django project settings
│   ├── api/
│   │   ├── views.py        # All REST API endpoints
│   │   ├── ai_service.py   # YOLOv8 detection + EasyOCR + recipes
│   │   ├── couchdb_service.py  # CouchDB CRUD layer
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── media/              # Uploaded images
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Scan, Pantry, Recipes, Shopping, Analytics, Timeline
│   │   ├── components/     # Layout, PantryItemCard, UI primitives
│   │   ├── context/        # AuthContext (JWT)
│   │   └── api/            # Axios client
│   ├── tailwind.config.js
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Create account |
| POST | `/api/auth/login/` | Get JWT tokens |
| GET  | `/api/auth/me/` | Current user |
| GET  | `/api/pantry/` | List all pantry items |
| POST | `/api/pantry/create/` | Add item manually |
| PUT  | `/api/pantry/<id>/` | Update item |
| DELETE | `/api/pantry/<id>/` | Delete item |
| POST | `/api/scan/` | Upload image → AI detection |
| POST | `/api/scan/confirm/` | Save detected items |
| GET  | `/api/scan/history/` | Scan timeline |
| GET  | `/api/analytics/` | Stats & alerts |
| GET  | `/api/recipes/` | Recipe suggestions |
| GET  | `/api/shopping-list/` | Shopping list |
| POST | `/api/shopping-list/generate/` | Auto-generate list |

---

## 📦 CouchDB Document Schema

```json
{
  "_id": "uuid",
  "type": "pantry_item",
  "user_id": "1",
  "name": "Whole Milk",
  "category": "Dairy",
  "quantity": 2,
  "unit": "L",
  "brand": "FarmFresh",
  "expiry_date": "2024-12-15",
  "date_added": "2024-11-01T10:30:00Z",
  "status": "fresh",
  "confidence": 0.92,
  "image_path": "/media/uploads/...",
  "ocr_data": { "product_name": "Whole Milk", "expiry_date": "2024-12-15" },
  "ai_metadata": {},
  "scan_session_id": "uuid",
  "notes": ""
}
```

---

## 🎯 Demo Mode

If YOLOv8 or EasyOCR are not installed, the app automatically falls back to **mock detections** — a random selection of realistic food items. This lets you demo all features without a GPU or large model download.

To install real AI models:
```bash
pip install ultralytics easyocr
# Models are downloaded automatically on first use (~6 MB for YOLOv8-nano)
```

---

## 🔐 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | (insecure dev key) | Django secret key |
| `DEBUG` | `True` | Debug mode |
| `COUCHDB_URL` | `http://localhost:5984` | CouchDB server URL |
| `COUCHDB_USER` | `admin` | CouchDB admin username |
| `COUCHDB_PASSWORD` | `admin` | CouchDB admin password |
| `COUCHDB_DB` | `pantrypal` | Database name |

---

*Built as a college mini project demonstrating practical use of computer vision, OCR, AI, and NoSQL databases.*
