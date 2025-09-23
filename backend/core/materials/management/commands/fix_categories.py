from django.core.management.base import BaseCommand
from decimal import Decimal
from materials.models import Category, Material

class Command(BaseCommand):
    help = 'Fix categories to match the exact 7 categories from the Excel spreadsheet'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔧 Fixing categories to match Excel spreadsheet...'))
        
        # Delete all existing categories and materials
        Material.objects.all().delete()
        Category.objects.all().delete()
        self.stdout.write("🗑️  Deleted all existing categories and materials")
        
        # Create the exact 7 categories from the Excel spreadsheet
        categories_data = [
            {
                'name': 'Infrastructure',
                'description': 'Cables, UPS, PDU and other infrastructure equipment'
            },
            {
                'name': 'Équipement Réseau',
                'description': 'Network equipment like switches, routers, access points, firewalls'
            },
            {
                'name': 'Équipement Serveur',
                'description': 'Server equipment and related hardware'
            },
            {
                'name': 'Appareils Utilisateur',
                'description': 'User devices like laptops, desktops, printers'
            },
            {
                'name': 'Licences Logicielles',
                'description': 'Software licenses for Windows and other applications'
            },
            {
                'name': 'Services',
                'description': 'Internet services and other subscriptions'
            },
            {
                'name': 'Visioconférence',
                'description': 'Videoconferencing equipment and endpoints'
            }
        ]
        
        created_categories = {}
        for cat_data in categories_data:
            category = Category.objects.create(
                name=cat_data['name'],
                description=cat_data['description']
            )
            created_categories[cat_data['name']] = category
            self.stdout.write(f"✅ Created category: {category.name}")
        
        # Create materials for each category based on the Excel spreadsheet
        materials_data = [
            # Infrastructure
            {
                'name': 'Câble réseau blindé Cat 6 5 m',
                'description': 'Shielded network cable Cat 6 5m',
                'category': 'Infrastructure',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            {
                'name': 'Câble réseau blindé Cat 6 2 m',
                'description': 'Shielded network cable Cat 6 2m',
                'category': 'Infrastructure',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            {
                'name': 'Câble réseau blindé Cat 6 10 m',
                'description': 'Shielded network cable Cat 6 10m',
                'category': 'Infrastructure',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            {
                'name': 'Câble réseau blindé Cat 6 0.5 m',
                'description': 'Shielded network cable Cat 6 0.5m',
                'category': 'Infrastructure',
                'price_france': Decimal('122.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            {
                'name': 'Onduleur (UPS) 3000VA',
                'description': 'UPS 3000VA',
                'category': 'Infrastructure',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            {
                'name': 'PDU (Power Distribution Unit)',
                'description': 'Power Distribution Unit',
                'category': 'Infrastructure',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            
            # Équipement Réseau
            {
                'name': 'KVM Switch',
                'description': 'Dell KVM DMPU2016-G01 16ports',
                'category': 'Équipement Réseau',
                'price_france': Decimal('1205.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            {
                'name': 'Access Point',
                'description': 'Wireless Access Point',
                'category': 'Équipement Réseau',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            {
                'name': 'Firewall Appliance',
                'description': 'Network Firewall Appliance',
                'category': 'Équipement Réseau',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            
            # Équipement Serveur
            {
                'name': 'File Server (Standard)',
                'description': 'Standard File Server',
                'category': 'Équipement Serveur',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            
            # Appareils Utilisateur
            {
                'name': 'Laptop - Office',
                'description': 'Office Laptop',
                'category': 'Appareils Utilisateur',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            {
                'name': 'Laptop - Tech',
                'description': 'Technical Laptop',
                'category': 'Appareils Utilisateur',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            {
                'name': 'Desktop - Office',
                'description': 'Office Desktop',
                'category': 'Appareils Utilisateur',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            {
                'name': 'Desktop - Tech',
                'description': 'Technical Desktop',
                'category': 'Appareils Utilisateur',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            {
                'name': 'Printer',
                'description': 'Office Printer',
                'category': 'Appareils Utilisateur',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            {
                'name': 'Traceau',
                'description': 'Plotter/Tracer',
                'category': 'Appareils Utilisateur',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            },
            
            # Licences Logicielles
            {
                'name': 'Windows Client License (Windows Pro)',
                'description': 'Windows Pro Client License',
                'category': 'Licences Logicielles',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'license'
            },
            {
                'name': 'Windows Server License',
                'description': 'Windows Server License',
                'category': 'Licences Logicielles',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'license'
            },
            
            # Services
            {
                'name': 'Internet line (STARLINK)',
                'description': 'STARLINK Internet Connection',
                'category': 'Services',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'service',
                'is_service': True
            },
            
            # Visioconférence
            {
                'name': 'Visio endpoint',
                'description': 'Videoconferencing Endpoint',
                'category': 'Visioconférence',
                'price_france': Decimal('0.00'),
                'price_morocco': Decimal('0.00'),
                'unit': 'unit'
            }
        ]
        
        created_materials = []
        for mat_data in materials_data:
            category = created_categories[mat_data['category']]
            
            material = Material.objects.create(
                name=mat_data['name'],
                description=mat_data['description'],
                category=category,
                price_france=mat_data['price_france'],
                price_morocco=mat_data['price_morocco'],
                unit=mat_data.get('unit', 'unit'),
                is_service=mat_data.get('is_service', False)
            )
            
            self.stdout.write(f"✅ Created material: {material.name} in {category.name}")
            created_materials.append(material)
        
        self.stdout.write(self.style.SUCCESS(f"\n✅ Setup complete!"))
        self.stdout.write(f"📁 Categories created: {len(created_categories)}")
        self.stdout.write(f"📦 Materials created: {len(created_materials)}")
        self.stdout.write(f"📊 Total categories in database: {Category.objects.count()}")
        self.stdout.write(f"📊 Total materials in database: {Material.objects.count()}")
        
        # Show materials per category
        self.stdout.write("\n📋 Materials per category:")
        for category in Category.objects.all():
            count = Material.objects.filter(category=category).count()
            self.stdout.write(f"  - {category.name}: {count} materials")
