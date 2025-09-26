# PythonAnywhere configuration
# Add this to your wsgi.py file

import os
import sys

# Add your project directory to the Python path
path = '/home/your-username/it-project-manager/backend/core'
if path not in sys.path:
    sys.path.append(path)

# Set the Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'

# Import Django's WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
