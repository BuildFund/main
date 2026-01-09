"""Management command to populate document types."""
from django.core.management.base import BaseCommand
from documents.models import DocumentType


class Command(BaseCommand):
    help = 'Populate document types for loan applications'

    def handle(self, *args, **options):
        document_types = [
            # Identity Documents
            {
                "name": "Passport",
                "category": "identity",
                "description": "Valid passport for identity verification",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": True,
                "max_file_size_mb": 5,
                "allowed_file_types": ["application/pdf", "image/jpeg", "image/png"],
            },
            {
                "name": "Driving Licence",
                "category": "identity",
                "description": "UK driving licence (front and back)",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": False,
                "max_file_size_mb": 5,
                "allowed_file_types": ["application/pdf", "image/jpeg", "image/png"],
            },
            {
                "name": "National ID Card",
                "category": "identity",
                "description": "National ID card (if applicable)",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": False,
                "max_file_size_mb": 5,
                "allowed_file_types": ["application/pdf", "image/jpeg", "image/png"],
            },
            # Address Verification
            {
                "name": "Utility Bill",
                "category": "address",
                "description": "Recent utility bill (gas, electricity, water) dated within last 3 months",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": True,
                "max_file_size_mb": 10,
                "allowed_file_types": ["application/pdf", "image/jpeg", "image/png"],
            },
            {
                "name": "Bank Statement",
                "category": "address",
                "description": "Bank statement showing address (dated within last 3 months)",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": False,
                "max_file_size_mb": 10,
                "allowed_file_types": ["application/pdf", "image/jpeg", "image/png"],
            },
            # Financial Documents
            {
                "name": "Bank Statements (3 months)",
                "category": "financial",
                "description": "Last 3 months of business/personal bank statements",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": True,
                "max_file_size_mb": 20,
                "allowed_file_types": ["application/pdf"],
            },
            {
                "name": "Company Accounts",
                "category": "financial",
                "description": "Latest company accounts (last 2-3 years if available)",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": True,
                "max_file_size_mb": 20,
                "allowed_file_types": ["application/pdf"],
            },
            {
                "name": "Management Accounts",
                "category": "financial",
                "description": "Management accounts (if available)",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": False,
                "max_file_size_mb": 20,
                "allowed_file_types": ["application/pdf"],
            },
            {
                "name": "Tax Returns",
                "category": "financial",
                "description": "Last 2-3 years of tax returns",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": False,
                "max_file_size_mb": 10,
                "allowed_file_types": ["application/pdf"],
            },
            {
                "name": "Profit & Loss Statement",
                "category": "financial",
                "description": "Profit & Loss statement",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": False,
                "max_file_size_mb": 10,
                "allowed_file_types": ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
            },
            {
                "name": "Balance Sheet",
                "category": "financial",
                "description": "Balance sheet",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": False,
                "max_file_size_mb": 10,
                "allowed_file_types": ["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
            },
            # Company Documents
            {
                "name": "Certificate of Incorporation",
                "category": "company",
                "description": "Company certificate of incorporation",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": True,
                "max_file_size_mb": 10,
                "allowed_file_types": ["application/pdf", "image/jpeg", "image/png"],
            },
            {
                "name": "Memorandum & Articles of Association",
                "category": "company",
                "description": "Memorandum and Articles of Association",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": False,
                "max_file_size_mb": 10,
                "allowed_file_types": ["application/pdf"],
            },
            {
                "name": "Directors Register",
                "category": "company",
                "description": "Register of directors",
                "required_for_loan_types": ["business_finance", "construction_finance"],
                "is_required": False,
                "max_file_size_mb": 10,
                "allowed_file_types": ["application/pdf"],
            },
            # Property Documents (for construction/development finance)
            {
                "name": "Property Valuation",
                "category": "property",
                "description": "Professional property valuation report",
                "required_for_loan_types": ["construction_finance"],
                "is_required": True,
                "max_file_size_mb": 20,
                "allowed_file_types": ["application/pdf"],
            },
            {
                "name": "Planning Permission",
                "category": "property",
                "description": "Planning permission documents",
                "required_for_loan_types": ["construction_finance"],
                "is_required": True,
                "max_file_size_mb": 20,
                "allowed_file_types": ["application/pdf"],
            },
            {
                "name": "Building Regulations Approval",
                "category": "property",
                "description": "Building regulations approval",
                "required_for_loan_types": ["construction_finance"],
                "is_required": False,
                "max_file_size_mb": 20,
                "allowed_file_types": ["application/pdf"],
            },
            {
                "name": "Property Title Deeds",
                "category": "property",
                "description": "Property title deeds",
                "required_for_loan_types": ["construction_finance"],
                "is_required": False,
                "max_file_size_mb": 20,
                "allowed_file_types": ["application/pdf"],
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for dt_data in document_types:
            dt, created = DocumentType.objects.update_or_create(
                name=dt_data["name"],
                defaults=dt_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created document type: {dt.name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'Updated document type: {dt.name}'))
        
        self.stdout.write(self.style.SUCCESS(
            f'\nSuccessfully populated document types: {created_count} created, {updated_count} updated'
        ))
