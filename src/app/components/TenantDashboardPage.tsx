import { useState } from "react";
import { Navigation } from "./Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { 
  Home, 
  DollarSign, 
  Wrench, 
  FileText,
  Calendar,
  Download,
  MessageSquare,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { UserRole } from "./UserManagementPage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface TenantDashboardPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser: UserRole;
}

export function TenantDashboardPage({ 
  onLogout, 
  onNavigate,
  currentUser 
}: TenantDashboardPageProps) {
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false);
  const [maintenanceDescription, setMaintenanceDescription] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");

  // Sample data (in a real app, this would come from backend)
  const leaseInfo = {
    unit: "Unit 101",
    property: "Sunset Apartments",
    startDate: "2025-01-01",
    endDate: "2026-01-01",
    monthlyRent: 2000,
    deposit: 4000,
    status: "active"
  };

  const paymentHistory = [
    { id: "1", date: "2026-01-01", amount: 2000, type: "Rent", status: "Paid", receipt: "#R-2026-001" },
    { id: "2", date: "2025-12-01", amount: 2000, type: "Rent", status: "Paid", receipt: "#R-2025-012" },
    { id: "3", date: "2025-11-01", amount: 2000, type: "Rent", status: "Paid", receipt: "#R-2025-011" },
  ];

  const maintenanceRequests = [
    { id: "1", date: "2026-01-25", issue: "Leaking faucet in bathroom", status: "In Progress" },
    { id: "2", date: "2026-01-15", issue: "Broken window lock", status: "Completed" },
  ];

  const accountBalance = {
    rent: 2000,
    water: 50,
    electricity: 80,
    total: 2130
  };

  const handleSubmitMaintenance = () => {
    if (!maintenanceDescription.trim()) {
      alert("Please describe the maintenance issue");
      return;
    }
    alert("Maintenance request submitted successfully!");
    setMaintenanceDescription("");
    setIsMaintenanceDialogOpen(false);
  };

  const handleSubmitComplaint = () => {
    if (!complaintDescription.trim()) {
      alert("Please describe your complaint");
      return;
    }
    alert("Complaint submitted successfully!");
    setComplaintDescription("");
    setIsComplaintDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="dashboard" currentUser={currentUser} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-neutral-900 mb-2">Welcome back, {currentUser.name}!</h1>
          <p className="text-neutral-600">
            Manage your lease, payments, and maintenance requests
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Current Balance</p>
                  <p className="text-neutral-900">${accountBalance.total}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Lease Status</p>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Maintenance</p>
                  <p className="text-neutral-900">{maintenanceRequests.length} Requests</p>
                </div>
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Next Payment</p>
                  <p className="text-neutral-900">Feb 1, 2026</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Lease Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Lease Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral-600">Property</span>
                <span className="font-medium">{leaseInfo.property}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral-600">Unit</span>
                <span className="font-medium">{leaseInfo.unit}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral-600">Lease Start</span>
                <span className="font-medium">{leaseInfo.startDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral-600">Lease End</span>
                <span className="font-medium">{leaseInfo.endDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral-600">Monthly Rent</span>
                <span className="font-medium">${leaseInfo.monthlyRent}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-neutral-600">Security Deposit</span>
                <span className="font-medium">${leaseInfo.deposit}</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral-600">Base Rent</span>
                <span className="font-medium">${accountBalance.rent}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral-600">Water</span>
                <span className="font-medium">${accountBalance.water}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-neutral-600">Electricity</span>
                <span className="font-medium">${accountBalance.electricity}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 mt-3">
                <span className="font-medium">Total Due</span>
                <span className="text-neutral-900">${accountBalance.total}</span>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Pay Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => setIsMaintenanceDialogOpen(true)}
                className="h-20 text-left justify-start bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
                variant="outline"
              >
                <Wrench className="h-6 w-6 mr-3" />
                <div>
                  <div className="font-medium">Submit Maintenance Request</div>
                  <div className="text-xs opacity-80">Report an issue in your unit</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => setIsComplaintDialogOpen(true)}
                className="h-20 text-left justify-start bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                variant="outline"
              >
                <MessageSquare className="h-6 w-6 mr-3" />
                <div>
                  <div className="font-medium">Submit Complaint</div>
                  <div className="text-xs opacity-80">File a formal complaint</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.type}</TableCell>
                      <TableCell>${payment.amount}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{payment.receipt}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
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

        {/* Maintenance Requests */}
        <Card>
          <CardHeader>
            <CardTitle>My Maintenance Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{request.issue}</p>
                      <p className="text-sm text-neutral-600 mt-1">Submitted: {request.date}</p>
                    </div>
                    <Badge 
                      className={
                        request.status === "Completed" 
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Request Dialog */}
      <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Maintenance Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Describe the issue</label>
              <Textarea
                value={maintenanceDescription}
                onChange={(e) => setMaintenanceDescription(e.target.value)}
                placeholder="Please describe the maintenance issue in detail..."
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsMaintenanceDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitMaintenance}>
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complaint Dialog */}
      <Dialog open={isComplaintDialogOpen} onOpenChange={setIsComplaintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Describe your complaint</label>
              <Textarea
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                placeholder="Please describe your complaint in detail..."
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsComplaintDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitComplaint}>
                Submit Complaint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
