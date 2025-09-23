#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User

# Check admin user
try:
    admin_user = User.objects.get(username='admin')
    print(f"Admin user found:")
    print(f"Username: {admin_user.username}")
    print(f"Email: {admin_user.email}")
    print(f"Role: {admin_user.role}")
    print(f"Is Active: {admin_user.is_active}")
    print(f"Is Staff: {admin_user.is_staff}")
    print(f"Is Superuser: {admin_user.is_superuser}")
    print(f"Is Admin: {admin_user.is_admin}")
    print(f"Is Super Admin: {admin_user.is_super_admin}")
    
    # Test password
    if admin_user.check_password('admin'):
        print("✅ Password 'admin' is correct")
    else:
        print("❌ Password 'admin' is incorrect")
        
    # Reset password to be sure
    admin_user.set_password('admin123')
    admin_user.save()
    print("🔧 Password reset to 'admin123'")
    
    # Make sure user is active and has proper permissions
    admin_user.is_active = True
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.role = 'super_admin'
    admin_user.save()
    print("🔧 User permissions updated")
    
    print(f"\n📋 Login Credentials:")
    print(f"Username: {admin_user.username}")
    print(f"Password: admin123")
    print(f"Role: {admin_user.role}")
    
except User.DoesNotExist:
    print("❌ Admin user not found! Creating new one...")
    admin_user = User.objects.create_user(
        username='admin',
        email='admin@gmail.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        role='super_admin',
        is_active=True,
        is_staff=True,
        is_superuser=True
    )
    print(f"✅ Admin user created successfully!")
    print(f"Username: {admin_user.username}")
    print(f"Password: admin123")
    print(f"Role: {admin_user.role}")
    
except Exception as e:
    print(f"❌ Error: {e}")



