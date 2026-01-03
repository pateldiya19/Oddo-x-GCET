# DayFlow - Complete Setup Guide

## 🚀 Quick Start Guide

This guide will help you set up DayFlow HRMS on your local machine in under 10 minutes.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- ✅ **MongoDB** - Local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **Code Editor** - VS Code recommended
- ✅ **Terminal** - PowerShell, Command Prompt, or Bash

### Check Prerequisites

```bash
# Check Node.js version
node --version  # Should be v18.0.0 or higher

# Check npm version
npm --version   # Should be 8.0.0 or higher

# Check MongoDB (if local)
mongod --version
```

---

## 📥 Installation Steps

### Step 1: Clone or Download Project

```bash
# If using Git
git clone <your-repository-url>
cd dayflow

# OR download ZIP and extract
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
# Windows PowerShell:
Copy-Item .env.example .env

# macOS/Linux:
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/dayflow

# Option 2: MongoDB Atlas (recommended)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dayflow?retryWrites=true&w=majority

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-too

# JWT Expiry
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

**Important**: Change the JWT secrets to random strings!

### Step 4: Frontend Setup

```bash
# Open new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file (optional)
# Windows PowerShell:
Copy-Item .env.example .env.local

# macOS/Linux:
cp .env.example .env.local
```

Edit `frontend/.env.local` (if needed):

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 🏃‍♂️ Running the Application

### Option 1: Run Both Servers Simultaneously

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Option 2: Using Separate PowerShell Windows

**Backend Window:**
```powershell
cd E:\temp\backend
npm run dev
```

**Frontend Window:**
```powershell
cd E:\temp\frontend
npm run dev
```

---

## 🌐 Accessing the Application

Once both servers are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1
- **MongoDB**: mongodb://localhost:27017 (if local)

---

## 👤 Creating Your First Account

### Register as HR Admin

1. Open http://localhost:5173
2. Click "Sign Up"
3. Fill in the registration form:
   ```
   Name: Admin User
   Email: admin@company.com
   Password: SecurePassword123
   Employee ID: EMP001
   Department: HR
   Position: HR Manager
   Role: hr
   ```
4. Click "Register"
5. You'll be redirected to the HR dashboard

### Register as Employee

1. Sign out from admin account
2. Click "Sign Up"
3. Fill in the registration form:
   ```
   Name: John Doe
   Email: john@company.com
   Password: SecurePassword123
   Employee ID: EMP002
   Department: Engineering
   Position: Software Developer
   Role: employee
   ```
4. Click "Register"
5. You'll be redirected to the employee dashboard

---

## 🧪 Testing the Features

### Test Attendance (Employee)
1. Login as employee
2. Navigate to "Attendance"
3. Click "Check In"
4. View attendance records
5. Click "Check Out" after some time

### Test Leave Management (Employee)
1. Navigate to "Leave Management"
2. Click "Apply Leave"
3. Select dates and leave type
4. Enter reason (minimum 10 characters)
5. Submit

### Test Leave Approval (HR)
1. Login as HR admin
2. Go to "Admin Dashboard"
3. View pending leave requests
4. Click "Show" to view details
5. Click "Approve" or "Reject"

### Test Payroll (HR)
1. Login as HR admin
2. Navigate to "Payroll"
3. Click "Edit" on any employee
4. Enter a base salary (e.g., 50000)
5. View auto-calculated breakdown
6. Save changes

---

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error**: `MongoServerError: Authentication failed`

**Solution**:
1. Check MongoDB URI in `.env`
2. Verify username and password
3. Ensure IP is whitelisted (MongoDB Atlas)

**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solution**:
1. Start MongoDB service:
   ```bash
   # Windows (Run as Administrator)
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
```bash
# Windows PowerShell (Run as Administrator)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Frontend Not Loading

**Error**: `Failed to fetch` or CORS error

**Solution**:
1. Ensure backend is running on port 5000
2. Check `FRONTEND_URL` in backend `.env`
3. Verify `VITE_API_URL` in frontend `.env.local`

### Module Not Found

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

---

## 📦 Database Setup

### Option 1: MongoDB Local

```bash
# Install MongoDB Community Server
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB
mongod

# Connect to MongoDB
mongo

# Create database
use dayflow
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster (Free M0)
4. Create database user
5. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
6. Get connection string
7. Update `MONGODB_URI` in `.env`

### Sample Data (Optional)

To populate with sample data:

```bash
cd backend
node scripts/seed.js  # If seed script exists
```

---

## 🛠️ Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "mongodb.mongodb-vscode",
    "rangav.vscode-thunder-client"
  ]
}
```

### Testing API Endpoints

Use Thunder Client, Postman, or curl:

```bash
# Register User
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "employeeId": "EMP003",
    "department": "IT",
    "position": "Developer",
    "role": "employee"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 📊 Database Schema

### Collections Created

1. **users** - Employee/HR user accounts
2. **attendance** - Check-in/out records
3. **leaves** - Leave requests
4. **payroll** - Salary records (future)
5. **notifications** - User notifications (future)

### Indexes

Automatically created indexes:
- `users.email` (unique)
- `users.employeeId` (unique)
- `attendance.userId + date`
- `leaves.userId + status`

---

## 🔐 Security Best Practices

### Before Production

1. ✅ Change all JWT secrets
2. ✅ Use strong passwords
3. ✅ Enable MongoDB authentication
4. ✅ Configure CORS properly
5. ✅ Use environment variables
6. ✅ Enable HTTPS
7. ✅ Set secure cookies
8. ✅ Add rate limiting

### Environment Variables Checklist

```env
✅ PORT - Server port (5000)
✅ MONGODB_URI - Database connection
✅ JWT_SECRET - Random string (min 32 chars)
✅ JWT_REFRESH_SECRET - Different random string
✅ NODE_ENV - development/production
✅ FRONTEND_URL - Frontend URL for CORS
```

---

## 📝 Common Commands

### Backend Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run linter
npm run lint

# Build TypeScript
npm run build
```

### Frontend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🎯 Next Steps

After successful setup:

1. ✅ Explore all features
2. ✅ Create test data
3. ✅ Test all user roles
4. ✅ Review API endpoints
5. ✅ Customize branding
6. ✅ Add company data
7. ✅ Configure email (if needed)
8. ✅ Set up backup

---

## 📞 Support

If you encounter any issues:

1. Check this guide thoroughly
2. Review error messages
3. Check browser console
4. Check terminal logs
5. Verify all prerequisites
6. Open an issue in repository

---

## ✅ Setup Verification Checklist

- [ ] Node.js installed (v18+)
- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment files configured
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] Can access login page
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Can view dashboard

**Congratulations! 🎉 Your DayFlow HRMS is ready!**
