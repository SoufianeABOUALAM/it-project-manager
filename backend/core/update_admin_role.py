#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User

# Update admin user to super_admin role
try:
    admin_user = User.objects.get(username='admin')
    admin_user.role = 'super_admin'
    admin_user.save()
    print(f"Updated {admin_user.username} to {admin_user.role} role")
except User.DoesNotExist:
    print("Admin user not found")

