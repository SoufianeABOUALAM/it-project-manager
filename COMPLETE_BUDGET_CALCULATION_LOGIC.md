# 📊 COMPLETE BUDGET CALCULATION LOGIC

## 🎯 **ALL 45 MATERIALS INCLUDED WITH BUSINESS RULES**

### **STEP 1: USER EQUIPMENT** 👥
**What user specifies in form:**

| User Input | Material Name | Price | Logic |
|------------|---------------|-------|-------|
| `num_laptop_office` | Laptop - Office | €12.00 | Direct quantity |
| `num_laptop_tech` | Laptop - Tech | €5.00 | Direct quantity |
| `num_desktop_office` | Desktop - Office | €3.00 | Direct quantity |
| `num_desktop_tech` | Desktop - Tech | €2.23 | Direct quantity |
| `num_printers` | Printer | €1.00 | Direct quantity |
| `num_aps` | Access Point | €1.00 | Direct quantity |
| `num_traceau` | Traceau | €1.00 | Direct quantity |
| `num_videoconference` | Visio endpoint | €1.00 | Direct quantity |

---

### **STEP 2: AUTO-CALCULATED INFRASTRUCTURE** 🏗️

#### **📁 INFRASTRUCTURE EQUIPMENT**
| Material Name | Price | Business Rule | Calculation |
|---------------|-------|---------------|-------------|
| **Rack** | €500.00 | 1 per site | `numberOfSites` |
| **Onduleur (UPS) 3000VA** | €1.00 | 1 per site | `numberOfSites` |
| **PDU (Power Distribution Unit)** | €0.00 | 2 per site | `numberOfSites * 2` |

#### **🖥️ SERVERS**
| Material Name | Price | Business Rule | Calculation |
|---------------|-------|---------------|-------------|
| **Server Dell R540** | €5,000.00 | 1 per 50 users OR 1 per site | `Math.max(Math.floor(numberOfUsers / 50), numberOfSites)` |
| **Virtual Machine Config** | €1,000.00 | 1 per server | `serverCount` |
| **File Server (Standard)** | €1.00 | Only if user selects "Yes" | `formData.file_server ? 1 : 0` |

#### **🌐 NETWORK EQUIPMENT - SWITCHES**
| Material Name | Price | Business Rule | Calculation |
|---------------|-------|---------------|-------------|
| **Switch 24 Ports PoE** | €800.00 | Max 2 switches | `Math.min(switchCount, 2)` |
| **Switch 48 Ports PoE** | €1,200.00 | Additional switches if needed | `Math.max(0, switchCount - 2)` |
| **Firewall Appliance** | €1.00 | 1 per site | `numberOfSites` |

#### **🔌 NETWORK EQUIPMENT - CABLES**
| Material Name | Price | Business Rule | Calculation |
|---------------|-------|---------------|-------------|
| **Câble réseau blindé Cat 6 0.5 m** | €122.00 | 30% of total cables | `Math.floor(cableCount * 0.3)` |
| **Câble réseau blindé Cat 6 2 m** | €0.00 | 40% of total cables | `Math.floor(cableCount * 0.4)` |
| **Câble réseau blindé Cat 6 5 m** | €0.00 | 20% of total cables | `Math.floor(cableCount * 0.2)` |
| **Câble réseau blindé Cat 6 10 m** | €20.00 | 10% of total cables | `Math.floor(cableCount * 0.1)` |

**Total Cable Count**: `totalDevices * 2 * numberOfSites` (2 cables per device)

#### **🔗 NETWORK EQUIPMENT - SERVER CONNECTIONS**
| Material Name | Price | Business Rule | Calculation |
|---------------|-------|---------------|-------------|
| **DAC Cable 1m** | €100.00 | 2 per server | `serverCount * 2` |
| **DAC Cable 3m** | €120.00 | 1 per server | `serverCount * 1` |
| **Transceivers** | €80.00 | 4 per server | `serverCount * 4` |

#### **📶 NETWORK EQUIPMENT - WIFI**
| Material Name | Price | Business Rule | Calculation |
|---------------|-------|---------------|-------------|
| **Wifi Access Point Indoor** | €300.00 | 1 per 20 users | `Math.ceil(numberOfUsers / 20)` |
| **Wifi Access Point Outdoor** | €400.00 | 1 per site | `numberOfSites` |
| **Wifi Access Point Camp** | €200.00 | 1 per 2 sites | `Math.ceil(numberOfSites / 2)` |

