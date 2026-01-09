"""Model definition for uploaded documents."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class Document(models.Model):
    """Represents an uploaded file owned by a user."""

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    file_type = models.CharField(max_length=50)
    upload_path = models.CharField(max_length=512)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self) -> str:  # pragma: no cover
        return f"Document({self.file_name})"