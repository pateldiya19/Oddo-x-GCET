import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import TopNavbar from '../components/TopNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { 
  User, 
  Calendar, 
  FileText, 
  DollarSign, 
  LogOut, 
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { getDashboard, checkIn, checkOut } from '../services/api';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboard('employee');
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const response = await checkIn();
      if (response.success) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to check in:', error);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      const response = await checkOut();
      if (response.success) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to check out:', error);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const quickActions = [
    { icon: User, label: 'Profile', color: 'bg-blue-500', path: '/profile' },
    { icon: Calendar, label: 'Attendance', color: 'bg-green-500', path: '/attendance' },
    { icon: FileText, label: 'Leave Requests', color: 'bg-purple-500', path: '/leave' },
    { icon: Wallet, label: 'Payroll', color: 'bg-yellow-500', path: '/payroll' },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavbar />
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="text-center py-12">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white">
                <AvatarFallback className="bg-blue-700 text-white text-2xl">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-blue-100 mt-1">{user?.position} • {user?.department}</p>
                <p className="text-sm text-blue-200 mt-1">Employee ID: {user?.employeeId}</p>
              </div>
              <Button 
                variant="secondary" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className={`${action.color} p-4 rounded-full mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-medium">{action.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Today's Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`p-2 ${dashboardData?.todayAttendance ? 'bg-green-100' : 'bg-gray-100'} rounded-lg`}>
                  <CheckCircle2 className={`h-6 w-6 ${dashboardData?.todayAttendance ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardData?.todayAttendance?.status || 'Not Checked In'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {dashboardData?.todayAttendance?.checkIn 
                      ? `Checked in at ${new Date(dashboardData.todayAttendance.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                      : 'Ready to check in'}
                  </p>
                </div>
              </div>
              {!dashboardData?.todayAttendance?.checkIn && (
                <Button onClick={handleCheckIn} disabled={checkingIn} className="w-full mt-3">
                  {checkingIn ? 'Checking in...' : 'Check In'}
                </Button>
              )}
              {dashboardData?.todayAttendance?.checkIn && !dashboardData?.todayAttendance?.checkOut && (
                <Button onClick={handleCheckOut} disabled={checkingIn} variant="outline" className="w-full mt-3">
                  {checkingIn ? 'Checking out...' : 'Check Out'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Leave Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardData?.stats?.leaves?.remaining || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Days remaining ({dashboardData?.stats?.leaves?.pending || 0} pending)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardData?.stats?.attendance?.present || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Days present
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Attendance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 rounded-full bg-blue-100">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent activities</p>
                    <p className="text-sm mt-1">Your activities will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>Current month overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Present</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {dashboardData?.stats?.attendance?.present || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Absent</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {dashboardData?.stats?.attendance?.absent || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Leave</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">
                    {dashboardData?.stats?.attendance?.leave || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Half-Day</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {dashboardData?.stats?.attendance?.halfDay || 0}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/attendance')}>
                View Full History
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Leave */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Leave</CardTitle>
            <CardDescription>Your scheduled time off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">Family Vacation</p>
                  <p className="text-sm text-gray-600">Jan 15 - Jan 17, 2026 (3 days)</p>
                </div>
              </div>
              <Badge className="bg-yellow-500">Pending</Badge>
            </div>
            <Button variant="link" className="mt-2" onClick={() => navigate('/leave')}>
              View all leave requests →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
