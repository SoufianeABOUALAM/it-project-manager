# IT Infrastructure Project Management System

A comprehensive web application for managing IT infrastructure projects with automatic budget calculation and professional reporting capabilities.

## 🚀 Features

### Core Functionality
- **Smart Budget Calculation**: Automatically calculates required equipment based on project specifications
- **Multi-Currency Support**: France (€) and Morocco (MAD) pricing
- **Professional Reporting**: Excel export with detailed budget breakdowns
- **Project Management**: Complete project lifecycle management
- **User Management**: Role-based access control

### User Roles
- **Super Admin**: System control and admin account creation
- **Admin**: Material management, user oversight, project monitoring
- **Regular Users**: Project creation and management

### Automatic Calculations
The system intelligently calculates:
- Infrastructure equipment (racks, UPS, PDU)
- Network equipment (servers, switches, cables)
- KVM equipment and accessories
- Based on user count, site count, and device requirements

## 🛠️ Technology Stack

### Backend
- **Django 5.2.5** - Web framework
- **Django REST Framework** - API development
- **MySQL** - Database (production)
- **SQLite** - Database (development)

### Frontend
- **React 18** - User interface
- **Material-UI** - Component library
- **Axios** - HTTP client

### Additional Tools
- **openpyxl** - Excel file generation
- **Gunicorn** - WSGI server
- **Nginx** - Web server (production)

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL 8.0+ (for production)
- Git

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd it-infrastructure-project
```

### 2. Backend Setup
```bash
cd backend/core
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## 📁 Project Structure

```
├── backend/
│   └── core/
│       ├── accounts/          # User authentication
│       ├── projects/          # Project management
│       ├── materials/         # Material catalog
│       ├── calculations/      # Budget calculation engine
│       └── core/             # Django settings
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   └── App.js           # Main app component
│   └── public/
├── requirements.txt
├── SETUP_INSTRUCTIONS.md
├── DEPLOYMENT_GUIDE.md
└── README.md
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in `backend/core/`:
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

### Database Configuration
For MySQL production setup, update `settings.py`:
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

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Projects
- `GET /api/projects/` - List user projects
- `POST /api/projects/` - Create new project
- `GET /api/projects/{id}/` - Get project details
- `GET /api/projects/{id}/budget/` - Get budget breakdown

### Materials (Admin)
- `GET /api/materials/` - List materials
- `POST /api/materials/` - Create material
- `PUT /api/materials/{id}/` - Update material

## 🧮 Calculation Logic

### Automatic Equipment Calculation
- **Racks**: 1 per site
- **UPS**: 1 per site
- **Servers**: MAX(users÷50, sites)
- **Network Switches**: CEILING(devices÷24) per site
- **Network Cables**: devices×2 per site
- **KVM Equipment**: Based on site count
- **PDU**: 2 per site

### Budget Generation
1. User specifies equipment quantities
2. System calculates additional requirements
3. Retrieves current material prices
4. Generates detailed budget breakdown
5. Exports professional Excel report

## 🎯 Usage

### For Users
1. **Register/Login** to the system
2. **Create Project** using the multi-step wizard
3. **Specify Requirements** (equipment, services, locations)
4. **Review Budget** with automatic calculations
5. **Export Report** in Excel format

### For Admins
1. **Manage Materials** and pricing
2. **Monitor Projects** from all users
3. **Manage Users** and permissions
4. **Update Prices** with history tracking

## 🚀 Deployment

### Development
```bash
# Backend
python manage.py runserver

# Frontend
npm start
```

### Production
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete production deployment instructions.

## 📚 Documentation

- [Setup Instructions](SETUP_INSTRUCTIONS.md) - Detailed setup guide
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment
- [Project Overview](PROJECT_OVERVIEW.md) - Technical architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Review the troubleshooting section
3. Create an issue in the repository

## 🎉 Acknowledgments

- Django and React communities
- Material-UI for the component library
- All contributors and testers

---

**Built with ❤️ for IT Infrastructure Management**

