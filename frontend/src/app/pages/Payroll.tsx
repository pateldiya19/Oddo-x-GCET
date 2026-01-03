import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TopNavbar from '../components/TopNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ArrowLeft, Download, Wallet, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { getEmployees, updateEmployee } from '../services/api';
import { toast } from 'sonner';

export default function Payroll() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEmployee = user?.role === 'employee';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [editSalary, setEditSalary] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalPayroll: 0,
    employeesPaid: 0,
    pending: 0,
    avgSalary: 0
  });

  useEffect(() => {
    if (!isEmployee) {
      fetchPayrollData();
    }
  }, [isEmployee]);

  const fetchPayrollData = async () => {
    try {
      const response = await getEmployees({ limit: 100 });
      if (response.success) {
        const empData = response.data.employees || [];
        setEmployees(empData);
        
        // Calculate stats
        const total = empData.reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0);
        const paid = empData.filter((emp: any) => emp.status === 'active').length;
        const pending = empData.filter((emp: any) => emp.status !== 'active').length;
        const avg = empData.length > 0 ? total / empData.length : 0;
        
        setStats({
          totalPayroll: total,
          employeesPaid: paid,
          pending: pending,
          avgSalary: avg
        });
      }
    } catch (error) {
      console.error('Failed to fetch payroll data:', error);
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPayrollData();
    setRefreshing(false);
    toast.success('Payroll data refreshed');
  };

  const handleEditSalary = (employee: any) => {
    setSelectedEmployee(employee);
    setEditSalary((employee.salary || 0).toString());
    setEditDialogOpen(true);
  };

  const handleSaveSalary = async () => {
    if (!selectedEmployee) return;
    
    const salary = parseFloat(editSalary);
    if (isNaN(salary) || salary < 0) {
      toast.error('Please enter a valid salary amount');
      return;
    }

    setSaving(true);
    try {
      const response = await updateEmployee(selectedEmployee._id, { salary });
      if (response.success) {
        toast.success('Salary updated successfully');
        setEditDialogOpen(false);
        await fetchPayrollData();
      } else {
        toast.error(response.message || 'Failed to update salary');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update salary');
    } finally {
      setSaving(false);
    }
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
              <h1 className="text-2xl font-bold">Payroll Management</h1>
              <p className="text-gray-600 text-sm">
                {isEmployee ? 'View your salary information' : 'Manage employee payroll'}
              </p>
            </div>
          </div>
          {!isEmployee && (
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
          )}
        </div>

        {isEmployee ? (
          <>
            {/* Current Month Salary */}
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-green-100 mb-1">Current Month Salary</p>
                    <p className="text-4xl font-bold">₹80,000</p>
                    <p className="text-sm text-green-100 mt-2">December 2025 • Paid</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="secondary" size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Download Payslip
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Base Salary</p>
                      <p className="text-2xl font-bold">₹85,000</p>
                    </div>
                    <Wallet className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Allowances</p>
                      <p className="text-2xl font-bold text-green-600">+₹5,000</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Deductions</p>
                      <p className="text-2xl font-bold text-red-600">-₹10,000</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Salary Details</CardTitle>
                <CardDescription>Complete breakdown of your salary components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Basic Salary</span>
                    <span className="text-lg font-bold">₹70,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">HRA</span>
                    <span className="text-lg font-bold text-green-600">+₹10,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Transport Allowance</span>
                    <span className="text-lg font-bold text-green-600">+₹2,500</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Special Allowance</span>
                    <span className="text-lg font-bold text-green-600">+₹2,500</span>
                  </div>
                  <div className="border-t pt-3"></div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Provident Fund</span>
                    <span className="text-lg font-bold text-red-600">-₹5,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Professional Tax</span>
                    <span className="text-lg font-bold text-red-600">-₹2,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Income Tax</span>
                    <span className="text-lg font-bold text-red-600">-₹3,000</span>
                  </div>
                  <div className="border-t pt-3"></div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-lg font-bold">Net Salary</span>
                    <span className="text-2xl font-bold text-green-600">₹80,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payslip History */}
            <Card>
              <CardHeader>
                <CardTitle>Payslip History</CardTitle>
                <CardDescription>Your past salary records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Base Salary</TableHead>
                        <TableHead>Allowances</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPayrollData
                        .filter(record => record.employeeId === user?.employeeId)
                        .map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.month}</TableCell>
                            <TableCell>₹{record.baseSalary.toLocaleString()}</TableCell>
                            <TableCell className="text-green-600">
                              +₹{record.allowances.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-red-600">
                              -₹{record.deductions.toLocaleString()}
                            </TableCell>
                            <TableCell className="font-bold">
                              ₹{record.netSalary.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={record.status === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                                {record.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Admin View - Payroll Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Payroll</p>
                      <p className="text-2xl font-bold">₹{stats.totalPayroll.toLocaleString('en-IN')}</p>
                    </div>
                    <Wallet className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Employees Paid</p>
                    <p className="text-2xl font-bold text-green-600">{stats.employeesPaid}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Salary</p>
                    <p className="text-2xl font-bold">₹{Math.round(stats.avgSalary).toLocaleString('en-IN')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Employee Payroll List */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Employee Payroll</CardTitle>
                    <CardDescription>Manage employee salary information</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Filter</Button>
                    <Button size="sm">Process Payroll</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Base Salary</TableHead>
                        <TableHead>Allowances</TableHead>
                        <TableHead>Deductions</TableHead>
                        <TableHead>Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">Loading payroll data...</TableCell>
                        </TableRow>
                      ) : employees.length > 0 ? (
                        employees.map((employee) => {
                          const baseSalary = employee.salary || 0;
                          const allowances = Math.round(baseSalary * 0.15);
                          const deductions = Math.round(baseSalary * 0.12);
                          const netSalary = baseSalary + allowances - deductions;
                          
                          return (
                            <TableRow key={employee._id}>
                              <TableCell className="font-medium">{employee.name}</TableCell>
                              <TableCell>{employee.employeeId}</TableCell>
                              <TableCell>₹{baseSalary.toLocaleString('en-IN')}</TableCell>
                              <TableCell className="text-green-600">
                                +₹{allowances.toLocaleString('en-IN')}
                              </TableCell>
                              <TableCell className="text-red-600">
                                -₹{deductions.toLocaleString('en-IN')}
                              </TableCell>
                              <TableCell className="font-bold">
                                ₹{netSalary.toLocaleString('en-IN')}
                              </TableCell>
                              <TableCell>
                                <Badge className={employee.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
                                  {employee.status === 'active' ? 'Paid' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => handleEditSalary(employee)}>Edit</Button>
                                  <Button size="sm" variant="outline">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No payroll records found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Edit Salary Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee Salary</DialogTitle>
            <DialogDescription>
              Update the base salary for {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" value={selectedEmployee?.employeeId || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input id="employeeName" value={selectedEmployee?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Base Salary (₹)</Label>
              <Input 
                id="salary" 
                type="number" 
                placeholder="Enter salary amount"
                value={editSalary}
                onChange={(e) => setEditSalary(e.target.value)}
                min="0"
                step="1000"
              />
              <p className="text-sm text-gray-500">
                Current: ₹{(selectedEmployee?.salary || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Salary Breakdown</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Salary:</span>
                  <span className="font-medium">₹{parseFloat(editSalary || '0').toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Allowances (15%):</span>
                  <span>+₹{Math.round(parseFloat(editSalary || '0') * 0.15).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Deductions (12%):</span>
                  <span>-₹{Math.round(parseFloat(editSalary || '0') * 0.12).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1 mt-1">
                  <span>Net Salary:</span>
                  <span>₹{(parseFloat(editSalary || '0') + Math.round(parseFloat(editSalary || '0') * 0.15) - Math.round(parseFloat(editSalary || '0') * 0.12)).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveSalary} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
