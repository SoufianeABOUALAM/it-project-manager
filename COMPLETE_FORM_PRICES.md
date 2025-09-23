# 📊 COMPLETE FORM COMPONENT PRICES (ALL MATERIALS IN DATABASE)

## 🎯 **UNDERSTANDING THE LOGIC**

- **USER INPUT**: Only quantities (how many laptops, desktops, etc.)
- **AUTO-CALCULATED**: ALL materials in database are automatically calculated based on user input
- **BUDGET**: System calculates total cost using real database prices

---

## 👥 **APPAREILS UTILISATEUR** (User Equipment)

| Material Name | Price (France) | Price (Morocco) | User Input |
|---------------|----------------|-----------------|------------|
| **Laptop - Office** | €12.00 | 127.20 MAD | ✅ Quantity |
| **Laptop - Tech** | €5.00 | 53.00 MAD | ✅ Quantity |
| **Printer** | €1.00 | 10.58 MAD | ✅ Quantity |
| **Traceau** | €1.00 | 10.58 MAD | ✅ Quantity |

---

## 🏗️ **INFRASTRUCTURE EQUIPMENT** (Auto-calculated)

| Material Name | Price (France) | Price (Morocco) | Auto Logic |
|---------------|----------------|-----------------|------------|
| **Rack** | €500.00 | 5,000.00 MAD | Based on number of sites |
| **Onduleur (UPS) 3000VA** | €1.00 | 10.58 MAD | Based on number of sites |
| **KVM Console** | €300.00 | 3,000.00 MAD | Based on number of sites |
| **KVM Switch** | €250.00 | 2,500.00 MAD | Based on number of sites |
| **KVM Cables** | €50.00 | 500.00 MAD | Based on number of sites |
| **Câble réseau blindé Cat 6 0.5 m** | €122.00 | 1,290.76 MAD | Based on devices |
| **Câble réseau blindé Cat 6 10 m** | €20.00 | 211.60 MAD | Based on devices |
| **Câble réseau blindé Cat 6 2 m** | €0.00 | 0.00 MAD | Based on devices |
| **Câble réseau blindé Cat 6 5 m** | €0.00 | 0.00 MAD | Based on devices |
| **PDU (Power Distribution Unit)** | €0.00 | 0.00 MAD | Based on sites |

---

## 🌐 **INTERNET SERVICES** (Auto-calculated based on user selection)

### **Fiber Optic Services:**
| Material Name | Price (France) | Price (Morocco) | User Input |
|---------------|----------------|-----------------|------------|
| **Fiber Optic 100MBps** | €80.00 | 800.00 MAD | ✅ Type + Speed |
| **Fiber Optic 200MBps** | €120.00 | 1,200.00 MAD | ✅ Type + Speed |
| **Fiber Optic 500MBps** | €200.00 | 2,000.00 MAD | ✅ Type + Speed |
| **Fiber Optic 1GBps** | €300.00 | 3,000.00 MAD | ✅ Type + Speed |

### **STARLINK Services:**
| Material Name | Price (France) | Price (Morocco) | User Input |
|---------------|----------------|-----------------|------------|
| **Internet line (STARLINK)** | €0.00 | 0.00 MAD | ✅ Type + Speed |
| **STARLINK 100MBps** | €100.00 | 1,000.00 MAD | ✅ Type + Speed |
| **STARLINK 200MBps** | €180.00 | 1,800.00 MAD | ✅ Type + Speed |
| **STARLINK 500MBps** | €300.00 | 3,000.00 MAD | ✅ Type + Speed |
| **STARLINK 1GBps** | €450.00 | 4,500.00 MAD | ✅ Type + Speed |

### **VSAT Services:**
| Material Name | Price (France) | Price (Morocco) | User Input |
|---------------|----------------|-----------------|------------|
| **VSAT 100MBps** | €150.00 | 1,500.00 MAD | ✅ Type + Speed |
| **VSAT 200MBps** | €250.00 | 2,500.00 MAD | ✅ Type + Speed |
| **VSAT 500MBps** | €400.00 | 4,000.00 MAD | ✅ Type + Speed |
| **VSAT 1GBps** | €600.00 | 6,000.00 MAD | ✅ Type + Speed |

---

## 🖥️ **SERVERS** (Auto-calculated)

| Material Name | Price (France) | Price (Morocco) | Auto Logic |
|---------------|----------------|-----------------|------------|
| **Server Dell R540** | €5,000.00 | 50,000.00 MAD | Based on users (1 per 50 users) |
| **File Server (Standard)** | €1.00 | 10.58 MAD | ✅ If user selects "Yes" |
| **Virtual Machine Config** | €1,000.00 | 10,000.00 MAD | Based on servers |

---

## 🌐 **NETWORK EQUIPMENT** (Auto-calculated)

| Material Name | Price (France) | Price (Morocco) | Auto Logic |
|---------------|----------------|-----------------|------------|
| **Switch 24 Ports PoE** | €800.00 | 8,000.00 MAD | Based on devices (1 per 24 devices) |
| **Switch 48 Ports PoE** | €1,200.00 | 12,000.00 MAD | Based on devices |
| **Access Point** | €1.00 | 10.58 MAD | ✅ User quantity |
| **DAC Cable 1m** | €100.00 | 1,000.00 MAD | Based on servers |
| **DAC Cable 3m** | €120.00 | 1,200.00 MAD | Based on servers |
| **Transceivers** | €80.00 | 800.00 MAD | Based on servers |
| **Firewall Appliance** | €1.00 | 10.58 MAD | Based on sites |
| **Wifi Access Point Camp** | €200.00 | 2,000.00 MAD | Based on sites |
| **Wifi Access Point Indoor** | €300.00 | 3,000.00 MAD | Based on sites |
| **Wifi Access Point Outdoor** | €400.00 | 4,000.00 MAD | Based on sites |

---

## 📄 **LICENSES** (Auto-calculated)

| Material Name | Price (France) | Price (Morocco) | Auto Logic |
|---------------|----------------|-----------------|------------|
| **Windows Client License (Windows Pro)** | €1.00 | 10.58 MAD | Based on devices |
| **Windows Server License** | €1.00 | 10.58 MAD | Based on servers |

---

## 📹 **VISIO CONFERENCE** (Auto-calculated)

| Material Name | Price (France) | Price (Morocco) | User Input |
|---------------|----------------|-----------------|------------|
| **Visio endpoint** | €1.00 | 10.58 MAD | ✅ User quantity |

---

## 💰 **EXAMPLE BUDGET CALCULATION**

**User Input:**
- 10 Laptop - Office
- 5 Desktop - Office  
- 2 Printers
- 1 Access Point
- 50 users
- 2 sites
- File Server: YES
- Internet: STARLINK 100MBps

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
- 1 × STARLINK 100MBps: 1 × €100.00 = €100.00

**TOTAL: €8,311.00** (88,123.20 MAD)

---

## ✅ **FIXED LOGIC**

1. **ALL materials in database** are now auto-calculated
2. **Internet services** use correct names (Fiber Optic, STARLINK, VSAT)
3. **User only inputs quantities** for equipment they specify
4. **System calculates everything else** automatically
5. **Real database prices** are used for all calculations

**Total Materials in Database: 45** 🎯
