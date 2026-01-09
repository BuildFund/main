"""Mapping API views.

These endpoints proxy requests to Google Maps Platform services.  All
requests are made server‑side using the API key stored in
`settings.GOOGLE_API_KEY`.  Responses are returned directly to the
client.  Proper error handling ensures that missing API keys or
failed requests result in informative HTTP responses.
"""

from __future__ import annotations

import requests
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView


def call_google_api(endpoint: str, params: dict[str, str]) -> tuple[int, dict]:
    """Call a Google Maps endpoint with the configured API key.

    Returns a tuple of (status_code, response_json).
    """
    api_key = settings.GOOGLE_API_KEY
    if not api_key:
        return status.HTTP_500_INTERNAL_SERVER_ERROR, {
            "error": "GOOGLE_API_KEY is not configured on the server."
        }
    params = params.copy()
    params["key"] = api_key
    try:
        resp = requests.get(endpoint, params=params, timeout=5)
        data = resp.json()
        return resp.status_code, data
    except Exception as exc:
        return status.HTTP_502_BAD_GATEWAY, {"error": f"Failed to call Google API: {exc}"}


class AutocompleteView(APIView):
    """Provide address autocomplete suggestions using the Places API."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request) -> Response:
        query = request.query_params.get("query")
        if not query:
            return Response({"error": "query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        endpoint = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
        status_code, data = call_google_api(endpoint, {"input": query})
        return Response(data, status=status_code)


class GeocodeView(APIView):
    """Geocode an address into latitude/longitude using the Geocoding API."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request) -> Response:
        address = request.query_params.get("address")
        if not address:
            return Response({"error": "address parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        endpoint = "https://maps.googleapis.com/maps/api/geocode/json"
        status_code, data = call_google_api(endpoint, {"address": address})
        return Response(data, status=status_code)


class ReverseGeocodeView(APIView):
    """Reverse geocode latitude/longitude into an address using the Geocoding API."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request) -> Response:
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        if not lat or not lng:
            return Response(
                {"error": "lat and lng parameters are required"}, status=status.HTTP_400_BAD_REQUEST
            )
        endpoint = "https://maps.googleapis.com/maps/api/geocode/json"
        latlng = f"{lat},{lng}"
        status_code, data = call_google_api(endpoint, {"latlng": latlng})
        return Response(data, status=status_code)