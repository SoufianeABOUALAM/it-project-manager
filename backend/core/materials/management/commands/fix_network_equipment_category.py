from django.core.management.base import BaseCommand
from calculations.services import MaterialManager


class Command(BaseCommand):
    help = 'Fix Network Equipment materials - move them to correct Équipement Réseau category'

    def handle(self, *args, **options):
        # Network Equipment materials that should be in "Équipement Réseau" category
        network_equipment_materials = [
            {
                'name': 'Switch 24 Ports PoE',
                'category': 'Équipement Réseau',
                'price_france': 800,
                'price_morocco': 8000,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'HP 5130-24G POE+ 4SFP+ (JG936A) - Switch 24 ports Giga PoE Cœur Hybride',
                'unit': 'unit'
            },
            {
                'name': 'Switch 48 Ports PoE',
                'category': 'Équipement Réseau',
                'price_france': 1200,
                'price_morocco': 12000,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'HP 5130 48G POE+ 4SFP+ (JG937A) - Switch 48 ports Giga PoE',
                'unit': 'unit'
            },
            {
                'name': 'DAC Cable 1m',
                'category': 'Équipement Réseau',
                'price_france': 100,
                'price_morocco': 1000,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'HPE FlexNetwork X240 10G SFP 1m (JD095C)',
                'unit': 'unit'
            },
            {
                'name': 'DAC Cable 3m',
                'category': 'Équipement Réseau',
                'price_france': 120,
                'price_morocco': 1200,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'HPE FlexNetwork X240 10 G SFP+ à SFP+ de 3m (JD097C)',
                'unit': 'unit'
            },
            {
                'name': 'Transceivers',
                'category': 'Équipement Réseau',
                'price_france': 80,
                'price_morocco': 800,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'HP X120 1G SFP RJ45 Transceiver (JD089B)',
                'unit': 'unit'
            },
            {
                'name': 'Wifi Access Point Camp',
                'category': 'Équipement Réseau',
                'price_france': 200,
                'price_morocco': 2000,
                'is_auto_calculated': False,
                'is_service': False,
                'description': 'Wifi access point for the Camp - Other brand',
                'unit': 'unit'
            },
            {
                'name': 'Wifi Access Point Indoor',
                'category': 'Équipement Réseau',
                'price_france': 300,
                'price_morocco': 3000,
                'is_auto_calculated': False,
                'is_service': False,
                'description': 'Wifi access point CISCO indoor included BYCN authentication',
                'unit': 'unit'
            },
            {
                'name': 'Wifi Access Point Outdoor',
                'category': 'Équipement Réseau',
                'price_france': 400,
                'price_morocco': 4000,
                'is_auto_calculated': False,
                'is_service': False,
                'description': 'Wifi access point CISCO outdoor included BYCN authentication',
                'unit': 'unit'
            },
            {
                'name': 'Server Dell R540',
                'category': 'Équipement Réseau',
                'price_france': 5000,
                'price_morocco': 50000,
                'is_auto_calculated': True,
                'is_service': False,
                'description': 'Dell R540, 32GB RAM, 2x480GB SSD (OS), 5x12TB (DATA), 3x4TB (DATA) - Backup repository + 2 VM',
                'unit': 'unit'
            }
        ]

        self.stdout.write('Fixing Network Equipment materials - moving to Équipement Réseau category...')
        results = MaterialManager.manage_materials(network_equipment_materials)
        
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
            self.style.SUCCESS('Network Equipment materials moved to correct Équipement Réseau category!')
        )
