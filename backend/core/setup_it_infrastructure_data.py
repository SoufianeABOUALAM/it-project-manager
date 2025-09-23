#!/usr/bin/env python
"""
Script to populate the database with IT Infrastructure categories and materials
based on the provided spreadsheet structure.
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from materials.models import Category, Material

def create_categories():
    """Create the IT Infrastructure categories"""
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
        },
        {
            'name': 'User Devices',
            'description': 'User devices and equipment'
        }
    ]
    
    created_categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        created_categories[cat_data['name']] = category
        if created:
            print(f"✅ Created category: {category.name}")
        else:
            print(f"ℹ️  Category already exists: {category.name}")
    
    return created_categories

def create_materials(categories):
    """Create materials based on the spreadsheet data"""
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
        },
        
        # User Devices - Auto-calculated materials
        {
            'name': 'Screen 24',
            'description': '24 inch monitor for users',
            'category': 'User Devices',
            'price_france': Decimal('200.00'),
            'price_morocco': Decimal('2000.00'),
            'unit': 'unit',
            'is_auto_calculated': True,
            'calculation_type': 'PER_USER',
            'multiplier': Decimal('1.5')
        },
        {
            'name': 'Keyboard + Mouse',
            'description': 'Keyboard and mouse set for users',
            'category': 'User Devices',
            'price_france': Decimal('50.00'),
            'price_morocco': Decimal('500.00'),
            'unit': 'set',
            'is_auto_calculated': True,
            'calculation_type': 'PER_USER',
            'multiplier': Decimal('1.5')
        },
        {
            'name': 'Docking Station',
            'description': 'Docking station for laptops',
            'category': 'User Devices',
            'price_france': Decimal('150.00'),
            'price_morocco': Decimal('1500.00'),
            'unit': 'unit',
            'is_auto_calculated': True,
            'calculation_type': 'PER_SERVER',
            'multiplier': Decimal('1.0')
        },
        
        # Services - SD-WAN materials
        {
            'name': 'SD-WAN MX67',
            'description': 'SD-WAN appliance for small offices (up to 50 users)',
            'category': 'Services',
            'price_france': Decimal('800.00'),
            'price_morocco': Decimal('8000.00'),
            'unit': 'unit',
            'is_auto_calculated': True,
            'is_service': True,
            'calculation_type': 'CONDITIONAL',
            'multiplier': Decimal('1.0'),
            'conditions': {'max_users': 50}
        },
        {
            'name': 'SD-WAN MX75',
            'description': 'SD-WAN appliance for medium offices (51-200 users)',
            'category': 'Services',
            'price_france': Decimal('1200.00'),
            'price_morocco': Decimal('12000.00'),
            'unit': 'unit',
            'is_auto_calculated': True,
            'is_service': True,
            'calculation_type': 'CONDITIONAL',
            'multiplier': Decimal('1.0'),
            'conditions': {'min_users': 51, 'max_users': 200}
        },
        {
            'name': 'SD-WAN MX95',
            'description': 'SD-WAN appliance for large offices (200+ users)',
            'category': 'Services',
            'price_france': Decimal('1800.00'),
            'price_morocco': Decimal('18000.00'),
            'unit': 'unit',
            'is_auto_calculated': True,
            'is_service': True,
            'calculation_type': 'CONDITIONAL',
            'multiplier': Decimal('1.0'),
            'conditions': {'min_users': 201}
        }
    ]
    
    created_materials = []
    for mat_data in materials_data:
        category = categories[mat_data['category']]
        
        material, created = Material.objects.get_or_create(
            name=mat_data['name'],
            defaults={
                'description': mat_data['description'],
                'category': category,
                'price_france': mat_data['price_france'],
                'price_morocco': mat_data['price_morocco'],
                'unit': mat_data.get('unit', 'unit'),
                'is_service': mat_data.get('is_service', False),
                'is_auto_calculated': mat_data.get('is_auto_calculated', False),
                'calculation_type': mat_data.get('calculation_type', 'FIXED'),
                'multiplier': mat_data.get('multiplier', Decimal('1.0')),
                'conditions': mat_data.get('conditions', {})
            }
        )
        
        if created:
            print(f"✅ Created material: {material.name} in {category.name}")
            created_materials.append(material)
        else:
            print(f"ℹ️  Material already exists: {material.name}")
    
    return created_materials

def main():
    """Main function to setup IT Infrastructure data"""
    print("🚀 Setting up IT Infrastructure categories and materials...")
    print("=" * 60)
    
    # Create categories
    print("\n📁 Creating categories...")
    categories = create_categories()
    
    # Create materials
    print("\n📦 Creating materials...")
    materials = create_materials(categories)
    
    print("\n" + "=" * 60)
    print(f"✅ Setup complete!")
    print(f"📁 Categories created: {len(categories)}")
    print(f"📦 Materials created: {len(materials)}")
    print(f"📊 Total categories in database: {Category.objects.count()}")
    print(f"📊 Total materials in database: {Material.objects.count()}")

if __name__ == '__main__':
    main()
