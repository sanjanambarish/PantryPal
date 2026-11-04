# Django models – only used for user authentication.
# All pantry data lives in CouchDB via couchdb_service.py
from django.db import models


class UserProfile(models.Model):
    """Extended user profile."""
    user = models.OneToOneField(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="profile",
    )
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile({self.user.username})"
