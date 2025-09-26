from django.http import JsonResponse
from django.conf import settings
import os

def handler(request):
    """Main handler for Vercel"""
    return JsonResponse({
        'status': 'ok',
        'message': 'Django backend is running on Vercel',
        'environment': 'production' if not settings.DEBUG else 'development'
    })
