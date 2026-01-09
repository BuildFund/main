"""Email notification service."""
from __future__ import annotations

import os
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from typing import Optional


class EmailNotificationService:
    """Service for sending email notifications."""
    
    DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@buildfund.com")
    
    @staticmethod
    def send_email(
        subject: str,
        message: str,
        recipient_list: list[str],
        html_message: Optional[str] = None,
        from_email: Optional[str] = None,
    ) -> bool:
        """
        Send an email notification.
        
        Args:
            subject: Email subject
            message: Plain text message
            recipient_list: List of recipient email addresses
            html_message: Optional HTML message
            from_email: Optional sender email (defaults to DEFAULT_FROM_EMAIL)
            
        Returns:
            True if email was sent successfully, False otherwise
        """
        if not from_email:
            from_email = EmailNotificationService.DEFAULT_FROM_EMAIL
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=recipient_list,
                html_message=html_message,
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False
    
    @staticmethod
    def notify_project_approved(project, borrower_email: str) -> bool:
        """Send notification when a project is approved."""
        subject = f"Project Approved: {project.description or project.address}"
        message = f"""
Your project has been approved!

Project Details:
- Address: {project.address}, {project.town}
- Loan Amount: £{project.loan_amount_required:,.2f}
- Term: {project.term_required_months} months

You can now view matched products and apply for funding.

Best regards,
BuildFund Team
        """.strip()
        
        return EmailNotificationService.send_email(
            subject=subject,
            message=message,
            recipient_list=[borrower_email],
        )
    
    @staticmethod
    def notify_project_declined(project, borrower_email: str, reason: Optional[str] = None) -> bool:
        """Send notification when a project is declined."""
        subject = f"Project Update: {project.description or project.address}"
        message = f"""
Unfortunately, your project has been declined.

Project Details:
- Address: {project.address}, {project.town}

{f'Reason: {reason}' if reason else ''}

If you have any questions, please contact our support team.

Best regards,
BuildFund Team
        """.strip()
        
        return EmailNotificationService.send_email(
            subject=subject,
            message=message,
            recipient_list=[borrower_email],
        )
    
    @staticmethod
    def notify_product_approved(product, lender_email: str) -> bool:
        """Send notification when a product is approved."""
        subject = f"Product Approved: {product.name}"
        message = f"""
Your product has been approved and is now active!

Product Details:
- Name: {product.name}
- Funding Type: {product.get_funding_type_display()}
- Property Type: {product.get_property_type_display()}
- Loan Range: £{product.min_loan_amount:,.2f} - £{product.max_loan_amount:,.2f}

Your product will now appear in matched results for borrowers.

Best regards,
BuildFund Team
        """.strip()
        
        return EmailNotificationService.send_email(
            subject=subject,
            message=message,
            recipient_list=[lender_email],
        )
    
    @staticmethod
    def notify_application_received(application, borrower_email: str) -> bool:
        """Send notification when a lender submits an application."""
        subject = f"New Application Received for Your Project"
        message = f"""
You have received a new funding application!

Application Details:
- Lender: {application.lender.organisation_name}
- Product: {application.product.name}
- Proposed Loan: £{application.proposed_loan_amount:,.2f}
- Interest Rate: {application.proposed_interest_rate}%
- Term: {application.proposed_term_months} months

Please review the application and respond.

Best regards,
BuildFund Team
        """.strip()
        
        return EmailNotificationService.send_email(
            subject=subject,
            message=message,
            recipient_list=[borrower_email],
        )
    
    @staticmethod
    def notify_application_accepted(application, lender_email: str) -> bool:
        """Send notification when borrower accepts an application."""
        subject = f"Application Accepted: {application.product.name}"
        message = f"""
Great news! Your application has been accepted!

Application Details:
- Project: {application.project.description or application.project.address}
- Borrower: {application.project.borrower.company_name or 'N/A'}
- Proposed Loan: £{application.proposed_loan_amount:,.2f}
- Interest Rate: {application.proposed_interest_rate}%

Please contact the borrower to proceed with the next steps.

Best regards,
BuildFund Team
        """.strip()
        
        return EmailNotificationService.send_email(
            subject=subject,
            message=message,
            recipient_list=[lender_email],
        )
    
    @staticmethod
    def notify_application_status_changed(
        application, 
        borrower_email: str, 
        old_status: str, 
        new_status: str
    ) -> bool:
        """Send notification when application status changes."""
        status_labels = {
            "submitted": "Submitted",
            "opened": "Opened",
            "under_review": "Under Review",
            "further_info_required": "Further Information Required",
            "credit_check": "Credit Check/Underwriting",
            "approved": "Approved",
            "accepted": "Accepted",
            "declined": "Declined",
            "withdrawn": "Withdrawn",
            "completed": "Completed",
        }
        
        old_label = status_labels.get(old_status, old_status)
        new_label = status_labels.get(new_status, new_status)
        
        subject = f"Application Status Update: {new_label}"
        message = f"""
Your application status has been updated.

Application Details:
- Project: {application.project.description or application.project.address}
- Lender: {application.lender.organisation_name}
- Product: {application.product.name}
- Proposed Loan: £{application.proposed_loan_amount:,.2f}

Status Change:
- Previous: {old_label}
- Current: {new_label}

{f'Feedback: {application.status_feedback}' if application.status_feedback else ''}

Please log in to your dashboard to view full details.

Best regards,
BuildFund Team
        """.strip()
        
        return EmailNotificationService.send_email(
            subject=subject,
            message=message,
            recipient_list=[borrower_email],
        )
    
    @staticmethod
    def notify_new_message(message, recipient_email: str) -> bool:
        """Send notification when a new message is received."""
        subject = f"New Message: {message.subject or 'No Subject'}"
        message_text = f"""
You have received a new message from {message.sender.username}.

{f'Subject: {message.subject}' if message.subject else ''}

{message.body[:200]}{'...' if len(message.body) > 200 else ''}

View the full message in your BuildFund dashboard.

Best regards,
BuildFund Team
        """.strip()
        
        return EmailNotificationService.send_email(
            subject=subject,
            message=message_text,
            recipient_list=[recipient_email],
        )
