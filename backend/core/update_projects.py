#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from projects.models import Project

def update_all_projects():
    """Update all existing projects with correct progress and priority values"""
    projects = Project.objects.all()
    
    print(f"Found {projects.count()} projects to update...")
    
    for project in projects:
        # Update progress based on status
        old_progress = project.progress
        project.progress = project.calculate_progress_from_status()
        
        # Update priority if it's still default
        old_priority = project.priority
        if project.priority == 'medium':
            project.priority = project.calculate_priority_from_data()
        
        # Save the project (this will trigger the save method)
        project.save()
        
        print(f"Updated project '{project.name}':")
        print(f"  Status: {project.status}")
        print(f"  Progress: {old_progress}% → {project.progress}%")
        print(f"  Priority: {old_priority} → {project.priority}")
        print()
    
    print("All projects updated successfully!")

if __name__ == "__main__":
    update_all_projects()
