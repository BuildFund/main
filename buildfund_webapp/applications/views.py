"""Views for managing applications."""
from __future__ import annotations

from rest_framework import permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import Application, ApplicationStatusHistory, ApplicationDocument
from .serializers import ApplicationSerializer
from .analysis import BorrowerAnalysisReport
from documents.models import Document
from rest_framework.parsers import MultiPartParser, FormParser


class ApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for creating and managing lender applications."""

    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Lenders see their own applications/enquiries; borrowers see applications/enquiries for their projects
        if hasattr(user, "lenderprofile"):
            return Application.objects.filter(lender=user.lenderprofile).select_related(
                "project", "project__borrower", "project__borrower__user", "product", "lender", "lender__user"
            )
        if hasattr(user, "borrowerprofile"):
            return Application.objects.filter(project__borrower=user.borrowerprofile).select_related(
                "project", "project__borrower", "project__borrower__user", "product", "lender", "lender__user"
            )
        # admins see all
        return Application.objects.all().select_related(
            "project", "project__borrower", "project__borrower__user", "product", "lender", "lender__user"
        )

    def get_permissions(self):
        # For create: borrowers can create enquiries, lenders can create applications
        if self.action == "create":
            return [permissions.IsAuthenticated()]  # Both borrowers and lenders can create
        # For update/partial_update/destroy: only the lender that owns the application,
        # the borrower whose project it is, or an admin can modify it
        if self.action in {"update", "partial_update", "destroy"}:
            return [permissions.IsAuthenticated(), self.AdminOrOwnerOrBorrowerPermission()]
        return [permissions.IsAuthenticated()]

    class LenderPermission(permissions.BasePermission):
        """Allow access only to users with a lender profile."""

        def has_permission(self, request, view) -> bool:
            return hasattr(request.user, "lenderprofile")

    class AdminOrOwnerPermission(permissions.BasePermission):
        """Allow admin or the lender who owns the application."""

        def has_object_permission(self, request, view, obj) -> bool:
            return request.user.is_superuser or (
                hasattr(request.user, "lenderprofile") and obj.lender == request.user.lenderprofile
            )
    
    class AdminOrOwnerOrBorrowerPermission(permissions.BasePermission):
        """Allow admin, the lender who owns the application, or the borrower whose project it is."""

        def has_object_permission(self, request, view, obj) -> bool:
            if request.user.is_superuser:
                return True
            if hasattr(request.user, "lenderprofile") and obj.lender == request.user.lenderprofile:
                return True
            if hasattr(request.user, "borrowerprofile") and obj.project.borrower == request.user.borrowerprofile:
                return True
            return False
    
    @action(detail=True, methods=["get"])
    def analysis(self, request, pk=None):
        """Get AI-powered borrower analysis report for an application."""
        application = self.get_object()
        
        # Only lender who owns the application or admin can view analysis
        if not (request.user.is_superuser or 
                (hasattr(request.user, "lenderprofile") and application.lender == request.user.lenderprofile)):
            return Response(
                {"error": "You do not have permission to view this analysis"},
                status=403,
            )
        
        report = BorrowerAnalysisReport.generate_report(application)
        return Response(report)
    
    def perform_create(self, serializer):
        """Create application and send notification."""
        application = serializer.save()
        
        # Record initial status in history
        ApplicationStatusHistory.objects.create(
            application=application,
            status=application.status,
            feedback="",
            changed_by=self.request.user
        )
        
        # Send email notification to borrower
        try:
            from notifications.services import EmailNotificationService
            borrower_email = application.project.borrower.user.email
            if borrower_email:
                EmailNotificationService.notify_application_received(application, borrower_email)
        except Exception as e:
            print(f"Failed to send application notification email: {e}")
        
        return application
    
    def perform_update(self, serializer):
        """Update application and send notification if status changed."""
        old_status = self.get_object().status
        application = serializer.save()
        
        # Record status change in history
        if old_status != application.status:
            ApplicationStatusHistory.objects.create(
                application=application,
                status=application.status,
                feedback=application.status_feedback or "",
                changed_by=self.request.user
            )
            application.status_changed_at = timezone.now()
            application.save(update_fields=["status_changed_at"])
        
        # Send notification if status changed to accepted
        if old_status != "accepted" and application.status == "accepted":
            try:
                from notifications.services import EmailNotificationService
                lender_email = application.lender.user.email
                if lender_email:
                    EmailNotificationService.notify_application_accepted(application, lender_email)
            except Exception as e:
                print(f"Failed to send acceptance notification email: {e}")
        
        return application
    
    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        """
        Allow lenders to update application status with feedback.
        Only lenders who own the application or admins can update status.
        """
        application = self.get_object()
        
        # Check permissions
        user = request.user
        can_update = (
            user.is_superuser or
            (hasattr(user, "lenderprofile") and application.lender == user.lenderprofile)
        )
        
        if not can_update:
            return Response(
                {"error": "You do not have permission to update this application's status"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_status = request.data.get("status")
        feedback = request.data.get("status_feedback", "")
        
        if not new_status:
            return Response(
                {"error": "status field is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status
        valid_statuses = [choice[0] for choice in Application.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = application.status
        application.update_status(new_status, feedback)
        
        # Record in history
        ApplicationStatusHistory.objects.create(
            application=application,
            status=new_status,
            feedback=feedback,
            changed_by=user
        )
        
        # Send email notifications
        try:
            from notifications.services import EmailNotificationService
            borrower_email = application.project.borrower.user.email
            if borrower_email:
                # Notify borrower of status change
                EmailNotificationService.notify_application_status_changed(
                    application, borrower_email, old_status, new_status
                )
        except Exception as e:
            print(f"Failed to send status change notification email: {e}")
        
        serializer = self.get_serializer(application)
        return Response(serializer.data)
    
    @action(detail=True, methods=["get"])
    def status_history(self, request, pk=None):
        """Get the status change history for an application."""
        application = self.get_object()
        
        # Check permissions - borrower, lender, or admin
        user = request.user
        can_view = (
            user.is_superuser or
            (hasattr(user, "lenderprofile") and application.lender == user.lenderprofile) or
            (hasattr(user, "borrowerprofile") and application.project.borrower == user.borrowerprofile)
        )
        
        if not can_view:
            return Response(
                {"error": "You do not have permission to view this application's status history"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        history = ApplicationStatusHistory.objects.filter(application=application)
        history_data = [
            {
                "status": h.status,
                "status_display": dict(Application.STATUS_CHOICES).get(h.status, h.status),
                "feedback": h.feedback,
                "changed_by": h.changed_by.username if h.changed_by else "System",
                "created_at": h.created_at.isoformat(),
            }
            for h in history
        ]
        
        return Response(history_data)
    
    @action(detail=True, methods=["get", "post"], parser_classes=[MultiPartParser, FormParser])
    def documents(self, request, pk=None):
        """Get or upload documents for an application."""
        application = self.get_object()
        
        # Check permissions - borrower, lender, or admin
        user = request.user
        can_access = (
            user.is_superuser or
            (hasattr(user, "lenderprofile") and application.lender == user.lenderprofile) or
            (hasattr(user, "borrowerprofile") and application.project.borrower == user.borrowerprofile)
        )
        
        if not can_access:
            return Response(
                {"error": "You do not have permission to access this application's documents"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if request.method == "GET":
            # List documents
            app_docs = ApplicationDocument.objects.filter(
                application=application
            ).select_related("document", "uploaded_by").order_by("-uploaded_at")
            
            documents_data = [
                {
                    "id": ad.id,
                    "document_id": ad.document.id,
                    "file_name": ad.document.file_name,
                    "file_size": ad.document.file_size,
                    "file_type": ad.document.file_type,
                    "description": ad.description,
                    "uploaded_by": ad.uploaded_by.username if ad.uploaded_by else "Unknown",
                    "uploaded_at": ad.uploaded_at.isoformat(),
                }
                for ad in app_docs
            ]
            
            return Response(documents_data)
        
        elif request.method == "POST":
            # Upload new document
            files = request.FILES.getlist("files")
            description = request.data.get("description", "")
            
            if not files:
                return Response(
                    {"error": "No files provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            uploaded_docs = []
            for file in files:
                # Create document record
                document = Document.objects.create(
                    owner=user,
                    file_name=file.name,
                    file_size=file.size,
                    file_type=file.content_type or "application/octet-stream",
                    upload_path=f"applications/{application.id}/{file.name}",
                    description=description,
                )
                
                # Link to application
                app_doc = ApplicationDocument.objects.create(
                    application=application,
                    document=document,
                    uploaded_by=user,
                    description=description,
                )
                
                uploaded_docs.append({
                    "id": app_doc.id,
                    "document_id": document.id,
                    "file_name": document.file_name,
                    "file_size": document.file_size,
                    "file_type": document.file_type,
                    "description": app_doc.description,
                    "uploaded_by": user.username,
                    "uploaded_at": app_doc.uploaded_at.isoformat(),
                })
            
            return Response({
                "message": f"Successfully uploaded {len(uploaded_docs)} document(s)",
                "documents": uploaded_docs,
            }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=["delete"], url_path="documents/(?P<doc_id>[^/.]+)")
    def delete_document(self, request, pk=None, doc_id=None):
        """Delete a document from an application."""
        application = self.get_object()
        
        # Check permissions
        user = request.user
        can_access = (
            user.is_superuser or
            (hasattr(user, "lenderprofile") and application.lender == user.lenderprofile) or
            (hasattr(user, "borrowerprofile") and application.project.borrower == user.borrowerprofile)
        )
        
        if not can_access:
            return Response(
                {"error": "You do not have permission to delete documents from this application"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            app_doc = ApplicationDocument.objects.get(id=doc_id, application=application)
            # Only allow deletion if user uploaded it or is admin
            if not (user.is_superuser or app_doc.uploaded_by == user):
                return Response(
                    {"error": "You can only delete documents you uploaded"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            document = app_doc.document
            app_doc.delete()
            document.delete()  # Also delete the document record
            
            return Response({"message": "Document deleted successfully"})
        except ApplicationDocument.DoesNotExist:
            return Response(
                {"error": "Document not found"},
                status=status.HTTP_404_NOT_FOUND
            )