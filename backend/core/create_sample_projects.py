#!/usr/bin/env python
import os
import sys
import django
from datetime import date, timedelta

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User
from projects.models import Project

def create_sample_projects():
    """Create sample projects for testing"""
    
    # Get or create a test user
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'user'
        }
    )
    
    # Get or create an admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin'
        }
    )
    
    # Create sample projects
    projects_data = [
        {
            'name': 'Office Renovation Project',
            'company_name': 'Bouygues Construction',
            'entity': 'BOUYGUES_CONSTRUCTION',
            'start_date': date.today(),
            'end_date': date.today() + timedelta(days=90),
            'number_of_users': 25,
            'num_laptop_office': 15,
            'num_laptop_tech': 5,
            'num_desktop_office': 8,
            'num_desktop_tech': 2,
            'num_printers': 3,
            'num_traceau': 5,
            'num_videoconference': 2,
            'num_aps': 4,
            'file_server': True,
            'internet_line_speed': '100MBps',
            'local_apps': True,
            'local_apps_list': 'SAGE, GMAO, AutoCAD',
            'site_addresses': '123 Main Street, Paris, France',
            'gps_coordinates': '48.8566, 2.3522',
            'created_by': user
        },
        {
            'name': 'New Construction Site IT Setup',
            'company_name': 'Bouygues Construction',
            'entity': 'BOUYGUES_CONSTRUCTION',
            'start_date': date.today() + timedelta(days=30),
            'end_date': date.today() + timedelta(days=180),
            'number_of_users': 50,
            'num_laptop_office': 30,
            'num_laptop_tech': 10,
            'num_desktop_office': 15,
            'num_desktop_tech': 5,
            'num_printers': 6,
            'num_traceau': 10,
            'num_videoconference': 4,
            'num_aps': 8,
            'file_server': True,
            'internet_line_speed': '500MBps',
            'local_apps': True,
            'local_apps_list': 'SAGE, GMAO, Revit, AutoCAD',
            'site_addresses': '456 Construction Ave, Lyon, France',
            'gps_coordinates': '45.7640, 4.8357',
            'created_by': admin_user
        },
        {
            'name': 'Remote Office Setup',
            'company_name': 'Bouygues Construction Morocco',
            'entity': 'BOUYGUES_CONSTRUCTION',
            'start_date': date.today() - timedelta(days=30),
            'end_date': date.today() + timedelta(days=60),
            'number_of_users': 15,
            'num_laptop_office': 10,
            'num_laptop_tech': 3,
            'num_desktop_office': 5,
            'num_desktop_tech': 2,
            'num_printers': 2,
            'num_traceau': 3,
            'num_videoconference': 1,
            'num_aps': 2,
            'file_server': False,
            'internet_line_speed': '50MBps',
            'local_apps': False,
            'local_apps_list': '',
            'site_addresses': '789 Business District, Casablanca, Morocco',
            'gps_coordinates': '33.5731, -7.5898',
            'created_by': user
        },
        {
            'name': 'TF1 Broadcasting Center Upgrade',
            'company_name': 'TF1 Group',
            'entity': 'TF1',
            'start_date': date.today() + timedelta(days=15),
            'end_date': date.today() + timedelta(days=120),
            'number_of_users': 40,
            'num_laptop_office': 20,
            'num_laptop_tech': 8,
            'num_desktop_office': 12,
            'num_desktop_tech': 6,
            'num_printers': 4,
            'num_traceau': 8,
            'num_videoconference': 6,
            'num_aps': 12,
            'file_server': True,
            'internet_line_speed': '1GBps',
            'local_apps': True,
            'local_apps_list': 'Adobe Creative Suite, Avid Media Composer, Final Cut Pro',
            'site_addresses': '1 Quai du Point du Jour, Boulogne-Billancourt, France',
            'gps_coordinates': '48.8355, 2.2413',
            'created_by': admin_user
        },
        {
            'name': 'Colas Road Infrastructure IT',
            'company_name': 'Colas',
            'entity': 'COLAS',
            'start_date': date.today() - timedelta(days=15),
            'end_date': date.today() + timedelta(days=75),
            'number_of_users': 30,
            'num_laptop_office': 18,
            'num_laptop_tech': 6,
            'num_desktop_office': 10,
            'num_desktop_tech': 4,
            'num_printers': 5,
            'num_traceau': 6,
            'num_videoconference': 3,
            'num_aps': 8,
            'file_server': True,
            'internet_line_speed': '200MBps',
            'local_apps': True,
            'local_apps_list': 'AutoCAD Civil 3D, Bentley MicroStation, Primavera P6',
            'site_addresses': '1 Rue du Colonel Pierre Avia, Paris, France',
            'gps_coordinates': '48.8566, 2.3522',
            'created_by': user
        }
    ]
    
    created_count = 0
    for project_data in projects_data:
        project, created = Project.objects.get_or_create(
            name=project_data['name'],
            defaults=project_data
        )
        if created:
            created_count += 1
            print(f"✅ Created project: {project.name}")
        else:
            print(f"⚠️  Project already exists: {project.name}")
    
    print(f"\n🎉 Created {created_count} new projects!")
    print(f"📊 Total projects in database: {Project.objects.count()}")
    print(f"👥 Total users in database: {User.objects.count()}")

if __name__ == '__main__':
    create_sample_projects()

