from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Quick setup for deployment - creates super admin from environment variables'

    def handle(self, *args, **options):
        # Get credentials from environment variables
        username = os.getenv('SUPERADMIN_USERNAME', 'admin')
        email = os.getenv('SUPERADMIN_EMAIL', 'admin@bouygues.com')
        password = os.getenv('SUPERADMIN_PASSWORD', 'admin123')
        first_name = os.getenv('SUPERADMIN_FIRST_NAME', 'Super')
        last_name = os.getenv('SUPERADMIN_LAST_NAME', 'Admin')

        self.stdout.write('Setting up super admin account for deployment...')
        self.stdout.write(f'Username: {username}')
        self.stdout.write(f'Email: {email}')

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User "{username}" already exists. Updating...')
            )
            user = User.objects.get(username=username)
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.role = 'super_admin'
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)
            user.save()
        else:
            # Create new super admin
            try:
                with transaction.atomic():
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=password,
                        first_name=first_name,
                        last_name=last_name,
                        role='super_admin',
                        is_staff=True,
                        is_superuser=True,
                    )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error creating super admin: {str(e)}')
                )
                return

        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Super admin account ready!\n'
                f'   Username: {username}\n'
                f'   Email: {email}\n'
                f'   Role: super_admin\n'
                f'   You can now login to the admin panel.'
            )
        )

        # Also create default materials if they don't exist
        try:
            from calculations.services import MaterialManager
            MaterialManager.create_default_categories()
            MaterialManager.create_default_materials()
            self.stdout.write(
                self.style.SUCCESS('✅ Default materials and categories created!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'⚠️  Could not create default materials: {str(e)}')
            )
