from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", views.me, name="me"),

    # Pantry Items
    path("pantry/", views.pantry_list, name="pantry_list"),
    path("pantry/create/", views.pantry_create, name="pantry_create"),
    path("pantry/<str:doc_id>/", views.pantry_detail, name="pantry_detail"),

    # AI Scan
    path("scan/", views.scan_image, name="scan_image"),
    path("scan/confirm/", views.confirm_scan, name="confirm_scan"),
    path("scan/history/", views.scan_history, name="scan_history"),

    # Analytics
    path("analytics/", views.analytics, name="analytics"),

    # Recipes
    path("recipes/", views.recipes, name="recipes"),

    # Shopping List
    path("shopping-list/", views.shopping_list, name="shopping_list"),
    path("shopping-list/add/", views.shopping_list_add, name="shopping_list_add"),
    path("shopping-list/update/", views.shopping_list_update, name="shopping_list_update"),
    path("shopping-list/remove/<str:item_id>/", views.shopping_list_remove, name="shopping_list_remove"),
    path("shopping-list/generate/", views.generate_shopping_list, name="generate_shopping_list"),

    # Health
    path("health/", views.health_check, name="health_check"),
]
