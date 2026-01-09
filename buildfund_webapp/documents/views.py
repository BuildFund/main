"""Views for managing documents."""
from __future__ import annotations

from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for listing and creating documents."""

    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Document.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def upload(self, request):
        """Upload one or more files."""
        files = request.FILES.getlist('files')
        if not files:
            return Response(
                {"error": "No files provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        uploaded_documents = []
        for file in files:
            document = Document.objects.create(
                owner=request.user,
                file_name=file.name,
                file_size=file.size,
                file_type=file.content_type or 'application/octet-stream',
                upload_path=f"uploads/{request.user.id}/{file.name}",
            )
            # In production, save file to S3 or local storage
            # For now, we just create the record
            uploaded_documents.append(DocumentSerializer(document).data)
        
        return Response({
            "message": f"Successfully uploaded {len(uploaded_documents)} file(s)",
            "documents": uploaded_documents,
        }, status=status.HTTP_201_CREATED)