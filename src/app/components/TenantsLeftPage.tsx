import { useState } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ArrowLeft, Search, UserPlus } from "lucide-react";
import { Apartment } from "./ApartmentCard";
import { Tenant } from "./TenantsPage";
import { TenantDetailDialog } from "./TenantDetailDialog";

interface TenantsLeftPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  apartment: Apartment;
  onBack: () => void;
  tenants: Tenant[];
  setTenants: (tenants: Tenant[] | ((prev: Tenant[]) => Tenant[])) => void | Promise<void>;
}

export function TenantsLeftPage({ 
  onLogout, 
  onNavigate, 
  apartment, 
  onBack,
  tenants,
  setTenants
}: TenantsLeftPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const leftTenants = tenants.filter((t) => t.status === "left");
  
  const filteredTenants = leftTenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReturnTenant = (tenantId: string) => {
    if (confirm("Mark this tenant as returned and active?")) {
      setTenants(tenants.map(t => 
        t.id === tenantId ? { ...t, status: "active" as const, paymentStatus: "unpaid" as const } : t
      ));
    }
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
            <div>
              <h1>Tenants Who Left - {apartment.name}</h1>
              <p className="text-neutral-600 mt-1">
                {leftTenants.length} former tenants
              </p>
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
              <Card key={tenant.id} className="border-neutral-300 bg-neutral-50 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedTenant(tenant)}
                      className="flex items-center gap-4 flex-1 text-left"
                    >
                      <Avatar className="size-14 opacity-70">
                        <AvatarImage src={tenant.avatar} />
                        <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-neutral-700">{tenant.name}</p>
                        <p className="text-muted-foreground truncate">{tenant.email}</p>
                        <p className="text-muted-foreground">{tenant.phone}</p>
                      </div>
                    </button>
                    
                    <div className="text-right">
                      <p className="text-muted-foreground">{tenant.unit}</p>
                      <p className="text-muted-foreground">Was: ${tenant.rentAmount}/mo</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Left: {new Date(tenant.leaseEnd).toLocaleDateString()}
                      </p>
                    </div>

                    <Badge variant="outline" className="bg-neutral-200">
                      Left
                    </Badge>

                    <Button
                      size="sm"
                      onClick={() => handleReturnTenant(tenant.id)}
                      className="gap-2 bg-brand-navy text-white hover:bg-brand-navy-deep"
                    >
                      <UserPlus className="size-4" />
                      Return Tenant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTenants.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {leftTenants.length === 0 
                    ? "No tenants have left" 
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
    </div>
  );
}
