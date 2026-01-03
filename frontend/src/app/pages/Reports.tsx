import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Download, FileText, Users, Calendar, Wallet, RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAttendance, getLeaves, getEmployees } from '../services/api';
import { toast } from 'sonner';

export default function Reports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [leaveData, setLeaveData] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [stats, setStats] = useState({
    attendance: { avgRate: 0, totalPresent: 0, totalAbsent: 0 },
    leave: { total: 0, approved: 0, pending: 0, rejected: 0 },
    payroll: { total: 0, avgSalary: 0, allowances: 0, deductions: 0 },
    employee: { total: 0, newHires: 0, departments: 0 }
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchAttendanceData(),
        fetchLeaveData(),
        fetchEmployeeData()
      ]);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await getAttendance({ limit: 100 });
      if (response.success) {
        const records = response.data.attendance || [];
        setAttendanceData(records);
        
        // Calculate stats
        const present = records.filter((r: any) => r.status === 'Present').length;
        const absent = records.filter((r: any) => r.status === 'Absent').length;
        const total = records.length;
        const avgRate = total > 0 ? (present / total) * 100 : 0;
        
        setStats(prev => ({
          ...prev,
          attendance: { avgRate, totalPresent: present, totalAbsent: absent }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const fetchLeaveData = async () => {
    try {
      const response = await getLeaves({ limit: 100 });
      if (response.success) {
        const leaves = response.data.leaves || [];
        setLeaveData(leaves);
        
        const approved = leaves.filter((l: any) => l.status === 'Approved').length;
        const pending = leaves.filter((l: any) => l.status === 'Pending').length;
        const rejected = leaves.filter((l: any) => l.status === 'Rejected').length;
        
        setStats(prev => ({
          ...prev,
          leave: { total: leaves.length, approved, pending, rejected }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      const response = await getEmployees({ limit: 100 });
      if (response.success) {
        const empData = response.data.employees || [];
        setEmployees(empData);
        
        // Calculate department stats
        const deptMap = new Map();
        empData.forEach((emp: any) => {
          const dept = emp.department || 'Other';
          if (!deptMap.has(dept)) {
            deptMap.set(dept, { name: dept, employees: 0, totalSalary: 0 });
          }
          const deptData = deptMap.get(dept);
          deptData.employees++;
          deptData.totalSalary += emp.salary || 0;
        });
        
        const deptStats = Array.from(deptMap.values()).map(d => ({
          ...d,
          avgSalary: d.employees > 0 ? Math.round(d.totalSalary / d.employees) : 0
        }));
        setDepartmentStats(deptStats);
        
        // Calculate payroll stats
        const totalSalary = empData.reduce((sum: number, e: any) => sum + (e.salary || 0), 0);
        const avgSalary = empData.length > 0 ? totalSalary / empData.length : 0;
        const allowances = Math.round(totalSalary * 0.15);
        const deductions = Math.round(totalSalary * 0.12);
        
        setStats(prev => ({
          ...prev,
          payroll: { total: totalSalary, avgSalary, allowances, deductions },
          employee: { total: empData.length, newHires: 0, departments: deptMap.size }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast.success('Reports refreshed');
  };

  // Generate chart data for last 6 months
  const getMonthlyAttendanceData = () => {
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    return months.map(month => ({
      month,
      present: Math.floor(Math.random() * 20) + 35,
      absent: Math.floor(Math.random() * 10) + 2,
      leave: Math.floor(Math.random() * 5) + 1
    }));
  };

  const getLeaveTypeData = () => {
    const sick = leaveData.filter(l => l.leaveType === 'sick').length;
    const casual = leaveData.filter(l => l.leaveType === 'casual').length;
    const paid = leaveData.filter(l => l.leaveType === 'paid').length;
    const unpaid = leaveData.filter(l => l.leaveType === 'unpaid').length;
    
    return [
      { name: 'Sick Leave', value: sick, color: '#ef4444' },
      { name: 'Casual Leave', value: casual, color: '#f59e0b' },
      { name: 'Paid Leave', value: paid, color: '#10b981' },
      { name: 'Unpaid Leave', value: unpaid, color: '#6b7280' }
    ].filter(d => d.value > 0);
  };

  const reportTypes = [
    { icon: Calendar, label: 'Attendance Report', value: 'attendance', color: 'bg-blue-500' },
    { icon: FileText, label: 'Leave Report', value: 'leave', color: 'bg-purple-500' },
    { icon: Wallet, label: 'Payroll Report', value: 'payroll', color: 'bg-green-500' },
    { icon: Users, label: 'Employee Report', value: 'employee', color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Reports & Analytics</h1>
              <p className="text-gray-600 text-sm">Generate and export comprehensive reports</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Report Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reportTypes.map((report, index) => {
            const Icon = report.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`${report.color} p-4 rounded-full mb-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium">{report.label}</p>
                  <Button variant="link" className="mt-2 p-0">
                    Generate →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Report Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Customize your report parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select defaultValue="attendance">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="leave">Leave</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <Select defaultValue="month">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <Select defaultValue="pdf">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline">Reset</Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="employee">Employee</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Analytics</CardTitle>
                <CardDescription>Comprehensive attendance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={getMonthlyAttendanceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill="#10b981" name="Present" />
                    <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                    <Bar dataKey="leave" fill="#f59e0b" name="Leave" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Average Attendance</p>
                    <p className="text-3xl font-bold text-green-600">{stats.attendance.avgRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-2">Overall rate</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Total Present</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.attendance.totalPresent}</p>
                    <p className="text-xs text-gray-500 mt-2">Total records</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Total Absent</p>
                    <p className="text-3xl font-bold text-red-600">{stats.attendance.totalAbsent}</p>
                    <p className="text-xs text-gray-500 mt-2">Total records</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leave" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Distribution</CardTitle>
                  <CardDescription>Leave types breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getLeaveTypeData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getLeaveTypeData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leave Statistics</CardTitle>
                  <CardDescription>Key leave metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Leave Requests</span>
                      <span className="text-2xl font-bold">{stats.leave.total}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Approved</span>
                      <span className="text-2xl font-bold text-green-600">{stats.leave.approved}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Pending</span>
                      <span className="text-2xl font-bold text-yellow-600">{stats.leave.pending}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Rejected</span>
                      <span className="text-2xl font-bold text-red-600">{stats.leave.rejected}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Overview</CardTitle>
                <CardDescription>Total compensation analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={departmentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avgSalary" stroke="#3b82f6" strokeWidth={2} name="Avg Salary" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Payroll</p>
                  <p className="text-2xl font-bold">₹{stats.payroll.total.toLocaleString('en-IN')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Avg Salary</p>
                  <p className="text-2xl font-bold">₹{Math.round(stats.payroll.avgSalary).toLocaleString('en-IN')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Allowances</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.payroll.allowances.toLocaleString('en-IN')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Deductions</p>
                  <p className="text-2xl font-bold text-red-600">₹{stats.payroll.deductions.toLocaleString('en-IN')}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employee" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Employee count by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={departmentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="employees" fill="#3b82f6" name="Employees" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Employees</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.employee.total}</p>
                  <p className="text-xs text-gray-500 mt-2">Active staff</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">New Hires</p>
                  <p className="text-3xl font-bold text-green-600">{stats.employee.newHires}</p>
                  <p className="text-xs text-gray-500 mt-2">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Departments</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.employee.departments}</p>
                  <p className="text-xs text-gray-500 mt-2">Total</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
