#!/usr/bin/env python
"""
Remove legacy French categories and their materials so they don't reappear.
Run automatically from manage.py before seeding.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import transaction
from materials.models import Category, Material


LEGACY_CATEGORY_NAMES = [
    'Visioconférence',
    'Équipement Serveur',
    'Équipement Réseau',
    'Appareils Utilisateur',
]


@transaction.atomic
def run_cleanup():
    # Delete materials under legacy categories, then the categories
    for name in LEGACY_CATEGORY_NAMES:
        try:
            category = Category.objects.get(name=name)
        except Category.DoesNotExist:
            continue

        Material.objects.filter(category=category).delete()
        category.delete()

    # Also remove obvious bilingual duplicates if present
    duplicate_pairs = [
        ('Visioconférence', 'Videoconferencing'),
        ('Équipement Serveur', 'Server Equipment'),
        ('Équipement Réseau', 'Network Equipment'),
        ('Appareils Utilisateur', 'User Devices'),
    ]
    for fr_name, en_name in duplicate_pairs:
        # If both exist and are empty, remove the French one
        try:
            fr = Category.objects.get(name=fr_name)
            en = Category.objects.get(name=en_name)
        except Category.DoesNotExist:
            continue
        if not Material.objects.filter(category=fr).exists():
            fr.delete()


if __name__ == '__main__':
    run_cleanup()


