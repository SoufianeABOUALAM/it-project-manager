from django.core.management.base import BaseCommand
from calculations.services import MaterialManager


class Command(BaseCommand):
    help = 'Fix Server Equipment materials - move them to correct Équipement Serveur category'

    def handle(self, *args, **options):
        # Server Equipment materials that should be in "Équipement Serveur" category
        server_equipment_materials = [
            {
                'name': 'Server Dell R540',
                'category': 'Équipement Serveur',
                'price_france': 5000,
                'price_morocco': 50000,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'Dell R540, 32GB RAM, 2x480GB SSD (OS), 5x12TB (DATA), 3x4TB (DATA) - Backup repository + 2 VM',
                'unit': 'unit'
            },
            {
                'name': 'Virtual Machine Config',
                'category': 'Équipement Serveur',
                'price_france': 1000,
                'price_morocco': 10000,
                'is_auto_calculated': False,
                'is_service': False,
                'description': 'File server + SQL + (Define other Server apps to install) - Virtual Machine configuration',
                'unit': 'unit'
            }
        ]

        self.stdout.write('Fixing Server Equipment materials - moving to Équipement Serveur category...')
        results = MaterialManager.manage_materials(server_equipment_materials)
        
        # Display results
        self.stdout.write(
            self.style.SUCCESS(f"✅ Created: {results['created']} materials")
        )
        self.stdout.write(
            self.style.SUCCESS(f"✅ Updated: {results['updated']} materials")
        )
        self.stdout.write(
            self.style.SUCCESS(f"✅ Moved: {results['moved']} materials")
        )
        
        if results['errors']:
            self.stdout.write(
                self.style.ERROR(f"❌ Errors: {len(results['errors'])}")
            )
            for error in results['errors']:
                self.stdout.write(self.style.ERROR(f"  - {error}"))
        
        self.stdout.write(
            self.style.SUCCESS('Server Equipment materials moved to correct Équipement Serveur category!')
        )
