from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        """Ensure CouchDB is initialised when the app starts."""
        try:
            from . import couchdb_service
            couchdb_service.ensure_database()
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning("CouchDB init skipped: %s", e)
