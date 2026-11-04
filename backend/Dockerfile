FROM python:3.11-slim

WORKDIR /app

# System deps for OpenCV, EasyOCR
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx libglib2.0-0 libsm6 libxrender1 libxext6 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "pantrypal.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120"]
