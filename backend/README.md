# DayFlow Backend API

Backend server for the DayFlow Employee Management System built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Employee Management** - CRUD operations for employee profiles
- **Attendance Tracking** - Check-in/out system with geolocation support
- **Leave Management** - Leave requests with approval workflow
- **Payroll System** - Salary management and payslip generation
- **Dashboard & Reports** - Analytics and report generation
- **Security** - Rate limiting, helmet, CORS, input validation
- **Logging** - Winston-based logging system
- **Database** - MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## 🛠️ Installation

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env` file in the backend directory (copy from `.env.example`):
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayflow
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
FRONTEND_URL=http://localhost:5173
```

4. **Start MongoDB**

Make sure MongoDB is running on your system:
```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Linux/Mac
mongod
```

5. **Seed the Database** (Optional but recommended for testing)
```bash
npm run seed
```

This will create:
- Sample departments
- Test users (HR and Employees)
- Attendance records (last 30 days)
- Leave requests
- Payroll records
- Notifications

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

Server will start on `http://localhost:5000`

### Production Mode
```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Sign Up
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "employeeId": "EMP001",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee",
  "department": "Engineering",
  "position": "Developer"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "employee"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "employeeId": "EMP001",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "employee"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <accessToken>
```

### Employee Endpoints

```http
GET /api/v1/employees              # Get all employees (HR only)
GET /api/v1/employees/:id          # Get employee by ID
POST /api/v1/employees             # Create employee (HR only)
PUT /api/v1/employees/:id          # Update employee (HR only)
DELETE /api/v1/employees/:id       # Delete employee (HR only)
GET /api/v1/employees/stats        # Get employee statistics (HR only)
```

### Attendance Endpoints

```http
POST /api/v1/attendance/check-in   # Check in for the day
POST /api/v1/attendance/check-out  # Check out for the day
GET /api/v1/attendance/my-attendance # Get my attendance records
GET /api/v1/attendance/all         # Get all attendance (HR only)
GET /api/v1/attendance/today       # Get today's attendance (HR only)
```

### Leave Endpoints

```http
POST /api/v1/leaves                # Create leave request
GET /api/v1/leaves/my-leaves       # Get my leave requests
GET /api/v1/leaves/all             # Get all leave requests (HR only)
PATCH /api/v1/leaves/:id/status    # Approve/Reject leave (HR only)
DELETE /api/v1/leaves/:id          # Delete leave request
```

### Payroll Endpoints

```http
GET /api/v1/payroll/my-payroll     # Get my payroll records
GET /api/v1/payroll/all            # Get all payroll (HR only)
POST /api/v1/payroll               # Create payroll (HR only)
GET /api/v1/payroll/:id            # Get payroll by ID
PUT /api/v1/payroll/:id            # Update payroll (HR only)
GET /api/v1/payroll/:id/payslip    # Generate payslip
```

### Dashboard Endpoints

```http
GET /api/v1/dashboard/employee     # Employee dashboard data
GET /api/v1/dashboard/admin        # Admin dashboard data (HR only)
GET /api/v1/dashboard/reports      # Generate reports (HR only)
```

## 🔐 Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

Access tokens expire in 15 minutes. Use the refresh token endpoint to get a new access token:

```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

## 👥 User Roles

- **employee** - Regular employee with access to own data
- **hr** - HR admin with full access to all endpoints
- **manager** - Department manager with limited admin access

## 🧪 Test Credentials (After Seeding)

**HR Account:**
- Email: `sarah@dayflow.com`
- Password: `password123`

**Employee Account:**
- Email: `john@dayflow.com`
- Password: `password123`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.ts      # Main config
│   │   └── database.ts   # Database connection
│   ├── controllers/      # Route controllers
│   │   ├── authController.ts
│   │   ├── employeeController.ts
│   │   ├── attendanceController.ts
│   │   ├── leaveController.ts
│   │   ├── payrollController.ts
│   │   └── dashboardController.ts
│   ├── middleware/       # Custom middleware
│   │   ├── auth.ts       # Authentication & authorization
│   │   ├── validate.ts   # Input validation
│   │   └── errorHandler.ts
│   ├── models/          # Mongoose models
│   │   ├── User.ts
│   │   ├── Attendance.ts
│   │   ├── Leave.ts
│   │   ├── Payroll.ts
│   │   ├── Notification.ts
│   │   └── Department.ts
│   ├── routes/          # API routes
│   │   ├── authRoutes.ts
│   │   ├── employeeRoutes.ts
│   │   ├── attendanceRoutes.ts
│   │   ├── leaveRoutes.ts
│   │   ├── payrollRoutes.ts
│   │   ├── dashboardRoutes.ts
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── logger.ts
│   │   ├── jwt.ts
│   │   ├── helpers.ts
│   │   └── seed.ts
│   ├── validators/      # Zod validation schemas
│   │   └── index.ts
│   └── server.ts        # Express app setup
├── logs/               # Log files
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with test data
- `npm test` - Run tests (coming soon)

## 🛡️ Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent brute force attacks
- **JWT** - Secure token-based authentication
- **bcrypt** - Password hashing
- **Zod** - Input validation and sanitization

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/dayflow |
| JWT_SECRET | JWT secret key | - |
| JWT_REFRESH_SECRET | Refresh token secret | - |
| JWT_EXPIRES_IN | Access token expiry | 15m |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is private and not licensed for public use.

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB port (default: 27017)

### Port Already in Use
```bash
# Kill process using port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Authentication Errors
- Verify JWT_SECRET is set in `.env`
- Check token expiration
- Ensure Authorization header format: `Bearer <token>`

## 📞 Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ by the DayFlow Team
