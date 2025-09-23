# Project Form Budget Calculation System

## How It Works

The system automatically calculates project budgets based on user inputs and existing materials in the database. Here's how it works:

### 1. User Fills Out Form
When a user creates a project, they fill out basic information:
- Project name, company, dates
- Number of users
- PC quantities (laptops, desktops)
- Internet requirements (type and speed)
- Number of sites/offices
- Other equipment (printers, access points, etc.)

### 2. Automatic Budget Calculation
The system automatically calculates:

#### User-Specified Equipment
- **Laptops**: Office and Technical laptops
- **Desktops**: Office and Technical desktops  
- **Printers**: Number of printers needed
- **Access Points**: Wireless access points
- **Traceau**: Traceau devices
- **Videoconference**: Video conferencing endpoints

#### Auto-Calculated Infrastructure
Based on the number of users and sites, the system automatically adds:
- **Servers**: 1 server per 50 users (minimum 1 per site)
- **Network Switches**: Based on total devices (24 devices per switch)
- **Network Cables**: 2 cables per device
- **Racks**: 1 rack per site
- **UPS**: 1 UPS per site
- **KVM Equipment**: Console, switch, and cables per site
- **PDU**: Power distribution units per site
- **DAC Cables & Transceivers**: For server connections

#### Internet Services
- **Internet Connection**: Based on selected type and speed

#### File Server
- **File Server (Standard)**: Only added if user selects "Yes" for File Server
  - Cost: €1,500 (15,000 MAD)
  - Quantity: 1 unit
  - If "No" selected: €0 (not added to budget)

### 3. Material Matching
The system matches form inputs with materials in the database:

```javascript
// Example: User selects STARLINK 100MBps
// System looks for material: "Internet 100MBps"
// Finds price: €200/month (2000 MAD)
// Adds to budget automatically
```

### 4. Real-Time Budget Display
The budget updates in real-time showing:
- **Total Cost**: In both EUR (France) and MAD (Morocco)
- **Itemized Breakdown**: Each material with quantity and cost
- **Visual Indicators**: 
  - 🟢 Green: Auto-calculated items
  - 🔵 Blue: User-specified items
  - 🔴 Red: Missing materials (need to be added to database)

## Required Materials in Database

For the system to work properly, these materials must exist in the database:

### User Equipment
- `Laptop - Office` (€800 / 8000 MAD)
- `Laptop - Tech` (€1200 / 12000 MAD)
- `Desktop - Office` (€600 / 6000 MAD)
- `Desktop - Tech` (€1000 / 10000 MAD)
- `Printer` (€300 / 3000 MAD)
- `Access Point` (€150 / 1500 MAD)
- `Traceau` (€200 / 2000 MAD)
- `Visio endpoint` (€500 / 5000 MAD)

### Infrastructure Equipment
- `Rack` (€500 / 5000 MAD)
- `Onduleur (UPS) 3000VA` (€400 / 4000 MAD)
- `Server Dell R540` (€2000 / 20000 MAD)
- `Switch 24 Ports PoE` (€800 / 8000 MAD)
- `Câble réseau blindé Cat 6 2 m` (€15 / 150 MAD)
- `KVM Console` (€300 / 3000 MAD)
- `KVM Switch` (€250 / 2500 MAD)
- `KVM Cables` (€50 / 500 MAD)
- `PDU (Power Distribution Unit)` (€150 / 1500 MAD)
- `DAC Cable 1m` (€100 / 1000 MAD)
- `Transceivers` (€80 / 800 MAD)

### Internet Services
- `Internet 100MBps` (€200 / 2000 MAD)
- `Internet 200MBps` (€350 / 3500 MAD)
- `Internet 500MBps` (€600 / 6000 MAD)
- `Internet 1GBps` (€1000 / 10000 MAD)

### File Server
- `File Server (Standard)` (€1500 / 15000 MAD)

## Setup Instructions

### For Administrators

1. **Setup Required Materials**:
   - Go to Materials Dashboard
   - Find the "Services" category
   - Click "Setup Required Materials" button
   - All required materials will be created automatically

2. **Manual Setup** (Alternative):
   - Run: `python setup_missing_materials.py` from backend/core directory

### For Users

1. **Create Project**:
   - Fill out the project form
   - Select equipment quantities
   - Choose internet type and speed
   - Budget calculates automatically

2. **View Budget**:
   - Check "Budget Preview" section
   - See real-time cost calculation
   - View detailed breakdown

## Example Calculation

**User Input:**
- 50 users
- 2 sites
- 30 laptops (office)
- 20 desktops (office)
- STARLINK 100MBps internet
- 5 printers

**System Calculates:**
- 1 server (50 users ÷ 50 = 1)
- 2 racks (1 per site)
- 2 UPS (1 per site)
- 3 switches (55 devices ÷ 24 = 3)
- 110 network cables (55 devices × 2)
- 1 internet connection (100MBps)
- Plus all KVM equipment, PDU, etc.

**Total Budget:** Automatically calculated based on material prices

## Benefits

1. **Automatic**: No manual calculations needed
2. **Accurate**: Based on real material prices
3. **Real-time**: Updates as user changes inputs
4. **Professional**: Generates detailed budget reports
5. **Flexible**: Easy to add new materials and pricing

This system makes IT project budgeting simple and accurate for everyone!
