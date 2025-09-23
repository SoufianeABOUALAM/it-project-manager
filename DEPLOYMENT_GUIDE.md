# Deployment Guide - IT Infrastructure Project Management System

## Production Deployment Checklist

### 1. Environment Setup

#### Server Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB SSD
- **CPU**: 2+ cores recommended

#### Software Requirements
- Python 3.8+
- Node.js 16+
- MySQL 8.0+
- Nginx
- Supervisor (for process management)

### 2. Backend Deployment

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip python3-venv -y

# Install MySQL
sudo apt install mysql-server -y

# Install Nginx
sudo apt install nginx -y

# Install Supervisor
sudo apt install supervisor -y
```

#### Step 2: Database Setup
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE it_infrastructure_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'it_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON it_infrastructure_db.* TO 'it_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 3: Application Deployment
```bash
# Create application directory
sudo mkdir -p /var/www/it-infrastructure
sudo chown $USER:$USER /var/www/it-infrastructure

# Clone or upload your code
cd /var/www/it-infrastructure

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 4: Environment Configuration
Create `.env` file:
```bash
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=mysql://it_user:secure_password@localhost:3306/it_infrastructure_db
```

#### Step 5: Django Configuration
Update `settings.py`:
```python
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'it_infrastructure_db',
        'USER': 'it_user',
        'PASSWORD': 'secure_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
]

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

#### Step 6: Database Migration
```bash
cd /var/www/it-infrastructure/backend/core
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

#### Step 7: Supervisor Configuration
Create `/etc/supervisor/conf.d/it-infrastructure.conf`:
```ini
[program:it-infrastructure]
command=/var/www/it-infrastructure/venv/bin/gunicorn --bind 127.0.0.1:8000 core.wsgi:application
directory=/var/www/it-infrastructure/backend/core
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/it-infrastructure.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start it-infrastructure
```

### 3. Frontend Deployment

#### Step 1: Build React Application
```bash
cd /var/www/it-infrastructure/frontend
npm install
npm run build
```

#### Step 2: Nginx Configuration
Create `/etc/nginx/sites-available/it-infrastructure`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Frontend (React)
    location / {
        root /var/www/it-infrastructure/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static/ {
        alias /var/www/it-infrastructure/backend/core/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /var/www/it-infrastructure/backend/core/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/it-infrastructure /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate Setup

#### Using Let's Encrypt (Free)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. Monitoring and Logging

#### Log Configuration
```bash
# Create log directory
sudo mkdir -p /var/log/it-infrastructure
sudo chown www-data:www-data /var/log/it-infrastructure

# Log rotation
sudo nano /etc/logrotate.d/it-infrastructure
```

```bash
/var/log/it-infrastructure.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        supervisorctl restart it-infrastructure
    endscript
}
```

#### Health Check Script
Create `/var/www/it-infrastructure/health_check.py`:
```python
#!/usr/bin/env python3
import requests
import sys

def check_health():
    try:
        response = requests.get('https://yourdomain.com/api/auth/profile/', timeout=10)
        if response.status_code == 401:  # Expected for unauthenticated request
            print("Health check passed")
            return True
        else:
            print(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

if __name__ == "__main__":
    if not check_health():
        sys.exit(1)
```

### 6. Backup Strategy

#### Database Backup
```bash
# Create backup script
sudo nano /var/www/it-infrastructure/backup_db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/it-infrastructure"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u it_user -p it_infrastructure_db > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

```bash
sudo chmod +x /var/www/it-infrastructure/backup_db.sh

# Add to crontab
sudo crontab -e
# Add: 0 2 * * * /var/www/it-infrastructure/backup_db.sh
```

### 7. Security Hardening

#### Firewall Configuration
```bash
# Install UFW
sudo apt install ufw -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### System Security
```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Restart SSH
sudo systemctl restart ssh

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 8. Performance Optimization

#### Database Optimization
```sql
-- Add indexes for better performance
ALTER TABLE projects_project ADD INDEX idx_user_created (user_id, created_at);
ALTER TABLE calculations_projectitem ADD INDEX idx_project_material (project_id, material_id);
ALTER TABLE materials_material ADD INDEX idx_category_active (category_id, is_active);
```

#### Application Optimization
```python
# Add to settings.py
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# Install Redis
sudo apt install redis-server -y
```

### 9. Deployment Commands

#### Quick Deployment Script
Create `deploy.sh`:
```bash
#!/bin/bash
set -e

echo "Starting deployment..."

# Pull latest code
git pull origin main

# Backend deployment
cd backend/core
source ../../venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Frontend deployment
cd ../../frontend
npm install
npm run build

# Restart services
sudo supervisorctl restart it-infrastructure
sudo systemctl reload nginx

echo "Deployment completed successfully!"
```

### 10. Troubleshooting

#### Common Issues
1. **502 Bad Gateway**: Check if Django app is running
2. **Database Connection Error**: Verify MySQL service and credentials
3. **Static Files Not Loading**: Run `collectstatic` command
4. **SSL Certificate Issues**: Check certificate validity and Nginx config

#### Useful Commands
```bash
# Check application status
sudo supervisorctl status it-infrastructure

# View application logs
sudo tail -f /var/log/it-infrastructure.log

# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Check database connection
mysql -u it_user -p it_infrastructure_db
```

This deployment guide provides a complete production setup for your IT Infrastructure Project Management System.

