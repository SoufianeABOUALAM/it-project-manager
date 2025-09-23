from django.core.management.base import BaseCommand
from calculations.services import MaterialManager


class Command(BaseCommand):
    help = 'Fix Infrastructure Equipment materials - move them to correct Infrastructure Equipment category'

    def handle(self, *args, **options):
        # Infrastructure Equipment materials that should be in "Infrastructure Equipment" category
        infrastructure_equipment_materials = [
            {
                'name': 'Rack',
                'category': 'Infrastructure Equipment',
                'price_france': 500,
                'price_morocco': 5000,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'APC Easy Rack ER6212 - Rack armoire - noir - 42U - 19"',
                'unit': 'unit'
            },
            {
                'name': 'UPS',
                'category': 'Infrastructure Equipment',
                'price_france': 400,
                'price_morocco': 4000,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'Dell Smart-UPS 3000VA LCD RM - onduleur - 2700-watt - 3000 VA',
                'unit': 'unit'
            },
            {
                'name': 'PDU',
                'category': 'Infrastructure Equipment',
                'price_france': 150,
                'price_morocco': 1500,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'PDU APC (AP9559) Basic Monophase 16A - 1',
                'unit': 'unit'
            }
        ]

        self.stdout.write('Fixing Infrastructure Equipment materials - moving to Infrastructure Equipment category...')
        results = MaterialManager.manage_materials(infrastructure_equipment_materials)
        
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
            self.style.SUCCESS('Infrastructure Equipment materials moved to correct Infrastructure Equipment category!')
        )
