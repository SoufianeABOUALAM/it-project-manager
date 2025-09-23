#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'core'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User

def create_admin_user():
    """Create a super admin user"""
    
    # Create super admin user
    admin_user, created = User.objects.get_or_create(
        username='superadmin',
        defaults={
            'email': 'admin@bouygues.com',
            'first_name': 'Super',
            'last_name': 'Admin',
            'role': 'super_admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"✅ Created super admin user: {admin_user.username}")
    else:
        # Update existing user
        admin_user.set_password('admin123')
        admin_user.role = 'super_admin'
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        print(f"✅ Updated super admin user: {admin_user.username}")
    
    print(f"🔑 Username: {admin_user.username}")
    print(f"🔑 Password: admin123")
    print(f"👤 Role: {admin_user.role}")
    print(f"📧 Email: {admin_user.email}")

if __name__ == '__main__':
    create_admin_user()

