"""
WSGI config for yarotech_backend project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarotech_backend.settings')

application = get_wsgi_application()