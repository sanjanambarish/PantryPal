from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label="Confirm password")

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "password", "password2")

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")


class PantryItemSerializer(serializers.Serializer):
    """Serializer for validating pantry item input (not a DB model)."""
    name = serializers.CharField(max_length=200)
    category = serializers.CharField(max_length=100, default="Other")
    quantity = serializers.IntegerField(default=1, min_value=0)
    unit = serializers.CharField(max_length=50, default="", allow_blank=True)
    expiry_date = serializers.CharField(max_length=20, default="", allow_blank=True)
    brand = serializers.CharField(max_length=200, default="", allow_blank=True)
    notes = serializers.CharField(default="", allow_blank=True)
    status = serializers.ChoiceField(
        choices=["fresh", "expiring_soon", "expired"],
        default="fresh",
    )
