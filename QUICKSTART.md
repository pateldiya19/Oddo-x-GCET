# 🚀 DayFlow HRMS - Quick Start Guide

Get the complete DayFlow employee management system running in under 5 minutes!

## ⚡ Prerequisites

Before you begin, ensure you have:
- ✅ Node.js (v18 or higher) installed
- ✅ MongoDB (v6 or higher) installed and running
- ✅ Git (for cloning the repository)
- ✅ A code editor (VS Code recommended)

## 📥 Step 1: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Environment is already configured in .env file
# No changes needed for local development!

# Start MongoDB (if not already running)
# Windows: net start MongoDB
# Linux/Mac: mongod

# Seed the database with test data
npm run seed

# Start the backend server
npm run dev
```

✅ Backend running at: `http://localhost:5000`

### Test Backend
Open: `http://localhost:5000/api/v1/health`

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-01-03T..."
}
```

## 🎨 Step 2: Setup Frontend

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
```

✅ Frontend running at: `http://localhost:5173`

## 🔑 Step 3: Login and Test

### Option 1: HR Account
- **URL**: http://localhost:5173
- **Email**: sarah@dayflow.com
- **Password**: password123
- **Access**: Full admin access, all features

### Option 2: Employee Account
- **URL**: http://localhost:5173
- **Email**: john@dayflow.com
- **Password**: password123
- **Access**: Employee dashboard, personal features

## ✨ What You Can Do

### As an Employee:
- ✅ Check in/out for attendance
- ✅ View attendance history
- ✅ Submit leave requests
- ✅ View leave balance
- ✅ Check payroll and download payslips
- ✅ View personal dashboard

### As HR:
- ✅ View admin dashboard with analytics
- ✅ Manage all employees
- ✅ View all attendance records
- ✅ Approve/reject leave requests
- ✅ Generate payroll
- ✅ Create reports
- ✅ Department management

## 🧪 Testing the System

### 1. Test Attendance
**Employee Account:**
1. Login as john@dayflow.com
2. Go to Attendance page
3. Click "Check In"
4. Wait a few seconds
5. Click "Check Out"
6. View your attendance record

### 2. Test Leave Request
**Employee Account:**
1. Go to Leave Management
2. Click "Apply for Leave"
3. Fill the form:
   - Leave Type: Paid Leave
   - Start Date: Select future date
   - End Date: Select future date
   - Reason: "Testing leave system"
4. Submit
5. See request in "Pending" status

**HR Account:**
1. Login as sarah@dayflow.com
2. Go to Leave Management
3. See all pending requests
4. Approve or reject

### 3. Test Payroll
**Employee Account:**
1. Go to Payroll page
2. View current month salary
3. Click "Download Payslip"

**HR Account:**
1. Go to Payroll
2. Create new payroll record
3. Process payment

## 📊 View Analytics

**HR Dashboard shows:**
- Total employees
- Today's attendance
- Pending leave requests
- Payroll summary
- Department statistics
- Monthly trends

## 🔧 Troubleshooting

### Backend won't start?
```bash
# Check if MongoDB is running
mongo --version

# Check if port 5000 is available
# Windows: netstat -ano | findstr :5000
# Linux/Mac: lsof -i:5000

# Check logs
cat backend/logs/all.log
```

### Frontend won't start?
```bash
# Check if port 5173 is available
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't login?
1. Make sure backend is running
2. Check if database was seeded: `npm run seed`
3. Clear browser local storage
4. Try a different browser

### API errors?
1. Check backend console for errors
2. Open browser DevTools > Network tab
3. Look for failed requests
4. Check if authorization token is being sent

## 📱 API Testing with Postman

1. Import the Postman collection:
   - Open Postman
   - Import > File
   - Select: `backend/DayFlow_API.postman_collection.json`

2. Set variables:
   - baseUrl: `http://localhost:5000/api/v1`
   - After login, copy accessToken from response

3. Test endpoints in this order:
   - Login
   - Get Profile
   - Check In
   - Get My Attendance

## 🗂️ Project Structure at a Glance

```
temp/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API endpoints
│   │   └── middleware/     # Auth, validation
│   └── .env           # Configuration (ready to use!)
│
├── frontend/         # React + TypeScript UI
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── context/
│   │   └── styles/
│   └── package.json
│
└── INTEGRATION.md   # How to connect them
```

## 📚 Documentation Files

- **README.md** - Main project overview
- **backend/README.md** - Backend API documentation
- **frontend/README.md** - Frontend documentation
- **INTEGRATION.md** - Frontend-Backend integration guide
- **BACKEND_SUMMARY.md** - Complete backend features list

## 🎯 Next Steps

### For Development:
1. Read the INTEGRATION.md guide
2. Update frontend to use real API (instead of mock data)
3. Add error handling and loading states
4. Customize for your needs

### For Production:
1. Change JWT secrets in backend/.env
2. Update MongoDB URI to production database
3. Build frontend: `npm run build`
4. Build backend: `npm run build`
5. Deploy both applications
6. Update CORS settings

## 💡 Tips

- **Backend Logs**: Check `backend/logs/` for detailed logs
- **Database**: Use MongoDB Compass to view data
- **API Testing**: Use Postman collection for all endpoints
- **Frontend**: Open DevTools > Network to see API calls
- **Errors**: Check both backend console and browser console

## 🤝 Need Help?

1. **Documentation**: Read the README files
2. **API Reference**: Check Postman collection
3. **Integration**: See INTEGRATION.md
4. **Issues**: Check console logs and error messages

## ✅ Success Checklist

Before moving forward, verify:
- [ ] MongoDB is running
- [ ] Backend server started successfully
- [ ] Database seeded with test data
- [ ] Frontend started successfully
- [ ] Can login with test credentials
- [ ] Can see dashboard data
- [ ] API health check returns success

## 🎉 You're Ready!

Your DayFlow HRMS system is now running with:
- ✅ Complete authentication system
- ✅ Employee management
- ✅ Attendance tracking
- ✅ Leave management
- ✅ Payroll system
- ✅ Reports and analytics
- ✅ Test data and users

**Start exploring and building amazing features!** 🚀

---

For detailed information about specific features, refer to:
- Backend APIs: `backend/README.md`
- Frontend Components: `frontend/README.md`
- Integration: `INTEGRATION.md`
