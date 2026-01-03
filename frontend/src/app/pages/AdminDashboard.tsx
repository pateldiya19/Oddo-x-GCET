import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopNavbar from '../components/TopNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  DollarSign, 
  BarChart3,
  Settings,
  LogOut,
  X,
  RefreshCw,
  Eye,
  Wallet
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { getDashboard, updateLeaveStatus, getEmployees } from '../services/api';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchEmployees();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboard('admin');
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees({ limit: 10 });
      if (response.success) {
        setEmployees(response.data.employees || []);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    await fetchEmployees();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const handleViewLeave = (leave: any) => {
    setSelectedLeave(leave);
    setLeaveDialogOpen(true);
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      const response = await updateLeaveStatus(leaveId, 'Approved');
      if (response.success) {
        toast.success('Leave request approved');
        setLeaveDialogOpen(false);
        fetchDashboardData();
      } else {
        toast.error(response.message || 'Failed to approve leave');
      }
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      const response = await updateLeaveStatus(leaveId, 'Rejected');
      if (response.success) {
        toast.success('Leave request rejected');
        setLeaveDialogOpen(false);
        fetchDashboardData();
      } else {
        toast.error(response.message || 'Failed to reject leave');
      }
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin-dashboard', active: true },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: Calendar, label: 'Attendance', path: '/attendance' },
    { icon: FileText, label: 'Leave Requests', path: '/leave' },
    { icon: Wallet, label: 'Payroll', path: '/payroll' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const stats = [
    { 
      label: 'Total Employees', 
      value: loading ? '...' : dashboardData?.employees?.total || '0', 
      change: `${dashboardData?.employees?.active || 0} active`, 
      color: 'bg-blue-500', 
      icon: Users 
    },
    { 
      label: 'Present Today', 
      value: loading ? '...' : dashboardData?.attendance?.today?.present || '0', 
      change: dashboardData?.attendance?.today?.total ? `${((dashboardData.attendance.today.present / dashboardData.attendance.today.total) * 100).toFixed(1)}%` : '0%', 
      color: 'bg-green-500', 
      icon: Calendar 
    },
    { 
      label: 'Pending Leaves', 
      value: loading ? '...' : dashboardData?.leaves?.pending || '0', 
      change: `${dashboardData?.leaves?.recent?.length || 0} recent`, 
      color: 'bg-yellow-500', 
      icon: FileText 
    },
    { 
      label: 'Payroll Total', 
      value: loading ? '...' : `₹${((dashboardData?.payroll?.reduce((sum: number, p: any) => sum + (p.total || 0), 0) || 0) / 100000).toFixed(1)}L`, 
      change: `${dashboardData?.payroll?.length || 0} records`, 
      color: 'bg-purple-500', 
      icon: Wallet 
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out mt-16
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-0
        `}>
          <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-4 md:hidden">
                <h2 className="font-semibold">Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={index}
                      variant={item.active ? 'default' : 'ghost'}
                      className="w-full justify-start gap-3"
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden mt-16" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-x-hidden">
          {/* Welcome Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold mt-2">{stat.value}</p>
                        <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-600'}`}>
                          {stat.change} from last month
                        </p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trend</CardTitle>
                <CardDescription>Last 6 months attendance overview</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">Loading...</div>
                ) : dashboardData?.attendance?.trend && dashboardData.attendance.trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.attendance.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="leave" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { month: 'Aug', present: 45, absent: 8, leave: 2 },
                      { month: 'Sep', present: 48, absent: 5, leave: 3 },
                      { month: 'Oct', present: 50, absent: 4, leave: 2 },
                      { month: 'Nov', present: 47, absent: 6, leave: 3 },
                      { month: 'Dec', present: 49, absent: 4, leave: 3 },
                      { month: 'Jan', present: dashboardData?.employees?.present || 0, absent: 0, leave: 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="leave" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Leave Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Leave Statistics</CardTitle>
                <CardDescription>Distribution of leave types</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">Loading...</div>
                ) : dashboardData?.departments?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData.departments.map((dept: any) => ({
                          name: dept._id || 'Other',
                          value: dept.count,
                          color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][dept._id?.charCodeAt(0) % 5]
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dashboardData.departments.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Leave Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Requests</CardTitle>
              <CardDescription>Requests awaiting your approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading...</TableCell>
                      </TableRow>
                    ) : dashboardData?.leaves?.recent?.filter((req: any) => req.status === 'Pending').length > 0 ? (
                      dashboardData.leaves.recent
                        .filter((req: any) => req.status === 'Pending')
                        .map((request: any) => (
                          <TableRow key={request._id}>
                            <TableCell className="font-medium">{request.userId?.name || 'Unknown'}</TableCell>
                            <TableCell>
                              <Badge variant={request.leaveType === 'paid' ? 'default' : request.leaveType === 'sick' ? 'secondary' : 'outline'}>
                                {request.leaveType?.charAt(0).toUpperCase() + request.leaveType?.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{request.days} days</TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-500">{request.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" variant="ghost" onClick={() => handleViewLeave(request)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="default" onClick={() => handleApproveLeave(request._id)}>Approve</Button>
                              <Button size="sm" variant="outline" onClick={() => handleRejectLeave(request._id)}>Reject</Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">No pending leave requests</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Employee List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Employee List</CardTitle>
                  <CardDescription>All active employees</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Filter</Button>
                  <Button size="sm">Add Employee</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading...</TableCell>
                      </TableRow>
                    ) : employees.length > 0 ? (
                      employees.map((employee: any) => (
                        <TableRow key={employee._id}>
                          <TableCell className="font-medium">{employee.employeeId}</TableCell>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>
                            <Badge className={
                              employee.status === 'active' ? 'bg-green-500' :
                              employee.status === 'on-leave' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }>
                              {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => navigate('/employees')}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No employees found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Leave Details Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>Review and manage this leave request</DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee Name</p>
                  <p className="font-medium">{selectedLeave.userId?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">{selectedLeave.userId?.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Leave Type</p>
                  <Badge variant={selectedLeave.leaveType === 'paid' ? 'default' : 'outline'}>
                    {selectedLeave.leaveType?.charAt(0).toUpperCase() + selectedLeave.leaveType?.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={
                    selectedLeave.status === 'Pending' ? 'bg-yellow-500' :
                    selectedLeave.status === 'Approved' ? 'bg-green-500' :
                    'bg-red-500'
                  }>
                    {selectedLeave.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium">{new Date(selectedLeave.startDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium">{new Date(selectedLeave.endDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Days</p>
                  <p className="font-medium">{selectedLeave.days} day(s)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Applied On</p>
                  <p className="font-medium">{new Date(selectedLeave.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Reason</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm">{selectedLeave.reason}</p>
                </div>
              </div>
              {selectedLeave.status === 'Pending' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleRejectLeave(selectedLeave._id)}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleApproveLeave(selectedLeave._id)}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}