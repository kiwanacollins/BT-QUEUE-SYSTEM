# BT Queue System - Excel Export Feature

## 📊 **Excel Export Feature**

The system includes the ability to export recently called customers to an Excel spreadsheet with detailed information.

### **How to Use Excel Export:**

1. **Call some customers** - Use the "Call Customer" button in the queue dashboard
2. **Click "Export Excel"** - Look for the green Excel button in the header
3. **Download automatically** - The Excel file will download with current date

### **Excel File Contents:**

The exported Excel file includes:
- **Customer Name** - Full name of the customer
- **Phone Number** - Contact information
- **Device/Equipment** - What they brought for repair
- **Check-in Time** - When they joined the queue (12-hour format)
- **Called Time** - When they were called for service (12-hour format)
- **Wait Duration** - How long they waited (in minutes)
- **Status** - Current status (Called/Completed)

### **Excel File Features:**

- ✅ **Professional formatting** with title and date
- ✅ **Auto-sized columns** for easy reading
- ✅ **Sequential numbering** of customers
- ✅ **Summary information** (total customers, export date)
- ✅ **Filename with current date** for easy organization

### **File Naming:**
Files are automatically named: `BT-Called-Customers-YYYY-MM-DD.xlsx`

### **Benefits:**
- 📈 **Analytics** - Track customer service patterns
- 📊 **Reporting** - Create daily/weekly reports
- 📋 **Record Keeping** - Maintain customer service logs
- 🔄 **Data Sharing** - Easy to share with management
- 💾 **Backup** - Keep records of served customers

### **Technical Notes:**
- Only exports customers with "Called" status
- Calculates wait times automatically
- Uses xlsx format for maximum compatibility
- Works offline (no internet required for export)

The Excel export is perfect for daily reporting, performance analysis, and maintaining service records for the BT Repair Centre.
