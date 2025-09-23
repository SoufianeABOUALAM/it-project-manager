# File Server Budget Calculation Test

## How File Server Selection Works

### When User Selects "Yes" for File Server:

1. **Form Field**: `file_server = true`
2. **System Logic**: 
   ```javascript
   if (formData.file_server) {
       autoItems.push({ name: 'File Server (Standard)', quantity: 1 });
   }
   ```
3. **Budget Addition**: 
   - Material: "File Server (Standard)"
   - Quantity: 1
   - Price: €1,500 (15,000 MAD)
   - Total Cost: €1,500 added to budget

### When User Selects "No" for File Server:

1. **Form Field**: `file_server = false`
2. **System Logic**: 
   ```javascript
   if (formData.file_server) {
       // This block is NOT executed
   }
   ```
3. **Budget Addition**: 
   - No File Server added to budget
   - Cost: €0 (no additional cost)

## Test Scenarios

### Scenario 1: File Server = YES
**User Input:**
- 50 users
- 2 sites
- File Server: YES
- Internet: STARLINK 100MBps

**Budget Calculation:**
- User equipment: €40,000 (50 laptops)
- Infrastructure: €8,000 (servers, racks, etc.)
- **File Server: €1,500** ← Added because YES was selected
- Internet: €200
- **Total: €49,700**

### Scenario 2: File Server = NO
**User Input:**
- 50 users
- 2 sites
- File Server: NO
- Internet: STARLINK 100MBps

**Budget Calculation:**
- User equipment: €40,000 (50 laptops)
- Infrastructure: €8,000 (servers, racks, etc.)
- **File Server: €0** ← Not added because NO was selected
- Internet: €200
- **Total: €48,200**

## Material Details

**File Server (Standard)**
- Category: Équipement Serveur
- Price France: €1,500
- Price Morocco: 15,000 MAD
- Description: Standard File Server
- Unit: unit

## Console Debug Output

When you test this in the browser console, you'll see:

**File Server = YES:**
```
File Server selected: YES - Adding File Server (Standard) to budget
```

**File Server = NO:**
```
File Server selected: NO - Not adding File Server to budget
```

## How to Test

1. **Setup Materials**: Click "Setup Required Materials" in Materials Dashboard
2. **Create Project**: Go to project form
3. **Test File Server**:
   - Select "Yes" → Check budget includes €1,500
   - Select "No" → Check budget does NOT include €1,500
4. **Check Console**: Open browser dev tools to see debug messages

The system automatically adds or removes the File Server cost based on the user's selection! 🎯
