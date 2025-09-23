# IT Infrastructure Project Management System - Setup Instructions

## Overview
This is a Django + React web application for IT infrastructure project management with automatic budget calculation.

## Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL (or SQLite for development)
- Git

## Backend Setup (Django)

### 1. Navigate to Backend Directory
```bash
cd backend/core
```

### 2. Create Virtual Environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install django djangorestframework django-cors-headers mysqlclient openpyxl
```

### 4. Database Configuration
Update `settings.py` for MySQL:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'it_infrastructure_db',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

### 5. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser
```bash
python manage.py createsuperuser
```

### 7. Setup Default Data
```bash
python manage.py shell
>>> from calculations.services import MaterialManager
>>> MaterialManager.create_default_categories()
>>> MaterialManager.create_default_materials()
>>> exit()
```

### 8. Start Development Server
```bash
python manage.py runserver
```

## Frontend Setup (React)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```

## Project Structure

```
backend/core/
├── accounts/          # User authentication
├── projects/          # Project management
├── materials/         # Material catalog
├── calculations/      # Budget calculation engine
└── core/             # Django settings

frontend/
├── src/
│   ├── components/   # Reusable components
│   ├── pages/        # Page components
│   ├── contexts/     # React contexts
│   └── App.js        # Main app component
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - User profile

### Projects
- `GET /api/projects/` - List user projects
- `POST /api/projects/` - Create new project
- `GET /api/projects/{id}/` - Get project details
- `PUT /api/projects/{id}/` - Update project
- `DELETE /api/projects/{id}/` - Delete project
- `GET /api/projects/{id}/budget/` - Get budget breakdown
- `POST /api/projects/{id}/recalculate/` - Recalculate budget

### Materials (Admin Only)
- `GET /api/materials/` - List materials
- `POST /api/materials/` - Create material
- `PUT /api/materials/{id}/` - Update material
- `DELETE /api/materials/{id}/` - Delete material
- `POST /api/materials/setup/` - Setup default materials

## User Roles

### Super Admin
- Create admin accounts
- Full system control

### Admin
- Manage materials and prices
- View all projects
- Manage user accounts

### Regular User
- Create and manage projects
- View budget calculations
- Download reports

## Key Features

### Automatic Calculations
The system automatically calculates:
- Racks (1 per site)
- UPS (1 per site)
- Servers (MAX(users÷50, sites))
- Network Switches (CEILING(devices÷24) per site)
- Network Cables (devices×2 per site)
- KVM equipment
- PDU (2 per site)
- DAC Cables and Transceivers

### Budget Generation
- Real-time cost calculation
- Dual currency (France € / Morocco MAD)
- Category-based organization
- Excel export functionality

### Project Management
- Multi-step project creation
- Project cloning
- Status tracking
- Version control

## Development Workflow

### 1. Backend Development
```bash
# Make changes to models
python manage.py makemigrations
python manage.py migrate

# Test API endpoints
python manage.py runserver
# Visit http://localhost:8000/admin/
```

### 2. Frontend Development
```bash
# Start React development server
npm start
# Visit http://localhost:3000
```

### 3. Testing
```bash
# Backend tests
python manage.py test

# Frontend tests
npm test
```

## Deployment

### Production Settings
1. Set `DEBUG = False`
2. Configure production database
3. Set up static file serving
4. Configure CORS for production domain
5. Set up SSL certificates

### Environment Variables
```bash
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=mysql://user:pass@host:port/db
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL service is running
   - Verify database credentials
   - Ensure database exists

2. **Migration Errors**
   - Delete migration files and recreate
   - Check for model conflicts

3. **CORS Issues**
   - Install django-cors-headers
   - Add to INSTALLED_APPS
   - Configure CORS_ALLOWED_ORIGINS

4. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Django and React documentation
3. Check console logs for errors
4. Verify API endpoints with Postman

## License

This project is for educational and commercial use.

