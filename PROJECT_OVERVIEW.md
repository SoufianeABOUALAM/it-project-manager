  # IT Infrastructure Project Management System

## Project Description
A comprehensive web application for managing IT infrastructure projects with automatic budget calculation and professional reporting capabilities.

## Technology Stack
- **Backend**: Django 5.2.5 + Django REST Framework
- **Frontend**: React 18 + Material-UI
- **Database**: MySQL (production) / SQLite (development)
- **Authentication**: Django Token Authentication
- **Export**: Excel files with openpyxl

## Key Features

### 1. User Management
- **Super Admin**: System control and admin account creation
- **Admin**: Material management, user management, project oversight
- **Regular Users**: Project creation and management

### 2. Project Management
- Multi-step project creation wizard
- Project cloning and versioning
- Status tracking (Draft → Submitted → Approved → In Progress → Completed)
- Project search and filtering

### 3. Smart Budget Calculation
- **Automatic Equipment Calculation**:
  - Racks: 1 per site
  - UPS: 1 per site
  - Servers: MAX(users÷50, sites)
  - Network Switches: CEILING(devices÷24) per site
  - Network Cables: devices×2 per site
  - KVM Console: 1 per site
  - KVM Switch: 1 per site
  - KVM Cables: 4 per site
  - PDU: 2 per site
  - DAC Cables: servers×2
  - Transceivers: DAC cables×2

### 4. Material Management
- Category-based organization (Ordinateurs, Réseau, Infrastructure, etc.)
- Dual currency pricing (France € / Morocco MAD)
- Price history tracking
- Bulk price updates
- Auto-calculated vs user-specified materials

### 5. Professional Reporting
- Detailed budget breakdown by category
- Excel export with professional formatting
- Cost analysis and comparisons
- Project documentation

## Database Schema

### Core Models

#### Project Model
```python
- Basic Information: name, entity, dates, users
- Equipment: laptops, desktops, printers, etc.
- Services: file server, internet speed, local apps
- Location: addresses, GPS coordinates
- Calculated: total costs, status, metadata
```

#### Material Model
```python
- Information: name, description, category
- Pricing: price_france, price_morocco
- Properties: is_auto_calculated, is_service, unit
- Metadata: created_at, updated_at, is_active
```

#### ProjectItem Model
```python
- Relations: project, material
- Quantities: quantity, is_auto_calculated
- Costs: unit_cost, total_cost (both currencies)
```

## API Architecture

### Authentication Endpoints
- User registration and login
- Token-based authentication
- Profile management
- Password change functionality

### Project Endpoints
- CRUD operations for projects
- Budget calculation and recalculation
- Project cloning
- Budget breakdown retrieval

### Material Endpoints (Admin)
- Material catalog management
- Price updates with history tracking
- Bulk operations
- Category management

## Frontend Architecture

### Component Structure
- **Layout**: Main navigation and sidebar
- **Pages**: Login, Dashboard, ProjectForm, ProjectDetail, etc.
- **Contexts**: Authentication context for state management
- **Components**: Reusable UI components

### Key Pages
1. **Login/Register**: User authentication
2. **Dashboard**: Project overview and quick actions
3. **ProjectForm**: Multi-step project creation wizard
4. **ProjectDetail**: Project information and management
5. **BudgetView**: Detailed budget breakdown and export
6. **AdminDashboard**: Administrative functions

## Calculation Logic

### User Input Processing
1. Extract user-specified equipment quantities
2. Calculate number of sites from addresses
3. Determine total devices across all sites

### Automatic Calculations
1. **Infrastructure Items**: Based on site count
2. **Network Equipment**: Based on device count and distribution
3. **Server Requirements**: Based on user count and site distribution
4. **Cable Requirements**: Based on device count and site layout

### Budget Generation
1. Retrieve current material prices
2. Calculate costs for all items (user + auto-calculated)
3. Organize by categories
4. Generate totals in both currencies
5. Create professional report format

## Business Logic

### Project Workflow
1. **Creation**: User fills multi-step form
2. **Calculation**: System automatically calculates requirements
3. **Budget**: Real-time budget generation
4. **Review**: User can modify and recalculate
5. **Export**: Professional Excel report generation

### Admin Workflow
1. **Setup**: Create categories and materials
2. **Pricing**: Set and update material prices
3. **Management**: Monitor user projects
4. **Support**: Manage user accounts

## Security Features
- Token-based authentication
- Role-based access control
- Input validation and sanitization
- CSRF protection
- SQL injection prevention

## Performance Optimizations
- Database query optimization
- Pagination for large datasets
- Caching for frequently accessed data
- Efficient calculation algorithms

## Scalability Considerations
- Modular architecture
- API-first design
- Database indexing
- Horizontal scaling support

## Future Enhancements
- Advanced analytics and reporting
- Integration with external systems
- Mobile application
- Advanced project templates
- Multi-language support
- Advanced user permissions

## Development Guidelines

### Code Organization
- Separation of concerns
- Modular design
- Consistent naming conventions
- Comprehensive documentation

### Testing Strategy
- Unit tests for calculation logic
- Integration tests for API endpoints
- Frontend component testing
- End-to-end testing

### Deployment
- Environment-specific configurations
- Database migrations
- Static file serving
- SSL and security headers

This system provides a complete solution for IT infrastructure project management with professional-grade features and scalability for enterprise use.

