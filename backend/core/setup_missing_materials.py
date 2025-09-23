#!/usr/bin/env python
"""
Script to add missing materials that the project form needs
Run this from the backend/core directory: python setup_missing_materials.py
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from materials.models import Material, Category

def add_missing_materials():
    """Add materials that the project form needs but might be missing"""
    
    # Materials that the form expects to exist
    required_materials = [
        # User-specified equipment
        {
            'name': 'Laptop - Office',
            'category': 'Appareils Utilisateur',
            'price_france': 12.00,
            'price_morocco': 127.20,
            'description': 'Office Laptop',
            'unit': 'unit'
        },
        {
            'name': 'Laptop - Tech',
            'category': 'Appareils Utilisateur',
            'price_france': 5.00,
            'price_morocco': 53.00,
            'description': 'Technical Laptop',
            'unit': 'unit'
        },
        {
            'name': 'Desktop - Office',
            'category': 'Appareils Utilisateur',
            'price_france': 3.00,
            'price_morocco': 33.60,
            'description': 'Office Desktop',
            'unit': 'unit'
        },
        {
            'name': 'Desktop - Tech',
            'category': 'Appareils Utilisateur',
            'price_france': 2.23,
            'price_morocco': 25.00,
            'description': 'Technical Desktop',
            'unit': 'unit'
        },
        {
            'name': 'Printer',
            'category': 'Appareils Utilisateur',
            'price_france': 1.00,
            'price_morocco': 10.60,
            'description': 'Printer',
            'unit': 'unit'
        },
        {
            'name': 'Access Point',
            'category': 'Équipement Réseau',
            'price_france': 150.00,
            'price_morocco': 1500.00,
            'description': 'Wireless Access Point',
            'unit': 'unit'
        },
        {
            'name': 'Traceau',
            'category': 'Appareils Utilisateur',
            'price_france': 1.00,
            'price_morocco': 10.60,
            'description': 'Traceau Device',
            'unit': 'unit'
        },
        {
            'name': 'Visio endpoint',
            'category': 'Appareils Utilisateur',
            'price_france': 500.00,
            'price_morocco': 5000.00,
            'description': 'Videoconferencing Endpoint',
            'unit': 'unit'
        },
        
        # Auto-calculated infrastructure
        {
            'name': 'Rack',
            'category': 'Infrastructure',
            'price_france': 500.00,
            'price_morocco': 5000.00,
            'description': 'Server Rack',
            'unit': 'unit'
        },
        {
            'name': 'Onduleur (UPS) 3000VA',
            'category': 'Infrastructure',
            'price_france': 400.00,
            'price_morocco': 4000.00,
            'description': 'UPS 3000VA',
            'unit': 'unit'
        },
        {
            'name': 'PDU (Power Distribution Unit)',
            'category': 'Infrastructure',
            'price_france': 150.00,
            'price_morocco': 1500.00,
            'description': 'Power Distribution Unit',
            'unit': 'unit'
        },
        {
            'name': 'Server Dell R540',
            'category': 'Équipement Serveur',
            'price_france': 2000.00,
            'price_morocco': 20000.00,
            'description': 'Dell R540 Server',
            'unit': 'unit'
        },
        {
            'name': 'Switch 24 Ports PoE',
            'category': 'Équipement Réseau',
            'price_france': 800.00,
            'price_morocco': 8000.00,
            'description': '24 Port PoE Switch',
            'unit': 'unit'
        },
        {
            'name': 'Câble réseau blindé Cat 6 2 m',
            'category': 'Infrastructure',
            'price_france': 15.00,
            'price_morocco': 150.00,
            'description': 'Shielded network cable Cat 6 2m',
            'unit': 'unit'
        },
        {
            'name': 'KVM Console',
            'category': 'Équipement Réseau',
            'price_france': 300.00,
            'price_morocco': 3000.00,
            'description': 'KVM Console',
            'unit': 'unit'
        },
        {
            'name': 'KVM Cables',
            'category': 'Équipement Réseau',
            'price_france': 50.00,
            'price_morocco': 500.00,
            'description': 'KVM Cables',
            'unit': 'unit'
        },
        {
            'name': 'DAC Cable 1m',
            'category': 'Équipement Réseau',
            'price_france': 100.00,
            'price_morocco': 1000.00,
            'description': 'DAC Cable 1m',
            'unit': 'unit'
        },
        {
            'name': 'Transceivers',
            'category': 'Équipement Réseau',
            'price_france': 80.00,
            'price_morocco': 800.00,
            'description': 'Network Transceivers',
            'unit': 'unit'
        },
        {
            'name': 'File Server (Standard)',
            'category': 'Équipement Serveur',
            'price_france': 1500.00,
            'price_morocco': 15000.00,
            'description': 'Standard File Server',
            'unit': 'unit'
        },
        
        # Internet services
        {
            'name': 'Internet 100MBps',
            'category': 'Services',
            'price_france': 200.00,
            'price_morocco': 2000.00,
            'description': 'Internet Connection 100MBps',
            'unit': 'month',
            'is_service': True
        },
        {
            'name': 'Internet 200MBps',
            'category': 'Services',
            'price_france': 350.00,
            'price_morocco': 3500.00,
            'description': 'Internet Connection 200MBps',
            'unit': 'month',
            'is_service': True
        },
        {
            'name': 'Internet 500MBps',
            'category': 'Services',
            'price_france': 600.00,
            'price_morocco': 6000.00,
            'description': 'Internet Connection 500MBps',
            'unit': 'month',
            'is_service': True
        },
        {
            'name': 'Internet 1GBps',
            'category': 'Services',
            'price_france': 1000.00,
            'price_morocco': 10000.00,
            'description': 'Internet Connection 1GBps',
            'unit': 'month',
            'is_service': True
        },
    ]

    print("Setting up missing materials for project form...")
    
    created_count = 0
    updated_count = 0
    
    for material_data in required_materials:
        name = material_data['name']
        category_name = material_data['category']
        
        # Get or create category
        category, _ = Category.objects.get_or_create(
            name=category_name,
            defaults={'description': f'Category for {category_name.lower()}'}
        )
        
        # Check if material exists
        material, created = Material.objects.get_or_create(
            name=name,
            defaults={
                'category': category,
                'price_france': material_data['price_france'],
                'price_morocco': material_data['price_morocco'],
                'description': material_data['description'],
                'unit': material_data['unit'],
                'is_service': material_data.get('is_service', False),
                'is_auto_calculated': material_data.get('is_auto_calculated', False)
            }
        )
        
        if created:
            created_count += 1
            print(f"✅ Created: {name}")
        else:
            # Update prices if they were 0
            if material.price_france == 0 or material.price_morocco == 0:
                material.price_france = material_data['price_france']
                material.price_morocco = material_data['price_morocco']
                material.save()
                updated_count += 1
                print(f"🔄 Updated prices: {name}")
            else:
                print(f"ℹ️  Already exists: {name}")
    
    print(f"\n📊 Summary:")
    print(f"✅ Created: {created_count} materials")
    print(f"🔄 Updated: {updated_count} materials")
    print(f"📦 Total materials in database: {Material.objects.count()}")
    
    # Show some examples
    print(f"\n📋 Example materials:")
    for material in Material.objects.filter(name__in=['Laptop - Office', 'Internet 100MBps', 'Server Dell R540']):
        print(f"  - {material.name}: €{material.price_france} / {material.price_morocco} MAD")

if __name__ == '__main__':
    add_missing_materials()
