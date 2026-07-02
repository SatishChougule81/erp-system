# ERP System - Complete Enterprise Resource Planning Solution

A full-featured ERP system built with Node.js, Express, SQLite, and React.

## 🎯 Features Implemented

### ✅ Basic Features
- **Employee Management** - CRUD operations, search, department management
- **Inventory Management** - Stock tracking, low stock alerts, item categorization
- **Purchase Orders** - Create POs, track supplier orders, status management
- **Dashboard** - Real-time metrics, analytics, visual charts

### ✅ Medium Features
- **Payroll Management** - Calculate salaries, track deductions, process payroll
- **Attendance System** - Check-in/check-out, mark attendance, monthly summaries
- **Procurement Workflows** - Request creation, multi-level approvals, status tracking
- **Reporting** - Department analytics, inventory trends, payroll summaries
- **Notifications** - System notifications, read/unread status

## 📋 System Requirements

- **Node.js**: v14+ 
- **NPM**: v6+
- **SQLite3**: (included with Node.js packages)
- **RAM**: 512MB minimum
- **Disk Space**: 200MB

## 🚀 Quick Start (2 Minutes)

### Step 1: Extract and Navigate
```bash
unzip erp-system.zip
cd erp-system
```

### Step 2: Install Dependencies
```bash
npm run install-all
```

### Step 3: Create Demo Data (Optional)
```bash
node scripts/seedDatabase.js
```

### Step 4: Start the Application
```bash
# Terminal 1 - Start backend server
npm start

# Terminal 2 - Start React frontend
cd client
npm start
```

The application will open at `http://localhost:3000`

## 📝 Demo Credentials

After seeding database:
- **Email**: demo@example.com
- **Password**: demo123

## 📂 Project Structure

```
erp-system/
├── server.js                  # Express server entry point
├── database.js                # SQLite database initialization
├── package.json               # Backend dependencies
├── routes/
│   ├── auth.js               # Authentication & JWT
│   ├── employees.js          # Employee CRUD
│   ├── inventory.js          # Inventory management
│   ├── purchaseOrders.js     # Purchase order handling
│   ├── attendance.js         # Attendance tracking
│   ├── payroll.js            # Payroll calculations
│   ├── procurement.js        # Procurement workflows
│   ├── notifications.js      # System notifications
│   └── dashboard.js          # Analytics & reporting
└── client/                    # React frontend
    ├── package.json
    ├── src/
    │   ├── App.js            # Main app component
    │   ├── App.css           # Global styles
    │   └── pages/
    │       ├── Login.js      # Authentication
    │       ├── Dashboard.js  # Dashboard with charts
    │       ├── Employees.js  # Employee management
    │       ├── Inventory.js  # Inventory management
    │       ├── PurchaseOrders.js
    │       ├── Attendance.js
    │       ├── Payroll.js
    │       └── Procurement.js
```

## 🔧 Configuration

