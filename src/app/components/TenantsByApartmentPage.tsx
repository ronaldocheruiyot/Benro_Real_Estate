import { useState } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Search, Users, UserPlus, Key, Mail, Home, MapPin } from "lucide-react";
import { Apartment } from "./ApartmentCard";
import { Tenant } from "./TenantsPage";
import { CreateTenantAccountDialog } from "./CreateTenantAccountDialog";
import { TenantDetailDialog } from "./TenantDetailDialog";
import { Payment, ActivityLog } from "./TenantsPage";

interface TenantsByApartmentPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  onBack: () => void;
  apartments: Apartment[];
  tenants: Tenant[];
  setTenants: (tenants: Tenant[] | ((prev: Tenant[]) => Tenant[])) => void | Promise<void>;
  payments: Payment[];
  setPayments: (payments: Payment[] | ((prev: Payment[]) => Payment[])) => void | Promise<void>;
  activityLogs: ActivityLog[];
  setActivityLogs: (logs: ActivityLog[]) => void;
  currentUser: { id: string; name: string; email: string };
}

export interface TenantAccount {
  tenantId: string;
  email: string;
  password: string;
  status: "active" | "pending" | "suspended";
  createdDate: string;
  lastLogin?: string;
  hasChangedPassword: boolean;
}

