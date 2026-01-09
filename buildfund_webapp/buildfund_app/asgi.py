"""
ASGI config for the BuildFund project.

This module exposes the ASGI callable as a module-level variable
named ``application``.  It allows asynchronous servers to serve the
Django application and handle WebSocket and HTTP traffic.
"""
from __future__ import annotations

import os

from django.core.asgi import get_asgi_application  # type: ignore


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "buildfund_app.settings")

application = get_asgi_application()