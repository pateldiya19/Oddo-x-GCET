// Get API base URL from environment or use default
const getApiBaseUrl = () => {
  try {
    return import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  } catch {
    return 'http://localhost:5000/api/v1';
  }
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.clear();
    window.location.href = '/signin';
    throw new Error('Unauthorized');
  }

  return response;
};

// Dashboard APIs
export const getDashboard = async (type: 'employee' | 'admin') => {
  const endpoint = type === 'employee' ? '/dashboard/employee' : '/dashboard/admin';
  const response = await fetchWithAuth(endpoint);
  return response.json();
};

// Attendance APIs
export const getAttendance = async (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  // Get user from localStorage to determine which endpoint to use
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isHROrManager = user?.role === 'hr' || user?.role === 'manager';
  
  // HR/Managers use /attendance/all endpoint, employees use /attendance/my-attendance
  const endpoint = isHROrManager 
    ? `/attendance/all?${queryParams.toString()}`
    : `/attendance/my-attendance?${queryParams.toString()}`;
  
  const response = await fetchWithAuth(endpoint);
  return response.json();
};

export const checkIn = async () => {
  const response = await fetchWithAuth('/attendance/check-in', {
    method: 'POST',
  });
  return response.json();
};

export const checkOut = async () => {
  const response = await fetchWithAuth('/attendance/check-out', {
    method: 'POST',
  });
  return response.json();
};

export const getTodayAttendance = async () => {
  const response = await fetchWithAuth('/attendance/today');
  return response.json();
};

export const getMyTodayAttendance = async () => {
  const response = await fetchWithAuth('/attendance/my-today');
  return response.json();
};

// Leave APIs
export const getLeaves = async (params?: { status?: string; page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  // Get user from localStorage to determine which endpoint to use
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isHROrManager = user?.role === 'hr' || user?.role === 'manager';
  
  // HR/Managers use /leaves/all endpoint, employees use /leaves/my-leaves
  const endpoint = isHROrManager 
    ? `/leaves/all?${queryParams.toString()}`
    : `/leaves/my-leaves?${queryParams.toString()}`;
  
  const response = await fetchWithAuth(endpoint);
  return response.json();
};

export const createLeaveRequest = async (data: {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}) => {
  const response = await fetchWithAuth('/leaves', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateLeaveStatus = async (leaveId: string, status: 'Approved' | 'Rejected') => {
  const response = await fetchWithAuth(`/leaves/${leaveId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return response.json();
};

// Payroll APIs
export const getPayroll = async (params?: { month?: string; year?: string; page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.month) queryParams.append('month', params.month);
  if (params?.year) queryParams.append('year', params.year);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const response = await fetchWithAuth(`/payroll?${queryParams.toString()}`);
  return response.json();
};

export const getPayrollById = async (id: string) => {
  const response = await fetchWithAuth(`/payroll/${id}`);
  return response.json();
};

// Employee APIs
export const getEmployees = async (params?: { search?: string; department?: string; status?: string; page?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.department) queryParams.append('department', params.department);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const response = await fetchWithAuth(`/employees?${queryParams.toString()}`);
  return response.json();
};

export const getEmployeeById = async (id: string) => {
  const response = await fetchWithAuth(`/employees/${id}`);
  return response.json();
};

export const updateEmployee = async (id: string, data: any) => {
  const response = await fetchWithAuth(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
};

// Profile APIs
export const getProfile = async () => {
  const response = await fetchWithAuth('/auth/profile');
  return response.json();
};

export const updateProfile = async (data: any) => {
  const response = await fetchWithAuth('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
};

// Notifications APIs
export const getNotifications = async () => {
  const response = await fetchWithAuth('/notifications');
  return response.json();
};

export const markNotificationAsRead = async (id: string) => {
  const response = await fetchWithAuth(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
  return response.json();
};