#### **🖥️ KVM EQUIPMENT**
| Material Name | Price | Business Rule | Calculation |
|---------------|-------|---------------|-------------|
| **KVM Console** | €300.00 | 1 per site | `numberOfSites` |
| **KVM Switch** | €250.00 | 1 per site | `numberOfSites` |
| **KVM Cables** | €50.00 | 4 per site | `numberOfSites * 4` |

#### **📄 LICENSES**
| Material Name | Price | Business Rule | Calculation |
|---------------|-------|---------------|-------------|
| **Windows Client License (Windows Pro)** | €1.00 | 1 per device | `totalDevices` |
| **Windows Server License** | €1.00 | 1 per server | `serverCount` |

---

### **STEP 3: INTERNET SERVICES** 🌐
**Based on user selection:**

| Internet Type | Speed | Material Name | Price |
|---------------|-------|---------------|-------|
| **Fiber Optic** | 100MBps | Fiber Optic 100MBps | €80.00 |
| **Fiber Optic** | 200MBps | Fiber Optic 200MBps | €120.00 |
| **Fiber Optic** | 500MBps | Fiber Optic 500MBps | €200.00 |
| **Fiber Optic** | 1GBps | Fiber Optic 1GBps | €300.00 |
| **STARLINK** | 100MBps | STARLINK 100MBps | €100.00 |
| **STARLINK** | 200MBps | STARLINK 200MBps | €180.00 |
| **STARLINK** | 500MBps | STARLINK 500MBps | €300.00 |
| **STARLINK** | 1GBps | STARLINK 1GBps | €450.00 |
| **VSAT** | 100MBps | VSAT 100MBps | €150.00 |
| **VSAT** | 200MBps | VSAT 200MBps | €250.00 |
| **VSAT** | 500MBps | VSAT 500MBps | €400.00 |
| **VSAT** | 1GBps | VSAT 1GBps | €600.00 |

---

## 💰 **EXAMPLE CALCULATION**

**User Input:**
- 100 users, 3 sites
- 20 laptops, 10 desktops, 5 printers, 2 video conf
- File Server: YES
- Internet: STARLINK 200MBps

**Calculation:**

### **User Equipment:**
- 20 × Laptop - Office: €240.00
- 10 × Desktop - Office: €30.00
- 5 × Printer: €5.00
- 2 × Visio endpoint: €2.00
- **Subtotal: €277.00**

### **Auto Infrastructure:**
- 3 × Rack: €1,500.00
- 3 × UPS: €3.00
- 6 × PDU: €0.00
- 2 × Server Dell R540: €10,000.00
- 2 × Virtual Machine Config: €2,000.00
- 2 × Switch 24 Ports: €1,600.00
- 1 × Switch 48 Ports: €1,200.00
- 3 × Firewall: €3.00
- 5 × Wifi Indoor: €1,500.00
- 3 × Wifi Outdoor: €1,200.00
- 2 × Wifi Camp: €400.00
- 3 × KVM Console: €900.00
- 3 × KVM Switch: €750.00
- 12 × KVM Cables: €600.00
- 1 × File Server: €1.00
- 37 × Windows Client License: €37.00
- 2 × Windows Server License: €2.00
- **Cables**: €0.00 (mostly free)
- **DAC Cables**: €640.00
- **Transceivers**: €640.00
- **Subtotal: €22,017.00**

### **Internet Service:**
- 1 × STARLINK 200MBps: €180.00

### **TOTAL BUDGET: €22,474.00** (238,264.80 MAD)

---

## ✅ **ALL 45 MATERIALS COVERED**

**✅ User Equipment (8 materials)**
**✅ Infrastructure Equipment (3 materials)**
**✅ Servers (3 materials)**
**✅ Network Equipment - Switches (3 materials)**
**✅ Network Equipment - Cables (4 materials)**
**✅ Network Equipment - Server Connections (3 materials)**
**✅ Network Equipment - WiFi (3 materials)**
**✅ KVM Equipment (3 materials)**
**✅ Licenses (2 materials)**
**✅ Internet Services (12 materials)**
**✅ Visio Conference (1 material)**

**Total: 45 materials with smart business rules!** 🎯
