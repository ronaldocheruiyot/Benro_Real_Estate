import { useState } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ArrowLeft, Search, Mail, Calendar, RotateCcw } from "lucide-react";
import { Apartment } from "./ApartmentCard";
import { Tenant } from "./TenantsPage";
import { TenantDetailDialog } from "./TenantDetailDialog";
import { SetDeadlineDialog } from "./SetDeadlineDialog";

interface FailedToPayPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  apartment: Apartment;
  onBack: () => void;
  tenants: Tenant[];
  setTenants: (tenants: Tenant[] | ((prev: Tenant[]) => Tenant[])) => void | Promise<void>;
}

export function FailedToPayPage({ 
  onLogout, 
  onNavigate, 
  apartment, 
  onBack,
  tenants,
  setTenants
}: FailedToPayPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [deadlineTenant, setDeadlineTenant] = useState<Tenant | null>(null);

  const unpaidTenants = tenants.filter((t) => t.paymentStatus === "unpaid" && t.status === "active");
  
  const filteredTenants = unpaidTenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSetDeadline = (tenantId: string, deadline: string) => {
    setTenants(tenants.map(t => 
      t.id === tenantId ? { ...t, paymentDeadline: deadline } : t
    ));
  };

  const handleMarkAsPaid = (tenantId: string) => {
    if (confirm("Mark this tenant as paid?")) {
      setTenants(tenants.map(t => 
        t.id === tenantId ? { ...t, paymentStatus: "paid" as const } : t
      ));
    }
  };

  const handleEmailAll = () => {
    const emails = unpaidTenants.map((t) => t.email).join(", ");
    alert(`Would send payment reminder to: ${emails}`);
  };

  const totalUnpaid = unpaidTenants.reduce((sum, tenant) => sum + tenant.rentAmount, 0);

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
                <h1>Failed to Pay - {apartment.name}</h1>
                <p className="text-neutral-600 mt-1">
                  {unpaidTenants.length} tenants with unpaid rent
                </p>
                <p className="text-red-600 mt-1">
                  Total Unpaid: ${totalUnpaid.toLocaleString()}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleEmailAll}
                className="gap-2"
              >
                <Mail className="size-4" />
                Send Reminder to All
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 size-5" />
                <Input
                  placeholder="Search by name, email, or unit..."
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
              <Card key={tenant.id} className="border-red-200 bg-red-50 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedTenant(tenant)}
                      className="flex items-center gap-4 flex-1 text-left"
                    >
                      <Avatar className="size-14 ring-2 ring-red-300">
                        <AvatarImage src={tenant.avatar} />
                        <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-red-900">{tenant.name}</p>
                        <p className="text-red-700 truncate">{tenant.email}</p>
                        <p className="text-red-700">{tenant.phone}</p>
                      </div>
                    </button>
                    
                    <div className="text-right">
                      <p className="text-red-700">{tenant.unit}</p>
                      <p className="text-red-900">${tenant.rentAmount}/mo</p>
                      {tenant.paymentDeadline && (
                        <p className="text-xs text-red-600 mt-1">
                          Due: {new Date(tenant.paymentDeadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <Badge variant="destructive">
                      Unpaid
                    </Badge>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeadlineTenant(tenant)}
                        className="gap-2"
                      >
                        <Calendar className="size-4" />
                        Extend Deadline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(tenant.id)}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <RotateCcw className="size-4" />
                        Mark Paid
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTenants.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {unpaidTenants.length === 0 
                    ? "Great! All tenants have paid their rent" 
                    : "No tenants found matching your search"}
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
    </div>
  );
}
