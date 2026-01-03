import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopNavbar from '../components/TopNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { getAttendance, getTodayAttendance, getMyTodayAttendance, checkIn, checkOut } from '../services/api';
import { toast } from 'sonner';

export default function Attendance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    halfDay: 0,
    totalHours: 0
  });
  const [checkingIn, setCheckingIn] = useState(false);
  
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

  const isEmployee = user?.role === 'employee';

  useEffect(() => {
    fetchAttendanceData();
    fetchTodayAttendance();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await getAttendance({ limit: 50 });
      if (response.success) {
        const records = response.data.attendance || [];
        setAttendanceRecords(records);
        
        // Calculate stats for employee
        if (isEmployee) {
          const present = records.filter((r: any) => r.status === 'Present').length;
          const absent = records.filter((r: any) => r.status === 'Absent').length;
          const halfDay = records.filter((r: any) => r.status === 'Half Day').length;
          const totalHours = records.reduce((sum: number, r: any) => sum + (r.hoursWorked || 0), 0);
          
          setStats({ present, absent, halfDay, totalHours });
        }
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      // Use different endpoint based on role
      const response = isEmployee ? await getMyTodayAttendance() : await getTodayAttendance();
      if (response.success) {
        setTodayAttendance(response.data.attendance);
      }
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const response = await checkIn();
      if (response.success) {
        toast.success('Checked in successfully!');
        fetchTodayAttendance();
        fetchAttendanceData();
      } else {
        toast.error(response.message || 'Failed to check in');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      const response = await checkOut();
      if (response.success) {
        toast.success('Checked out successfully!');
        fetchTodayAttendance();
        fetchAttendanceData();
      } else {
        toast.error(response.message || 'Failed to check out');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to check out');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendanceData();
    await fetchTodayAttendance();
    setRefreshing(false);
    toast.success('Attendance data refreshed');
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return '0';
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

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
              <h1 className="text-2xl font-bold">Attendance Management</h1>
              <p className="text-gray-600 text-sm">{currentDate}</p>
            </div>
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

        {isEmployee && (
          <>
            {/* Today's Attendance Card */}
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <p className="text-sm text-blue-100 mb-1">Current Time</p>
                    <p className="text-3xl font-bold">{currentTime}</p>
                    <p className="text-sm text-blue-100 mt-2">
                      Status: <span className="font-semibold">
                        {todayAttendance ? todayAttendance.status : 'Not Checked In'}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {!todayAttendance || !todayAttendance.checkInTime ? (
                      <Button 
                        variant="secondary" 
                        size="lg" 
                        className="w-full"
                        onClick={handleCheckIn}
                        disabled={checkingIn}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {checkingIn ? 'Checking In...' : 'Check In'}
                      </Button>
                    ) : (
                      <div className="text-center bg-white/10 rounded-lg p-3">
                        <p className="text-sm text-blue-100">Checked In</p>
                        <p className="font-semibold">{formatTime(todayAttendance.checkIn)}</p>
                      </div>
                    )}
                    {todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut ? (
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full bg-white/10 hover:bg-white/20 border-white/30"
                        onClick={handleCheckOut}
                        disabled={checkingIn}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {checkingIn ? 'Checking Out...' : 'Check Out'}
                      </Button>
                    ) : todayAttendance?.checkOut ? (
                      <div className="text-center bg-white/10 rounded-lg p-3">
                        <p className="text-sm text-blue-100">Checked Out</p>
                        <p className="font-semibold">{formatTime(todayAttendance.checkOut)}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Present Days</p>
                      <p className="text-xl font-bold">{stats.present}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Absent Days</p>
                      <p className="text-xl font-bold">{stats.absent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Half Days</p>
                      <p className="text-xl font-bold">{stats.halfDay}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Hours</p>
                      <p className="text-xl font-bold">{Math.round(stats.totalHours)}h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <Tabs defaultValue={isEmployee ? "daily" : "all"} className="w-full">
          <TabsList>
            {isEmployee && (
              <>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </>
            )}
            <TabsTrigger value="all">All Attendance</TabsTrigger>
          </TabsList>

          {isEmployee && (
            <>
              <TabsContent value="daily">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Timeline</CardTitle>
                    <CardDescription>Your attendance for today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : todayAttendance ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                          <div className="p-3 bg-green-500 rounded-full">
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Checked In</p>
                            <p className="text-sm text-gray-600">
                              {formatTime(todayAttendance.checkIn)} • {todayAttendance.status}
                            </p>
                          </div>
                          <Badge className="bg-green-500">{todayAttendance.status}</Badge>
                        </div>
                        {todayAttendance.checkOut ? (
                          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                            <div className="p-3 bg-blue-500 rounded-full">
                              <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Checked Out</p>
                              <p className="text-sm text-gray-600">
                                {formatTime(todayAttendance.checkOut)} • {calculateHours(todayAttendance.checkIn, todayAttendance.checkOut)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg opacity-50">
                            <div className="p-3 bg-gray-300 rounded-full">
                              <Clock className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Check Out</p>
                              <p className="text-sm text-gray-600">Pending</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No attendance record for today</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="weekly">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Attendance</CardTitle>
                    <CardDescription>Your recent attendance records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : attendanceRecords.length > 0 ? (
                      <div className="space-y-3">
                        {attendanceRecords.slice(0, 7).map((record, index) => (
                          <div key={record._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium">{formatDate(record.date)}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {formatTime(record.checkIn)} - {record.checkOut ? formatTime(record.checkOut) : 'Ongoing'}
                              </p>
                              <Badge className={
                                record.status === 'Present' ? 'bg-green-500' :
                                record.status === 'Absent' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }>
                                {record.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No attendance records found</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Attendance Records</CardTitle>
                    <CardDescription>
                      {isEmployee ? 'Your complete attendance history' : 'All employees attendance records'}
                    </CardDescription>
                  </div>
                  {!isEmployee && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Filter</Button>
                      <Button size="sm">Export</Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {!isEmployee && <TableHead>Employee</TableHead>}
                        <TableHead>Date</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={isEmployee ? 5 : 6} className="text-center py-8 text-gray-500">
                            Loading attendance records...
                          </TableCell>
                        </TableRow>
                      ) : attendanceRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isEmployee ? 5 : 6} className="text-center py-8 text-gray-500">
                            No attendance records found
                          </TableCell>
                        </TableRow>
                      ) : (
                        attendanceRecords.map((record) => (
                          <TableRow key={record._id}>
                            {!isEmployee && (
                              <TableCell className="font-medium">
                                {record.employeeName || record.userId?.name || 'Unknown'}
                              </TableCell>
                            )}
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>{formatTime(record.checkIn)}</TableCell>
                            <TableCell>{record.checkOut ? formatTime(record.checkOut) : '-'}</TableCell>
                            <TableCell>
                              {record.checkOut 
                                ? calculateHours(record.checkIn, record.checkOut)
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={
                                  record.status === 'Present' ? 'bg-green-500' :
                                  record.status === 'Leave' ? 'bg-red-500' :
                                  record.status === 'Absent' ? 'bg-red-500' :
                                  'bg-yellow-500'
                                }
                              >
                                {record.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
