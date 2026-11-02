import { useState } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ArrowLeft, Search, Mail, Calendar, UserMinus, FileText } from "lucide-react";
import { Apartment } from "./ApartmentCard";
import { Tenant, Payment, ActivityLog } from "./TenantsPage";
import { TenantDetailDialog } from "./TenantDetailDialog";
import { SetDeadlineDialog } from "./SetDeadlineDialog";
import { MarkAsLeftDialog } from "./MarkAsLeftDialog";
import { CashBillingDialog } from "./CashBillingDialog";
import { TenantInvoiceDialog } from "./TenantInvoiceDialog";
import { Unit } from "./UnitsPage";

interface ActiveTenantsPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  apartment: Apartment;
  onBack: () => void;
  tenants: Tenant[];
  setTenants: (tenants: Tenant[] | ((prev: Tenant[]) => Tenant[])) => void | Promise<void>;
  payments: Payment[];
  setPayments: (payments: Payment[] | ((prev: Payment[]) => Payment[])) => void | Promise<void>;
  activityLogs: ActivityLog[];
  setActivityLogs: (logs: ActivityLog[]) => void;
  currentUser: { id: string; name: string; email: string };
  units?: Unit[];
}

export function ActiveTenantsPage({ 
  onLogout, 
  onNavigate, 
  apartment, 
  onBack,
  tenants,
  setTenants,
  payments,
  setPayments,
  activityLogs,
  setActivityLogs,
  currentUser,
  units = [],
}: ActiveTenantsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [deadlineTenant, setDeadlineTenant] = useState<Tenant | null>(null);
  const [markAsLeftTenant, setMarkAsLeftTenant] = useState<Tenant | null>(null);
  const [cashBillingTenant, setCashBillingTenant] = useState<Tenant | null>(null);
  const [invoiceTenant, setInvoiceTenant] = useState<Tenant | null>(null);

  const getUnitForTenant = (tenant: Tenant) =>
    units.find((u) => u.tenantId === tenant.id) ||
    units.find(
      (u) => u.unitNumber.toLowerCase() === String(tenant.unit || "").toLowerCase()
    ) ||
    null;

  const activeTenants = tenants.filter((t) => t.status === "active");
  
  const filteredTenants = activeTenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.idNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSetDeadline = (tenantId: string, deadline: string) => {
    setTenants(tenants.map(t => 
      t.id === tenantId ? { ...t, paymentDeadline: deadline } : t
    ));

    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      const newLog: ActivityLog = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        action: "Updated Payment Deadline",
        targetType: "tenant",
        targetId: tenantId,
        targetName: tenant.name,
        details: `Set payment deadline to ${new Date(deadline).toLocaleDateString()}`,
        timestamp: new Date().toISOString(),
      };
      setActivityLogs([...activityLogs, newLog]);
    }
  };

  const handleMarkAsLeft = (tenantId: string, reason: string) => {
    const leftDate = new Date().toISOString().split('T')[0];
    setTenants(tenants.map(t => 
      t.id === tenantId ? { ...t, status: "left" as const, leftReason: reason, leftDate } : t
    ));

    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      const newLog: ActivityLog = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        action: "Marked Tenant as Left",
        targetType: "tenant",
        targetId: tenantId,
        targetName: tenant.name,
        details: `Reason: ${reason}`,
        timestamp: new Date().toISOString(),
      };
      setActivityLogs([...activityLogs, newLog]);
    }
  };

  const handleAddCashPayment = (paymentData: Omit<Payment, "id">) => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      ...paymentData,
    };
    setPayments([newPayment, ...payments]);

    const newLog: ActivityLog = {
      id: (Date.now() + 1).toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action: "Added Cash Payment",
      targetType: "payment",
      targetId: newPayment.id,
      targetName: paymentData.tenantName,
      details: `Cash payment of $${paymentData.amount} recorded`,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs([...activityLogs, newLog]);
  };

  const handleEmailAll = () => {
    const emails = activeTenants.map((t) => t.email).join(", ");
    alert(`Would send email to: ${emails}`);
  };

  return (
    <div className="size-full flex flex-col bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={onBack}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="size-4" />
              Back to Tenants Overview
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1>Active Tenants - {apartment.name}</h1>
                <p className="text-neutral-600 mt-1">
                  {activeTenants.length} active tenants
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleEmailAll}
                className="gap-2"
              >
                <Mail className="size-4" />
                Email All Active Tenants
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 size-5" />
                <Input
                  placeholder="Search by name, email, unit, or ID number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tenants List */}
          <div className="space-y-3">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedTenant(tenant)}
                      className="flex items-center gap-4 flex-1 text-left"
                    >
                      <Avatar className="size-14">
                        <AvatarImage src={tenant.avatar} />
                        <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{tenant.name}</p>
                        <p className="text-muted-foreground truncate">{tenant.email}</p>
                        <p className="text-muted-foreground">ID: {tenant.idNumber}</p>
                      </div>
                    </button>
                    
                    <div className="text-right">
                      <p className="text-muted-foreground">{tenant.unit}</p>
                      <p>${tenant.rentAmount}/mo</p>
                      {(tenant.deposit || 0) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Deposit: ${tenant.deposit!.toLocaleString()}
                        </p>
                      )}
                      {(tenant.firstMonthPay || 0) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          1st month: ${tenant.firstMonthPay!.toLocaleString()}
                        </p>
                      )}
                      {tenant.paymentDeadline && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(tenant.paymentDeadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <Badge
                      variant={tenant.paymentStatus === "paid" ? "default" : "destructive"}
                      className={tenant.paymentStatus === "paid" ? "bg-green-600" : ""}
                    >
                      {tenant.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                    </Badge>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeadlineTenant(tenant)}
                        className="gap-2"
                      >
                        <Calendar className="size-4" />
                        Deadline
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInvoiceTenant(tenant)}
                        className="gap-2 text-brand-navy hover:text-brand-navy-deep"
                      >
                        <FileText className="size-4" />
                        Invoice
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCashBillingTenant(tenant)}
                        className="gap-2 text-green-600 hover:text-green-700"
                      >
                        Cash Bill
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMarkAsLeftTenant(tenant)}
                        className="gap-2 text-red-600 hover:text-red-700"
                      >
                        <UserMinus className="size-4" />
                        Mark Left
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTenants.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No active tenants found
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Tenant Detail Dialog */}
      {selectedTenant && (
        <TenantDetailDialog
          tenant={selectedTenant}
          open={!!selectedTenant}
          onOpenChange={(open) => !open && setSelectedTenant(null)}
          payments={payments}
          onUpdateTenant={(updatedTenant) => {
            const updatedTenants = tenants.map(t => 
              t.id === updatedTenant.id ? updatedTenant : t
            );
            setTenants(updatedTenants);
            setSelectedTenant(updatedTenant);
          }}
        />
      )}

      {/* Set Deadline Dialog */}
      {deadlineTenant && (
        <SetDeadlineDialog
          tenant={deadlineTenant}
          open={!!deadlineTenant}
          onOpenChange={(open) => !open && setDeadlineTenant(null)}
          onSetDeadline={handleSetDeadline}
        />
      )}

      {/* Mark as Left Dialog */}
      {markAsLeftTenant && (
        <MarkAsLeftDialog
          tenant={markAsLeftTenant}
          open={!!markAsLeftTenant}
          onOpenChange={(open) => !open && setMarkAsLeftTenant(null)}
          onMarkAsLeft={handleMarkAsLeft}
        />
      )}

      {/* Cash Billing Dialog */}
      {cashBillingTenant && (
        <CashBillingDialog
          tenant={cashBillingTenant}
          open={!!cashBillingTenant}
          onOpenChange={(open) => !open && setCashBillingTenant(null)}
          onAddPayment={handleAddCashPayment}
        />
      )}

      {/* Per-tenant invoice preview + charges */}
      {invoiceTenant && (
        <TenantInvoiceDialog
          tenant={invoiceTenant}
          unit={getUnitForTenant(invoiceTenant)}
          open={!!invoiceTenant}
          onOpenChange={(open) => !open && setInvoiceTenant(null)}
        />
      )}
    </div>
  );
}