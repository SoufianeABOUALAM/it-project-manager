from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.db import transaction
import getpass

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a super admin account with super_admin role'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            help='Username for the super admin account',
        )
        parser.add_argument(
            '--email',
            type=str,
            help='Email for the super admin account',
        )
        parser.add_argument(
            '--password',
            type=str,
            help='Password for the super admin account (not recommended for production)',
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='',
            help='First name for the super admin account',
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='',
            help='Last name for the super admin account',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force creation even if user already exists',
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        force = options['force']

        # Interactive mode if username not provided
        if not username:
            username = input('Enter username: ').strip()
            if not username:
                raise CommandError('Username is required')

        # Interactive mode if email not provided
        if not email:
            email = input('Enter email: ').strip()
            if not email:
                raise CommandError('Email is required')

        # Interactive mode if password not provided
        if not password:
            password = getpass.getpass('Enter password: ')
            if not password:
                raise CommandError('Password is required')
            
            # Confirm password
            password_confirm = getpass.getpass('Confirm password: ')
            if password != password_confirm:
                raise CommandError('Passwords do not match')

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            if not force:
                raise CommandError(f'User "{username}" already exists. Use --force to overwrite.')
            else:
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
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully updated super admin: {username}')
                )
                return

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            raise CommandError(f'Email "{email}" is already in use')

        # Create the super admin user
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
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully created super admin account:\n'
                        f'  Username: {username}\n'
                        f'  Email: {email}\n'
                        f'  Role: super_admin\n'
                        f'  Staff: True\n'
                        f'  Superuser: True'
                    )
                )
                
        except Exception as e:
            raise CommandError(f'Error creating super admin: {str(e)}')

    def get_help_text(self):
        return """
Create a super admin account with super_admin role.

Examples:
  # Interactive mode (recommended)
  python manage.py create_superadmin

  # Command line mode
  python manage.py create_superadmin --username admin --email admin@example.com --password secret123

  # With additional details
  python manage.py create_superadmin --username admin --email admin@example.com --first-name Admin --last-name User

  # Force update existing user
  python manage.py create_superadmin --username admin --email admin@example.com --force

Note: For production deployment, use interactive mode to avoid password in command history.
        """
