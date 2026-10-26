import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Mail, Phone, Home, Calendar, DollarSign, CreditCard, User, Printer, UserPlus, Key } from "lucide-react";
import { Tenant, Payment } from "./TenantsPage";
import { useState } from "react";
import { CreateTenantAccountDialog } from "./CreateTenantAccountDialog";

interface TenantDetailDialogProps {
  tenant: Tenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payments?: Payment[];
  onUpdateTenant?: (updatedTenant: Tenant) => void;
}

export function TenantDetailDialog({ tenant, open, onOpenChange, payments = [], onUpdateTenant }: TenantDetailDialogProps) {
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);

  const handleEmail = () => {
    console.log("Email tenant:", tenant.email);
    alert(`Would send email to: ${tenant.email}`);
  };

  const handleCall = () => {
    console.log("Call tenant:", tenant.phone);
    alert(`Would call: ${tenant.phone}`);
  };

  // Calculate age from birth date
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Get tenant's payment history
  const tenantPayments = payments.filter(p => p.tenantId === tenant.id);
  const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0);

  const handlePrintPaymentHistory = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment History - ${tenant.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f3f3f5; }
            .header { margin-bottom: 30px; }
            .total { font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payment History</h1>
            <p><strong>Tenant:</strong> ${tenant.name}</p>
            <p><strong>Unit:</strong> ${tenant.unit}</p>
            <p><strong>ID Number:</strong> ${tenant.idNumber}</p>
            <p><strong>Print Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Transaction ID</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${tenantPayments.map(p => `
                <tr>
                  <td>${new Date(p.date).toLocaleDateString()}</td>
                  <td>$${p.amount.toLocaleString()}</td>
                  <td>${p.method.replace('_', ' ').toUpperCase()}</td>
                  <td>${p.status.toUpperCase()}</td>
                  <td>${p.transactionId || 'N/A'}</td>
                  <td>${p.notes || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p class="total">Total Paid: $${totalPaid.toLocaleString()}</p>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tenant Profile</DialogTitle>
          <DialogDescription>
            Complete information and payment history for {tenant.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Details</TabsTrigger>
            <TabsTrigger value="payments">Payment History ({tenantPayments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <Avatar className="size-20">
                <AvatarImage src={tenant.avatar} />
                <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3>{tenant.name}</h3>
                <p className="text-muted-foreground">{tenant.unit}</p>
              </div>
              <Badge
                variant={tenant.paymentStatus === "paid" ? "default" : "destructive"}
                className={tenant.paymentStatus === "paid" ? "bg-green-600" : ""}
              >
                {tenant.paymentStatus === "paid" ? "Paid" : "Unpaid"}
              </Badge>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-4">
              <h4>Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="size-5 text-blue-600" />
                  <div>
                    <p className="text-muted-foreground">ID Number</p>
                    <p>{tenant.idNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-blue-600" />
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p>{new Date(tenant.birthDate).toLocaleDateString()} (Age: {calculateAge(tenant.birthDate)})</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-blue-600" />
                  <div>
                    <p className="text-muted-foreground">Joining Date</p>
                    <p>{new Date(tenant.joiningDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h4>Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-blue-600" />
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p>{tenant.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-blue-600" />
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p>{tenant.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Lease Information */}
            <div className="space-y-4">
              <h4>Lease Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Home className="size-5 text-blue-600" />
                  <div>
                    <p className="text-muted-foreground">Unit</p>
                    <p>{tenant.unit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="size-5 text-blue-600" />
                  <div>
                    <p className="text-muted-foreground">Number of Rooms</p>
                    <p>{tenant.numberOfRooms || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="size-5 text-blue-600" />
                  <div>
                    <p className="text-muted-foreground">Monthly Rent</p>
                    <p>${tenant.rentAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="size-5 text-blue-600" />
                  <div>
                    <p className="text-muted-foreground">Water Units</p>
                    <p>{tenant.waterUnits || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-blue-600" />
                  <div>
                    <p className="text-muted-foreground">Lease Start</p>
                    <p>{new Date(tenant.leaseStart).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-blue-600" />
                  <div>
                    <p className="text-muted-foreground">Lease End</p>
                    <p>{new Date(tenant.leaseEnd).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Account Status */}
            <div className="space-y-4">
              <h4>Account Status</h4>
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                {tenant.hasAccount ? (
                  <>
                    <Key className="size-5 text-green-600" />
                    <div className="flex-1">
                      <p>Login Account Active</p>
                      <p className="text-muted-foreground">Username: {tenant.username}</p>
                    </div>
                    <Badge className="bg-green-600">Active</Badge>
                  </>
                ) : (
                  <>
                    <Key className="size-5 text-neutral-400" />
                    <div className="flex-1">
                      <p>No Login Account</p>
                      <p className="text-muted-foreground">Create an account for tenant portal access</p>
                    </div>
                    <Badge variant="secondary">Inactive</Badge>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleEmail} className="flex-1 gap-2">
                <Mail className="size-4" />
                Send Email
              </Button>
              <Button onClick={handleCall} variant="outline" className="flex-1 gap-2">
                <Phone className="size-4" />
                Call Tenant
              </Button>
              <Button onClick={() => setIsCreateAccountOpen(true)} variant="outline" className="flex-1 gap-2">
                <UserPlus className="size-4" />
                Create Account
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4>Payment History</h4>
                <p className="text-muted-foreground">Total Paid: ${totalPaid.toLocaleString()}</p>
              </div>
              <Button onClick={handlePrintPaymentHistory} variant="outline" className="gap-2">
                <Printer className="size-4" />
                Print History
              </Button>
            </div>

            {tenantPayments.length > 0 ? (
              <div className="space-y-3">
                {tenantPayments.map((payment) => (
                  <div key={payment.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          payment.method === "cash" ? "bg-green-100" : "bg-blue-100"
                        }`}>
                          <CreditCard className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium">${payment.amount.toLocaleString()}</p>
                          <p className="text-muted-foreground capitalize">
                            {payment.method.replace("_", " ")}
                          </p>
                          {payment.notes && (
                            <p className="text-muted-foreground text-sm">{payment.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p>{new Date(payment.date).toLocaleDateString()}</p>
                        {payment.transactionId && (
                          <p className="text-xs text-muted-foreground">{payment.transactionId}</p>
                        )}
                        <Badge
                          variant={payment.status === "claimed" ? "default" : "secondary"}
                          className={payment.status === "claimed" ? "bg-green-600 mt-1" : "mt-1"}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No payment history available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
      <CreateTenantAccountDialog
        open={isCreateAccountOpen}
        onOpenChange={setIsCreateAccountOpen}
        tenant={tenant}
        onUpdateTenant={onUpdateTenant}
      />
    </Dialog>
  );
}