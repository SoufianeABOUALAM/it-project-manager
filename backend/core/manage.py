#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
        # Attempt to auto-seed categories/materials for common commands
        # Do this best-effort and ignore if DB isn't ready yet
        if len(sys.argv) > 1 and sys.argv[1] in {'runserver', 'shell', 'createsuperuser'}:
            try:
                import django
                django.setup()
                # Import seeding scripts and execute best-effort
                # 1) Cleanup legacy categories/materials so they never reappear
                try:
                    import cleanup_legacy_categories as cleanup
                    cleanup.run_cleanup()
                except Exception:
                    pass
                try:
                    import setup_it_infrastructure_data as seed_infra
                    seed_infra.main()
                except Exception:
                    # Ignore any failure silently to not block normal commands
                    pass
                try:
                    import setup_missing_materials as seed_missing
                    seed_missing.add_missing_materials()
                except Exception:
                    pass
            except Exception:
                # If anything goes wrong (e.g., migrations not applied), continue
                pass
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
