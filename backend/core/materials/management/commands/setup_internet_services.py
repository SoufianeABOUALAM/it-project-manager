from django.core.management.base import BaseCommand
from calculations.services import MaterialManager


class Command(BaseCommand):
    help = 'Setup Internet Services materials with proper pricing for different types and speeds'

    def handle(self, *args, **options):
        # Internet Services materials with realistic pricing
        internet_services_materials = [
            # STARLINK Services
            {
                'name': 'STARLINK 100MBps',
                'category': 'Services',
                'price_france': 200.00,  # Monthly cost in EUR
                'price_morocco': 2000.00,  # Monthly cost in MAD
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'STARLINK Internet Connection - 100MBps download speed',
                'unit': 'month'
            },
            {
                'name': 'STARLINK 200MBps',
                'category': 'Services',
                'price_france': 350.00,
                'price_morocco': 3500.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'STARLINK Internet Connection - 200MBps download speed',
                'unit': 'month'
            },
            {
                'name': 'STARLINK 500MBps',
                'category': 'Services',
                'price_france': 600.00,
                'price_morocco': 6000.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'STARLINK Internet Connection - 500MBps download speed',
                'unit': 'month'
            },
            {
                'name': 'STARLINK 1GBps',
                'category': 'Services',
                'price_france': 1000.00,
                'price_morocco': 10000.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'STARLINK Internet Connection - 1GBps download speed',
                'unit': 'month'
            },
            
            # Fiber Optic (FO) Services
            {
                'name': 'FO 100MBps',
                'category': 'Services',
                'price_france': 150.00,
                'price_morocco': 1500.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'Fiber Optic Internet Connection - 100MBps download speed',
                'unit': 'month'
            },
            {
                'name': 'FO 200MBps',
                'category': 'Services',
                'price_france': 250.00,
                'price_morocco': 2500.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'Fiber Optic Internet Connection - 200MBps download speed',
                'unit': 'month'
            },
            {
                'name': 'FO 500MBps',
                'category': 'Services',
                'price_france': 400.00,
                'price_morocco': 4000.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'Fiber Optic Internet Connection - 500MBps download speed',
                'unit': 'month'
            },
            {
                'name': 'FO 1GBps',
                'category': 'Services',
                'price_france': 600.00,
                'price_morocco': 6000.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'Fiber Optic Internet Connection - 1GBps download speed',
                'unit': 'month'
            },
            
            # VSAT Services
            {
                'name': 'VSAT 100MBps',
                'category': 'Services',
                'price_france': 300.00,
                'price_morocco': 3000.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'VSAT Satellite Internet Connection - 100MBps download speed',
                'unit': 'month'
            },
            {
                'name': 'VSAT 200MBps',
                'category': 'Services',
                'price_france': 500.00,
                'price_morocco': 5000.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'VSAT Satellite Internet Connection - 200MBps download speed',
                'unit': 'month'
            },
            {
                'name': 'VSAT 500MBps',
                'category': 'Services',
                'price_france': 800.00,
                'price_morocco': 8000.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'VSAT Satellite Internet Connection - 500MBps download speed',
                'unit': 'month'
            },
            {
                'name': 'VSAT 1GBps',
                'category': 'Services',
                'price_france': 1200.00,
                'price_morocco': 12000.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'VSAT Satellite Internet Connection - 1GBps download speed',
                'unit': 'month'
            },
            
            # Other Internet Services
            {
                'name': 'AUTRE 100MBps',
                'category': 'Services',
                'price_france': 180.00,
                'price_morocco': 1800.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'Other Internet Connection - 100MBps download speed',
                'unit': 'month'
            },
            {
                'name': 'AUTRE 200MBps',
                'category': 'Services',
                'price_france': 300.00,
                'price_morocco': 3000.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'Other Internet Connection - 200MBps download speed',
                'unit': 'month'
            },
            {
                'name': 'AUTRE 500MBps',
                'category': 'Services',
                'price_france': 500.00,
                'price_morocco': 5000.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'Other Internet Connection - 500MBps download speed',
                'unit': 'month'
            },
            {
                'name': 'AUTRE 1GBps',
                'category': 'Services',
                'price_france': 800.00,
                'price_morocco': 8000.00,
                'is_auto_calculated': False,
                'is_service': True,
                'description': 'Other Internet Connection - 1GBps download speed',
                'unit': 'month'
            },
        ]

        self.stdout.write('Setting up Internet Services materials...')
        results = MaterialManager.manage_materials(internet_services_materials)
        
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
            self.style.SUCCESS('Internet Services materials setup completed successfully!')
        )
