# Generated migration to populate project_reference for existing projects

from django.db import migrations
import random
import string


def generate_reference():
    """Generate a unique 6-character alphanumeric reference."""
    chars = string.ascii_uppercase.replace('I', '').replace('O', '') + '23456789'
    return ''.join(random.choices(chars, k=6))


def populate_references(apps, schema_editor):
    """Populate project_reference for existing projects that don't have one."""
    Project = apps.get_model('projects', 'Project')
    existing_refs = set(Project.objects.exclude(project_reference='').values_list('project_reference', flat=True))
    
    for project in Project.objects.filter(project_reference=''):
        max_attempts = 100
        for _ in range(max_attempts):
            ref = generate_reference()
            if ref not in existing_refs:
                project.project_reference = ref
                project.save(update_fields=['project_reference'])
                existing_refs.add(ref)
                break


def reverse_populate_references(apps, schema_editor):
    """Reverse migration - clear references (optional, for rollback)."""
    Project = apps.get_model('projects', 'Project')
    Project.objects.update(project_reference='')


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_project_project_reference'),
    ]

    operations = [
        migrations.RunPython(populate_references, reverse_populate_references),
    ]
