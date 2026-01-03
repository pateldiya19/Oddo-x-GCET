# DayFlow - Complete HRMS Solution

A modern, full-stack employee management system built with React, TypeScript, Node.js, and MongoDB.

## 📁 Project Structure

```
temp/
├── frontend/          # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── data/
│   │   │   └── pages/
│   │   └── styles/
│   └── package.json
│
├── backend/           # Node.js + Express + MongoDB backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── validators/
│   └── package.json
│
└── INTEGRATION.md    # Integration guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (v6+)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd temp
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run seed
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1

### Test Credentials

**HR Account:**
- Email: sarah@dayflow.com
- Password: password123

**Employee Account:**
- Email: john@dayflow.com
- Password: password123

## 📖 Documentation

- [Frontend README](frontend/README.md) - Frontend setup and features
- [Backend README](backend/README.md) - API documentation and backend setup
- [Integration Guide](INTEGRATION.md) - How to connect frontend and backend

## ✨ Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Employee, HR, Manager)
- ✅ Secure password hashing
- ✅ Token refresh mechanism

### Employee Management
- ✅ Employee CRUD operations
- ✅ Profile management
- ✅ Department organization
- ✅ Search and filtering

### Attendance Tracking
- ✅ Check-in/Check-out system
- ✅ Real-time attendance monitoring
- ✅ Attendance history and reports
- ✅ Work hours calculation
- ✅ Geolocation support (optional)

### Leave Management
- ✅ Leave request submission
- ✅ Multi-level approval workflow
- ✅ Leave balance tracking
- ✅ Multiple leave types (Paid, Sick, Casual, Unpaid)
- ✅ Leave calendar and history

### Payroll System
- ✅ Salary structure management
- ✅ Automated payslip generation
- ✅ Deductions and allowances
- ✅ Tax calculations
- ✅ Payment history
- ✅ Bonus management

### Dashboard & Reports
- ✅ Employee dashboard with personal metrics
- ✅ Admin dashboard with company-wide analytics
- ✅ Attendance reports
- ✅ Leave reports
- ✅ Payroll reports
- ✅ Department-wise statistics

### Security Features
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Radix UI** - Component primitives
- **React Router** - Routing
- **React Hook Form** - Form management
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Zod** - Validation
- **Winston** - Logging
- **Helmet** - Security

## 📊 Database Schema

### Collections
- **Users** - Employee profiles and authentication
- **Attendance** - Check-in/out records
- **Leaves** - Leave requests and approvals
- **Payroll** - Salary and payment information
- **Departments** - Department organization
- **Notifications** - User notifications

## 🔐 API Endpoints

### Authentication
```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/logout
GET    /api/v1/auth/profile
PUT    /api/v1/auth/profile
```

### Employees
```
GET    /api/v1/employees
POST   /api/v1/employees
GET    /api/v1/employees/:id
PUT    /api/v1/employees/:id
DELETE /api/v1/employees/:id
GET    /api/v1/employees/stats
```

### Attendance
```
POST   /api/v1/attendance/check-in
POST   /api/v1/attendance/check-out
GET    /api/v1/attendance/my-attendance
GET    /api/v1/attendance/all
GET    /api/v1/attendance/today
```

### Leaves
```
POST   /api/v1/leaves
GET    /api/v1/leaves/my-leaves
GET    /api/v1/leaves/all
PATCH  /api/v1/leaves/:id/status
DELETE /api/v1/leaves/:id
```

### Payroll
```
GET    /api/v1/payroll/my-payroll
POST   /api/v1/payroll
GET    /api/v1/payroll/all
GET    /api/v1/payroll/:id
PUT    /api/v1/payroll/:id
GET    /api/v1/payroll/:id/payslip
```

### Dashboard
```
GET    /api/v1/dashboard/employee
GET    /api/v1/dashboard/admin
GET    /api/v1/dashboard/reports
```

## 🧪 Development

### Running Tests
```bash
cd backend
npm test
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm run build
npm start
```

## 📝 Environment Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayflow
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and not licensed for public use.

## 🙏 Acknowledgments

- Built with modern web technologies
- Follows industry best practices
- Implements secure authentication patterns
- Uses MongoDB for flexible data modeling

## 📞 Support

For issues and questions:
1. Check the documentation
2. Review the integration guide
3. Open an issue in the repository

---

#

