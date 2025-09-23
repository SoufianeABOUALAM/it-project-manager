from django.core.management.base import BaseCommand
from calculations.services import MaterialManager


class Command(BaseCommand):
    help = 'Update Infrastructure Equipment materials with proper categories and descriptions'

    def handle(self, *args, **options):
        # Infrastructure Equipment materials
        infrastructure_materials = [
            {
                'name': 'Rack',
                'category': 'Infrastructure',
                'price_france': 500,
                'price_morocco': 5000,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'APC Easy Rack ER6212 - Rack armoire - noir - 42U - 19"',
                'unit': 'unit'
            },
            {
                'name': 'UPS',
                'category': 'Infrastructure',
                'price_france': 400,
                'price_morocco': 4000,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'Dell Smart-UPS 3000VA LCD RM - onduleur - 2700-watt - 3000 VA',
                'unit': 'unit'
            },
            {
                'name': 'Network Cables 0.5m',
                'category': 'Réseau',
                'price_france': 10,
                'price_morocco': 100,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'Câbles réseaux blindés Cat 6 0,5 m (Shielded network cables Cat 6 0.5 m)',
                'unit': 'unit'
            },
            {
                'name': 'Network Cables 2m',
                'category': 'Réseau',
                'price_france': 15,
                'price_morocco': 150,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'Câbles réseaux blindés Cat 6 2 m (Shielded network cables Cat 6 2 m)',
                'unit': 'unit'
            },
            {
                'name': 'Network Cables 5m',
                'category': 'Réseau',
                'price_france': 25,
                'price_morocco': 250,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'Câbles réseaux blindés Cat 6 5 m (Shielded network cables Cat 6 5 m)',
                'unit': 'unit'
            },
            {
                'name': 'Network Cables 10m',
                'category': 'Réseau',
                'price_france': 40,
                'price_morocco': 400,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'Câbles réseaux blindés Cat 6 10 m (Shielded network cables Cat 6 10 m)',
                'unit': 'unit'
            },
            {
                'name': 'KVM Console',
                'category': 'Réseau',
                'price_france': 300,
                'price_morocco': 3000,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'Dell Console KMM a Technologie LED Dell DKMMLED 185-204 de 18.5 po',
                'unit': 'unit'
            },
            {
                'name': 'KVM Switch',
                'category': 'Réseau',
                'price_france': 250,
                'price_morocco': 2500,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'Dell KVM DMPU2016-G01 16ports',
                'unit': 'unit'
            },
            {
                'name': 'KVM Cables',
                'category': 'Réseau',
                'price_france': 50,
                'price_morocco': 500,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'Dell Cables USB for KVM DMPUIQ-VMCHS',
                'unit': 'unit'
            },
            {
                'name': 'PDU',
                'category': 'Infrastructure',
                'price_france': 150,
                'price_morocco': 1500,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'PDU APC (AP9559) Basic Monophase 16A - 1',
                'unit': 'unit'
            }
        ]

        self.stdout.write('Processing Infrastructure Equipment materials...')
        results = MaterialManager.manage_materials(infrastructure_materials)
        
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
            self.style.SUCCESS('Infrastructure Equipment materials processed successfully!')
        )
