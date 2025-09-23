# 📊 ALL FORM COMPONENT PRICES (REAL DATABASE PRICES)

## 👥 USER EQUIPMENT (What users specify in the form)

| Material Name | Price (France) | Price (Morocco) | Category |
|---------------|----------------|-----------------|----------|
| **Laptop - Office** | €12.00 | 127.20 MAD | Appareils Utilisateur |
| **Laptop - Tech** | €5.00 | 53.00 MAD | Appareils Utilisateur |
| **Desktop - Office** | €3.00 | 33.60 MAD | Appareils Utilisateur |
| **Desktop - Tech** | €2.23 | 25.00 MAD | Appareils Utilisateur |
| **Printer** | €1.00 | 10.58 MAD | Appareils Utilisateur |
| **Access Point** | €1.00 | 10.58 MAD | Network Equipment |
| **Traceau** | €1.00 | 10.58 MAD | Appareils Utilisateur |
| **Visio endpoint** | €1.00 | 10.58 MAD | Visio Conference |

## 🏗️ AUTO-CALCULATED INFRASTRUCTURE (System adds automatically)

| Material Name | Price (France) | Price (Morocco) | Category |
|---------------|----------------|-----------------|----------|
| **Rack** | €500.00 | 5,000.00 MAD | Infrastructure Equipment |
| **Onduleur (UPS) 3000VA** | €1.00 | 10.58 MAD | Infrastructure Equipment |
| **Server Dell R540** | €5,000.00 | 50,000.00 MAD | Servers |
| **Switch 24 Ports PoE** | €800.00 | 8,000.00 MAD | Network Equipment |
| **Câble réseau blindé Cat 6 2 m** | €0.00 | 0.00 MAD | Infrastructure Equipment |
| **KVM Console** | €300.00 | 3,000.00 MAD | Infrastructure Equipment |
| **KVM Switch** | €250.00 | 2,500.00 MAD | Infrastructure Equipment |
| **KVM Cables** | €50.00 | 500.00 MAD | Infrastructure Equipment |
| **PDU (Power Distribution Unit)** | €0.00 | 0.00 MAD | Infrastructure Equipment |
| **DAC Cable 1m** | €100.00 | 1,000.00 MAD | Network Equipment |
| **Transceivers** | €80.00 | 800.00 MAD | Network Equipment |
| **File Server (Standard)** | €1.00 | 10.58 MAD | Servers |

## 🌐 INTERNET SERVICES (Missing from database)

| Material Name | Status | Notes |
|---------------|--------|-------|
| **Internet 100MBps** | ❌ NOT FOUND | Need to add to database |
| **Internet 200MBps** | ❌ NOT FOUND | Need to add to database |
| **Internet 500MBps** | ❌ NOT FOUND | Need to add to database |
| **Internet 1GBps** | ❌ NOT FOUND | Need to add to database |

## 💰 EXAMPLE BUDGET CALCULATION

**User Input:**
- 10 Laptop - Office
- 5 Desktop - Office
- 2 Printers
- 1 Access Point
- 50 users
- 2 sites
- File Server: YES
- Internet: 100MBps

**Budget Breakdown:**

### User Equipment:
- 10 × Laptop - Office: 10 × €12.00 = €120.00
- 5 × Desktop - Office: 5 × €3.00 = €15.00
- 2 × Printer: 2 × €1.00 = €2.00
- 1 × Access Point: 1 × €1.00 = €1.00

### Auto Infrastructure:
- 2 × Rack: 2 × €500.00 = €1,000.00
- 2 × Onduleur (UPS): 2 × €1.00 = €2.00
- 1 × Server Dell R540: 1 × €5,000.00 = €5,000.00
- 1 × Switch 24 Ports: 1 × €800.00 = €800.00
- 1 × File Server: 1 × €1.00 = €1.00
- 1 × KVM Console: 1 × €300.00 = €300.00
- 1 × KVM Switch: 1 × €250.00 = €250.00
- 4 × KVM Cables: 4 × €50.00 = €200.00
- 2 × DAC Cable: 2 × €100.00 = €200.00
- 4 × Transceivers: 4 × €80.00 = €320.00

### Internet Service:
- 1 × Internet 100MBps: ❌ NOT FOUND (€0.00)

**TOTAL: €8,211.00** (87,163.20 MAD)

## ⚠️ ISSUES TO FIX

1. **Missing Internet Services**: Need to add Internet speed materials to database
2. **Zero Price Items**: Some infrastructure items have €0.00 prices
3. **File Server Price**: Very low at €1.00 (should be higher)

## ✅ CONFIRMED REAL PRICES

These are the **ACTUAL prices** from your database that the form will use for budget calculation. The system is working with these exact amounts! 🎯