### Backend Environment (.env)
Create `.env` file in root:
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
DATABASE_PATH=./erp.db
```

### Database
- **Type**: SQLite3
- **Location**: `./erp.db`
- **Auto-created**: On first run

## 💾 Database Schema

### Core Tables
- **users** - System users with authentication
- **employees** - Employee master data
- **inventory** - Stock items and quantities
- **purchaseOrders** - PO header and line items
- **attendance** - Daily attendance records
- **payroll** - Monthly payroll data
- **procurementWorkflows** - Approval chain management
- **notifications** - User notifications
- **dashboardMetrics** - Analytics data

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (bcryptjs)
- ✅ Secure API routes
- ✅ CORS enabled
- ✅ Input validation

## 🎨 UI Features

- Responsive dashboard with charts
- Intuitive forms with validation
- Real-time data updates
- Status indicators & badges
- Search & filtering capabilities
- Modal dialogs for actions
- Mobile-friendly design

## 📊 Key Pages & Modules

### Dashboard
- Total employees count
- Inventory value tracking
- Pending purchase orders
- Low stock alerts
- Employee attendance summary
- Monthly payroll trends
- Department-wise salary analysis

### Employees
- Add/edit/delete employees
- Search functionality
- Department management
- Salary tracking

### Inventory
- Item master management
- Stock quantity updates
- Low stock warnings
- Supplier management
- Category organization

### Purchase Orders
- Create POs with multiple items
- Track supplier deliveries
- Order status management
- Amount tracking

### Attendance
- Daily check-in/check-out
- Manual attendance marking
- Monthly summaries
- Leave management

### Payroll
- Monthly salary calculations
- Allowances & deductions
- Bulk payroll processing
- Year-wise summaries

### Procurement
- Request creation
- Multi-level approvals
- Approval chain management
- Request status tracking

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - List all
- `POST /api/employees` - Create
- `PUT /api/employees/:id` - Update
- `DELETE /api/employees/:id` - Delete
- `GET /api/employees/search/:query` - Search

### Inventory
- `GET /api/inventory` - List all items
- `POST /api/inventory` - Add item
- `PUT /api/inventory/:id` - Update item
- `PATCH /api/inventory/:id/stock` - Update stock
- `GET /api/inventory/alerts/low-stock` - Low stock items

### Purchase Orders
- `GET /api/purchase-orders` - List all POs
- `POST /api/purchase-orders` - Create PO
- `PATCH /api/purchase-orders/:id/status` - Update status
- `DELETE /api/purchase-orders/:id` - Delete PO

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/summary/:month/:year` - Get summary

### Payroll
- `GET /api/payroll/employee/:employeeId` - Employee payroll
- `GET /api/payroll/:month/:year` - Period payroll
- `POST /api/payroll` - Create/update payroll
- `POST /api/payroll/process/bulk` - Bulk process

### Procurement
- `GET /api/procurement` - List requests
- `POST /api/procurement` - Create request
- `PATCH /api/procurement/:id/submit` - Submit for approval
- `PATCH /api/procurement/:id/approve` - Approve request
- `PATCH /api/procurement/:id/reject` - Reject request

### Dashboard
- `GET /api/dashboard/overview` - Key metrics
- `GET /api/dashboard/employees` - Employee stats
- `GET /api/dashboard/inventory-trends` - Inventory analytics
- `GET /api/dashboard/payroll-summary/:year` - Payroll trends

## 📱 Responsive Design

Works perfectly on:
- Desktop browsers (1920px+)
- Tablets (768px - 1024px)
- Mobile devices (320px+)

## 🧪 Testing the System

### 1. Add Sample Data
```bash
# Use demo credentials to login
# Create employees, inventory items, and purchase orders
# Track attendance and generate payroll
```

### 2. Test Core Workflows
- Create a procurement request → Submit → Approve
- Create a purchase order → Track status
- Mark employee attendance → View monthly summary
- Create payroll → Process monthly

## 📈 Scaling & Advanced Features (Future)

For enterprise use, consider:
- Manufacturing workflows
- Predictive analytics & forecasting
- Multi-company setup
- Complex approval chains
- Third-party integrations
- Real-time notifications
- Advanced reporting

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

### Database Locked
```bash
# Delete erp.db and restart
rm erp.db
npm start
```

### Module Not Found
```bash
# Reinstall dependencies
npm install
cd client && npm install
```

### CORS Issues
- Ensure proxy in client/package.json points to backend
- Backend CORS is configured in server.js

## 📞 Support & Maintenance

### Backup Database
```bash
cp erp.db erp.db.backup
```

### Reset Database
```bash
rm erp.db
npm start  # Creates fresh database
```

## 📄 License

Free to use and modify for personal/commercial projects.

## 🎓 Learning Resources

This ERP system demonstrates:
- RESTful API design
- JWT authentication
- Database design with SQLite
- React component architecture
- Responsive UI/UX
- Real-time data management
- Multi-module applications

## 💡 Tips for Customization

1. **Add New Modules**: Create new routes in `/routes` folder
2. **Modify Database**: Edit `/database.js` schema
3. **Customize UI**: Update styles in `/client/src/App.css`
4. **Add Features**: Extend existing components with new functionality
5. **API Documentation**: Use Postman to test all endpoints

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready ✅