export function TenantsByApartmentPage({
  onLogout,
  onNavigate,
  onBack,
  apartments,
  tenants,
  setTenants,
  payments,
  setPayments,
  activityLogs,
  setActivityLogs,
  currentUser,
}: TenantsByApartmentPageProps) {
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>(apartments[0]?.id || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [createAccountDialogOpen, setCreateAccountDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [viewTenantDialogOpen, setViewTenantDialogOpen] = useState(false);
  const [tenantAccounts, setTenantAccounts] = useState<TenantAccount[]>([]);

  // Filter tenants by apartment
  const getFilteredTenants = () => {
    let filtered = tenants.filter(t => t.status === "active");
    
    // Filter by apartment if not "all"
    if (selectedApartmentId !== "all") {
      // In a real app, you'd have apartment-to-tenant mapping
      // For now, we'll use a simple approach
      filtered = filtered.filter(t => t.id); // Placeholder - you'd add apartmentId to Tenant
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((tenant) =>
        tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.idNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTenants = getFilteredTenants();

  const handleCreateAccount = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    // Generate a random password
    const password = generatePassword();
    
    const newAccount: TenantAccount = {
      tenantId,
      email: tenant.email,
      password,
      status: "pending",
      createdDate: new Date().toISOString(),
      hasChangedPassword: false,
    };

    setTenantAccounts([...tenantAccounts, newAccount]);

    // Log activity
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action: "Created Tenant Account",
      targetType: "tenant",
      targetId: tenantId,
      targetName: tenant.name,
      details: `Created login account for ${tenant.name}. Password sent to ${tenant.email}`,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs([...activityLogs, newLog]);

    setCreateAccountDialogOpen(false);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const getTenantAccount = (tenantId: string) => {
    return tenantAccounts.find(acc => acc.tenantId === tenantId);
  };

  const selectedApartment = apartments.find(a => a.id === selectedApartmentId);
  const apartmentName = selectedApartmentId === "all" ? "All Properties" : selectedApartment?.name || "";

  const tenantsWithAccounts = filteredTenants.filter(t => getTenantAccount(t.id));
  const tenantsWithoutAccounts = filteredTenants.filter(t => !getTenantAccount(t.id));

  return (
    <>
      <Navigation onLogout={onLogout} onNavigate={onNavigate} />
      
      <div className="p-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tenants
            </Button>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1>Tenants by Property</h1>
                <p className="text-neutral-600 mt-1">
                  View and manage tenant accounts for each property
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Property Selector */}
                <div className="space-y-2">
                  <label className="text-sm text-neutral-700 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Select Property
                  </label>
                  <Select value={selectedApartmentId} onValueChange={setSelectedApartmentId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {apartments.map((apt) => (
                        <SelectItem key={apt.id} value={apt.id}>
                          {apt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm text-neutral-700 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search Tenants
                  </label>
                  <Input
                    placeholder="Search by name, email, unit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-brand-cyan mx-auto mb-2" />
                  <p className="text-2xl text-neutral-900">{filteredTenants.length}</p>
                  <p className="text-sm text-neutral-600">Total Tenants</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Key className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl text-neutral-900">{tenantsWithAccounts.length}</p>
                  <p className="text-sm text-neutral-600">With Accounts</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <UserPlus className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl text-neutral-900">{tenantsWithoutAccounts.length}</p>
                  <p className="text-sm text-neutral-600">Without Accounts</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl text-neutral-900">
                    {selectedApartmentId === "all" ? apartments.length : 1}
                  </p>
                  <p className="text-sm text-neutral-600">Properties</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Selection Info */}
          {selectedApartmentId !== "all" && selectedApartment && (
            <Card className="mb-6 bg-brand-cyan-soft border-brand-cyan/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Home className="h-5 w-5 text-brand-cyan mt-1" />
                  <div className="flex-1">
                    <h3 className="text-brand-navy">{selectedApartment.name}</h3>
                    <p className="text-sm text-brand-navy mt-1">{selectedApartment.description}</p>
                    <p className="text-sm text-brand-cyan mt-2">
                      {filteredTenants.length} active tenant{filteredTenants.length !== 1 ? 's' : ''} in this property
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tenants List */}
          {filteredTenants.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-neutral-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
                <p>No active tenants found for the selected property</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTenants.map((tenant) => {
                const account = getTenantAccount(tenant.id);
                const hasAccount = !!account;

                return (
                  <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={tenant.avatar} alt={tenant.name} />
                          <AvatarFallback>
                            {tenant.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>

                        {/* Tenant Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-neutral-900 mb-1">{tenant.name}</h3>
                              <div className="flex flex-wrap gap-3 text-sm text-neutral-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <Home className="h-4 w-4" />
                                  {tenant.unit}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {tenant.email}
                                </span>
                              </div>
                              
                              {/* Account Status */}
                              <div className="flex items-center gap-2">
                                {hasAccount ? (
                                  <>
                                    <Badge className="bg-green-100 text-green-700">
                                      <Key className="h-3 w-3 mr-1" />
                                      Has Account
                                    </Badge>
                                    <Badge variant="outline">
                                      {account.status === "active" ? "Active" : 
                                       account.status === "pending" ? "Pending Setup" : "Suspended"}
                                    </Badge>
                                    {!account.hasChangedPassword && (
                                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                                        Password Not Changed
                                      </Badge>
                                    )}
                                    {account.lastLogin && (
                                      <span className="text-xs text-neutral-500">
                                        Last login: {new Date(account.lastLogin).toLocaleDateString()}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <Badge variant="outline" className="text-neutral-600">
                                    No Account
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTenant(tenant);
                                  setViewTenantDialogOpen(true);
                                }}
                              >
                                View Details
                              </Button>
                              
                              {!hasAccount && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTenant(tenant);
                                    setCreateAccountDialogOpen(true);
                                  }}
                                >
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Create Account
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {selectedTenant && (
        <>
          <CreateTenantAccountDialog
            open={createAccountDialogOpen}
            onOpenChange={setCreateAccountDialogOpen}
            tenant={selectedTenant}
            onUpdateTenant={handleCreateAccount}
          />

          <TenantDetailDialog
            open={viewTenantDialogOpen}
            onOpenChange={setViewTenantDialogOpen}
            tenant={selectedTenant}
            payments={payments.filter(p => p.tenantId === selectedTenant.id)}
            onUpdateTenant={(updatedTenant) => {
              const updatedTenants = tenants.map(t => 
                t.id === updatedTenant.id ? updatedTenant : t
              );
              setTenants(updatedTenants);
              setSelectedTenant(updatedTenant);
            }}
          />
        </>
      )}
    </>
  );
}
