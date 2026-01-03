# Frontend-Backend Integration Guide

This guide explains how to integrate the DayFlow React frontend with the Node.js backend API.

## 🔗 Quick Start

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayflow
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB

Ensure MongoDB is running on your system.

### 4. Seed the Database

```bash
cd backend
npm run seed
```

### 5. Start Backend Server

```bash
cd backend
npm run dev
```

Server will run on `http://localhost:5000`

### 6. Update Frontend Configuration

The frontend is already configured to work with the backend. Just ensure your frontend is running:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📡 API Integration

### Setting Up Axios

Create `frontend/src/services/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### Authentication Service

Create `frontend/src/services/authService.ts`:

```typescript
import api from './api';

export interface LoginData {
  email: string;
  password: string;
  role?: 'employee' | 'hr';
}

export interface SignupData {
  employeeId: string;
  name: string;
  email: string;
  password: string;
  role?: 'employee' | 'hr';
  department?: string;
  position?: string;
}

export const authService = {
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    const { accessToken, refreshToken, user } = response.data.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  signup: async (data: SignupData) => {
    const response = await api.post('/auth/signup', data);
    const { accessToken, refreshToken, user } = response.data.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};
```

### Other Services

Create similar service files for other features:

**`frontend/src/services/attendanceService.ts`:**
```typescript
import api from './api';

export const attendanceService = {
  checkIn: async (location?: { latitude: number; longitude: number }) => {
    const response = await api.post('/attendance/check-in', location);
    return response.data;
  },

  checkOut: async (location?: { latitude: number; longitude: number }) => {
    const response = await api.post('/attendance/check-out', location);
    return response.data;
  },

  getMyAttendance: async (params?: { startDate?: string; endDate?: string; page?: number }) => {
    const response = await api.get('/attendance/my-attendance', { params });
    return response.data;
  },

  getAllAttendance: async (params?: any) => {
    const response = await api.get('/attendance/all', { params });
    return response.data;
  },

  getTodayAttendance: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },
};
```

**`frontend/src/services/leaveService.ts`:**
```typescript
import api from './api';

export const leaveService = {
  createLeaveRequest: async (data: {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => {
    const response = await api.post('/leaves', data);
    return response.data;
  },

  getMyLeaves: async (params?: { status?: string; page?: number }) => {
    const response = await api.get('/leaves/my-leaves', { params });
    return response.data;
  },

  getAllLeaves: async (params?: any) => {
    const response = await api.get('/leaves/all', { params });
    return response.data;
  },

  updateLeaveStatus: async (id: string, status: string, remarks?: string) => {
    const response = await api.patch(`/leaves/${id}/status`, { status, remarks });
    return response.data;
  },

  deleteLeaveRequest: async (id: string) => {
    const response = await api.delete(`/leaves/${id}`);
    return response.data;
  },
};
```

## 🔄 Update AuthContext

Update `frontend/src/app/context/AuthContext.tsx`:

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../../services/authService';

type UserRole = 'employee' | 'hr';

interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  position?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

interface SignupData {
  employeeId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  position?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password, role });
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      const response = await authService.signup(data);
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## 🎯 Usage Examples

### In Your Components

```typescript
import { useEffect, useState } from 'react';
import { attendanceService } from '../services/attendanceService';
import { toast } from 'sonner';

function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getMyAttendance();
      setAttendance(response.data.attendance);
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceService.checkIn();
      toast.success('Checked in successfully');
      loadAttendance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  // ... rest of component
}
```

## 🔐 Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

For production:
```env
VITE_API_URL=https://your-api-domain.com/api/v1
```

## 📝 Type Definitions

Create `frontend/src/types/api.ts`:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: 'employee' | 'hr' | 'manager';
  department?: string;
  position?: string;
  avatar?: string;
  salary?: number;
  status: 'active' | 'inactive' | 'on-leave';
}

export interface Attendance {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Half-Day';
  hours: number;
}

export interface Leave {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'paid' | 'sick' | 'unpaid' | 'casual';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

export interface Payroll {
  id: string;
  userId: string;
  employeeId: string;
  employeeName: string;
  month: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  tax: number;
  netSalary: number;
  status: 'Pending' | 'Paid' | 'Failed';
}
```

## ✅ Testing the Integration

### 1. Start Both Servers

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 2. Test Login

Open `http://localhost:5173` and login with:
- **HR**: sarah@dayflow.com / password123
- **Employee**: john@dayflow.com / password123

### 3. Verify API Calls

Open browser DevTools > Network tab to see API requests.

## 🐛 Common Issues

### CORS Errors
- Ensure backend `.env` has correct `FRONTEND_URL`
- Check CORS configuration in `backend/src/server.ts`

### 401 Unauthorized
- Check if token is being sent in headers
- Verify token hasn't expired
- Check refresh token logic

### Connection Refused
- Ensure backend server is running on port 5000
- Check MongoDB is running

## 📚 Next Steps

1. Replace mock data in frontend with API calls
2. Add error handling and loading states
3. Implement file upload for profile pictures
4. Add real-time notifications with WebSockets (optional)
5. Implement advanced filtering and search
6. Add data caching with React Query or SWR

## 🎓 Best Practices

- ✅ Always handle loading and error states
- ✅ Use TypeScript for type safety
- ✅ Implement proper error messages for users
- ✅ Add request cancellation for cleanup
- ✅ Use environment variables for API URLs
- ✅ Implement request/response logging in development
- ✅ Add request retry logic for failed requests

---

For more details, see the [Backend README](../backend/README.md) for complete API documentation.
