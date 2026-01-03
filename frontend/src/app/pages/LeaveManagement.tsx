import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopNavbar from '../components/TopNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Calendar as CalendarIcon, ArrowLeft, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getLeaves, createLeaveRequest, updateLeaveStatus } from '../services/api';

export default function LeaveManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  const isEmployee = user?.role === 'employee';

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await getLeaves();
      if (response.success) {
        setLeaveRequests(response.data.leaves || []);
      }
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLeave = async () => {
    // Frontend validation
    if (!leaveType || !startDate || !endDate || !reason) {
      toast.error('Please fill all fields');
      return;
    }

    if (reason.length < 10) {
      toast.error('Reason must be at least 10 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createLeaveRequest({
        leaveType,
        startDate,
        endDate,
        reason,
      });

      if (response.success) {
        toast.success('Leave request submitted successfully!');
        setDialogOpen(false);
        // Reset form
        setLeaveType('');
        setStartDate('');
        setEndDate('');
        setReason('');
        fetchLeaveRequests();
      } else {
        // Handle validation errors from backend
        if (response.errors && Array.isArray(response.errors)) {
          response.errors.forEach((err: any) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(response.message || 'Failed to submit leave request');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await updateLeaveStatus(id, 'Approved');
      if (response.success) {
        toast.success('Leave request approved');
        fetchLeaveRequests();
      } else {
        toast.error(response.message || 'Failed to approve leave');
      }
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await updateLeaveStatus(id, 'Rejected');
      if (response.success) {
        toast.success('Leave request rejected');
        fetchLeaveRequests();
      } else {
        toast.error(response.message || 'Failed to reject leave');
      }
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  const handleViewDetails = (leave: any) => {
    setSelectedLeave(leave);
    setDetailsDialogOpen(true);
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
              <h1 className="text-2xl font-bold">Leave Management</h1>
              <p className="text-gray-600 text-sm">Manage your time off requests</p>
            </div>
          </div>
          {isEmployee && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>Apply for Leave</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                  <DialogDescription>Submit a new leave request</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select value={leaveType} onValueChange={setLeaveType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                        <SelectItem value="casual">Casual Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please provide a detailed reason for your leave (minimum 10 characters)..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500">
                      {reason.length}/10 characters minimum
                      {reason.length > 0 && reason.length < 10 && (
                        <span className="text-red-500 ml-2">({10 - reason.length} more needed)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
                    <Button onClick={handleSubmitLeave} disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Leave Balance Cards */}
        {isEmployee && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Leave</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Used</p>
                    <p className="text-2xl font-bold text-red-600">8</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-green-600">16</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">1</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue={isEmployee ? "status" : "pending"} className="w-full">
          <TabsList>
            {isEmployee ? (
              <>
                <TabsTrigger value="status">My Requests</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </>
            )}
          </TabsList>

          {isEmployee ? (
            <>
              <TabsContent value="status">
                <Card>
                  <CardHeader>
                    <CardTitle>Leave Requests</CardTitle>
                    <CardDescription>Your current leave applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                      ) : leaveRequests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No leave requests found</div>
                      ) : (
                        leaveRequests.map((request) => (
                          <div key={request._id} className="p-4 border rounded-lg">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={request.leaveType === 'paid' ? 'default' : request.leaveType === 'sick' ? 'secondary' : 'outline'}>
                                    {request.leaveType?.charAt(0).toUpperCase() + request.leaveType?.slice(1)}
                                  </Badge>
                                  <Badge className={
                                    request.status === 'Pending' ? 'bg-yellow-500' :
                                    request.status === 'Approved' ? 'bg-green-500' :
                                    'bg-red-500'
                                  }>
                                    {request.status}
                                  </Badge>
                                </div>
                                <p className="font-medium mb-1">{request.reason}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()} ({request.days} days)
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Applied on {new Date(request.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Leave History</CardTitle>
                    <CardDescription>Your past leave records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Applied Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-gray-500">Loading...</TableCell>
                            </TableRow>
                          ) : leaveRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-gray-500">No leave history</TableCell>
                            </TableRow>
                          ) : (
                            leaveRequests.map((request) => (
                              <TableRow key={request._id}>
                                <TableCell>
                                  <Badge variant={request.leaveType === 'paid' ? 'default' : 'outline'}>
                                    {request.leaveType?.charAt(0).toUpperCase() + request.leaveType?.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{request.days}</TableCell>
                                <TableCell>
                                  <Badge className={
                                    request.status === 'Approved' ? 'bg-green-500' :
                                    request.status === 'Pending' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }>
                                    {request.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="pending">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                    <CardDescription>Leave requests awaiting your approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading...</TableCell>
                            </TableRow>
                          ) : leaveRequests.filter(req => req.status === 'Pending').length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-gray-500">No pending requests</TableCell>
                            </TableRow>
                          ) : (
                            leaveRequests
                              .filter(req => req.status === 'Pending')
                              .map((request) => (
                                <TableRow key={request._id}>
                                  <TableCell className="font-medium">{request.employeeId?.name || 'Unknown'}</TableCell>
                                  <TableCell>
                                    <Badge>{request.leaveType?.charAt(0).toUpperCase() + request.leaveType?.slice(1)}</Badge>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>{request.days}</TableCell>
                                  <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="ghost" onClick={() => handleViewDetails(request)}>
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" onClick={() => handleApprove(request._id)}>
                                        Approve
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => handleReject(request._id)}>
                                        Reject
                                      </Button>
                                    </div>
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
              <TabsContent value="approved">
                <Card>
                  <CardHeader>
                    <CardTitle>Approved Leaves</CardTitle>
                    <CardDescription>All approved leave requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading...</TableCell>
                            </TableRow>
                          ) : leaveRequests.filter(req => req.status === 'Approved').length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-gray-500">No approved requests</TableCell>
                            </TableRow>
                          ) : (
                            leaveRequests
                              .filter(req => req.status === 'Approved')
                              .map((request) => (
                                <TableRow key={request._id}>
                                  <TableCell className="font-medium">{request.employeeId?.name || 'Unknown'}</TableCell>
                                  <TableCell>
                                    <Badge>{request.leaveType?.charAt(0).toUpperCase() + request.leaveType?.slice(1)}</Badge>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>{request.days}</TableCell>
                                  <TableCell>
                                    <Badge className="bg-green-500">Approved</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button size="sm" variant="ghost" onClick={() => handleViewDetails(request)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
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
              <TabsContent value="rejected">
                <Card>
                  <CardHeader>
                    <CardTitle>Rejected Leaves</CardTitle>
                    <CardDescription>All rejected leave requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      No rejected leave requests
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Leave Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>Complete information about this leave request</DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee Name</p>
                  <p className="font-medium">{selectedLeave.employeeId?.name || selectedLeave.userId?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium">{selectedLeave.employeeId?.employeeId || selectedLeave.userId?.employeeId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">{selectedLeave.employeeId?.department || selectedLeave.userId?.department || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-sm">{selectedLeave.employeeId?.email || selectedLeave.userId?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Leave Type</p>
                  <Badge variant={selectedLeave.leaveType === 'paid' ? 'default' : selectedLeave.leaveType === 'sick' ? 'secondary' : 'outline'}>
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
                  <p className="font-medium">{new Date(selectedLeave.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Reason for Leave</p>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm">{selectedLeave.reason}</p>
                </div>
              </div>
              {!isEmployee && selectedLeave.status === 'Pending' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleReject(selectedLeave._id);
                      setDetailsDialogOpen(false);
                    }}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => {
                      handleApprove(selectedLeave._id);
                      setDetailsDialogOpen(false);
                    }}
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
