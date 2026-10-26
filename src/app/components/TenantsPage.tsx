import { useState, useEffect } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ArrowLeft, Mail, Plus, DollarSign, Home, UserX, Users, ArrowRight, AlertCircle, Settings } from "lucide-react";
import { Apartment } from "./ApartmentCard";
import { AddTenantDialog } from "./AddTenantDialog";

interface TenantsPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  apartment?: Apartment;
  onBack: () => void;
  tenants: Tenant[];
  setTenants: (tenants: Tenant[] | ((prev: Tenant[]) => Tenant[])) => void | Promise<void>;
  vacantUnits: string[];
  setVacantUnits: (units: string[]) => void;
  onNavigateToSubPage: (view: any) => void;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  rentAmount: number;
  paymentStatus: "paid" | "unpaid" | "partial";
  avatar: string;
  joiningDate: string;
  paymentDeadline?: string;
  status: "active" | "left" | "vacant";
  idNumber: string;
  birthDate: string;
  numberOfRooms?: number;
  waterUnits?: number;
  leftReason?: string;
  leftDate?: string;
  hasAccount?: boolean;
  username?: string;
  password?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  unit: string;
  amount: number;
  date: string;
  method: "bank_transfer" | "cash" | "check" | "online";
  status: "claimed" | "unclaimed" | "pending";
  transactionId?: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: "tenant" | "payment" | "apartment" | "system";
  targetId: string;
  targetName: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

const initialTenants: Tenant[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    unit: "Unit 4B",
    rentAmount: 2500,
    paymentStatus: "paid",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMG1hbnxlbnwxfHx8fDE3NjAzOTg2NTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    joiningDate: "2023-01-01",
    paymentDeadline: "2024-11-05",
    status: "active",
    idNumber: "0712345678",
    birthDate: "1990-05-15",
    numberOfRooms: 2,
    waterUnits: 45,
  },
  {
    id: "2",
    name: "Mary Jane",
    email: "mary@example.com",
    phone: "+1 (555) 234-5678",
    unit: "Unit 3C",
    rentAmount: 2200,
    paymentStatus: "paid",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFufGVufDF8fHx8MTc2MDM5ODYzOXww&ixlib=rb-4.1.0&q=80&w=1080",
    joiningDate: "2023-03-01",
    paymentDeadline: "2024-11-01",
    status: "active",
    idNumber: "0823456789",
    birthDate: "1988-09-22",
    numberOfRooms: 1,
    waterUnits: 32,
  },
  {
    id: "3",
    name: "Robert Smith",
    email: "robert@example.com",
    phone: "+1 (555) 345-6789",
    unit: "Unit 2A",
    rentAmount: 2800,
    paymentStatus: "unpaid",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MDM5ODY2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    joiningDate: "2023-02-01",
    paymentDeadline: "2024-10-25",
    status: "active",
    idNumber: "0734567890",
    birthDate: "1985-03-10",
    numberOfRooms: 3,
    waterUnits: 58,
  },
  {
    id: "4",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 456-7890",
    unit: "Unit 5D",
    rentAmount: 2300,
    paymentStatus: "paid",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHdvbWFufGVufDF8fHx8MTc2MDM5ODYzOXww&ixlib=rb-4.1.0&q=80&w=1080",
    joiningDate: "2023-06-01",
    status: "left",
    idNumber: "0845678901",
    birthDate: "1992-11-30",
    numberOfRooms: 2,
    waterUnits: 0,
    leftReason: "Relocated to another city for work",
    leftDate: "2023-12-01",
  },
];

const initialVacantUnits = ["Unit 1A", "Unit 6E", "Unit 7F"];

export function TenantsPage({ 
  onLogout, 
  onNavigate, 
  apartment, 
  onBack,
  tenants,
  setTenants,
  vacantUnits,
  setVacantUnits,
  onNavigateToSubPage 
}: TenantsPageProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Initialize data on first load
  useEffect(() => {
    if (tenants.length === 0) {
      setTenants(initialTenants);
    }
    if (vacantUnits.length === 0) {
      setVacantUnits(initialVacantUnits);
    }
  }, []);

  const activeTenants = tenants.filter((t) => t.status === "active");
  const unpaidTenants = tenants.filter((t) => t.paymentStatus === "unpaid" && t.status === "active");
  const paidTenants = tenants.filter((t) => t.paymentStatus === "paid" && t.status === "active");
  const leftTenants = tenants.filter((t) => t.status === "left");

  const totalPaid = paidTenants.reduce((sum, tenant) => sum + tenant.rentAmount, 0);

  const handleAddTenant = (tenantData: Omit<Tenant, "id">) => {
    const newTenant: Tenant = {
      id: Date.now().toString(),
      ...tenantData,
    };
    setTenants([...tenants, newTenant]);
  };

  const handleEmailAll = () => {
    const emails = activeTenants.map((t) => t.email).join(", ");
    console.log("Email all tenants:", emails);
    alert(`Would send email to: ${emails}`);
  };

  // Check if apartment has units configured
  const hasUnitsConfigured = apartment?.hasUnitsConfigured !== false;

  return (
    <div className="size-full flex flex-col bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="tenants" />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* No Apartment Selected Warning */}
          {!apartment && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="max-w-2xl w-full">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Home className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="mb-2">No Apartment Selected</h2>
                    <p className="text-neutral-600 mb-6">
                      Please select an apartment from the Houses page to view and manage tenants.
                    </p>
                    <Button
                      onClick={() => onNavigate("houses")}
                      className="bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                      <Home className="size-4" />
                      Go to Houses Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content - Only show when apartment is selected */}
          {apartment && (
            <>
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={onBack}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="size-4" />
              Back to Houses
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1>Tenants for {apartment.name}</h1>
                <p className="text-neutral-600 mt-1">
                  Manage tenants and track payments
                </p>
              </div>
              {hasUnitsConfigured && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => onNavigateToSubPage("tenantsByApartment")}
                    className="gap-2"
                  >
                    <Users className="size-4" />
                    View by Property
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleEmailAll}
                    className="gap-2"
                  >
                    <Mail className="size-4" />
                    Email All Tenants
                  </Button>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    <Plus className="size-5" />
                    Add Tenant
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Units Not Configured Warning */}
          {!hasUnitsConfigured && (
            <Alert className="mb-8 border-amber-300 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900">Units Not Configured</AlertTitle>
              <AlertDescription className="text-amber-800">
                <p className="mb-4">
                  This apartment doesn't have any units configured yet. You need to set up units before you can add tenants or manage payments.
                </p>
                <Button
                  onClick={() => onNavigateToSubPage("units")}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Units Now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {hasUnitsConfigured && (
            <>

          {/* Statistics Cards - Clickable */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => onNavigateToSubPage("activeTenants")}
              className="text-left transition-transform hover:scale-105"
            >
              <Card className="cursor-pointer hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground mb-1">Active Tenants</p>
                      <p className="text-blue-600">{activeTenants.length}</p>
                    </div>
                    <Users className="size-8 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-blue-600">
                    <span className="text-sm">View All</span>
                    <ArrowRight className="size-4" />
                  </div>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => onNavigateToSubPage("vacantUnits")}
              className="text-left transition-transform hover:scale-105"
            >
              <Card className="cursor-pointer hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground mb-1">Vacant Units</p>
                      <p className="text-orange-600">{vacantUnits.length}</p>
                    </div>
                    <Home className="size-8 text-orange-600" />
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-orange-600">
                    <span className="text-sm">View All</span>
                    <ArrowRight className="size-4" />
                  </div>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => onNavigateToSubPage("failedToPay")}
              className="text-left transition-transform hover:scale-105"
            >
              <Card className="cursor-pointer hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground mb-1">Unpaid Rent</p>
                      <p className="text-red-600">{unpaidTenants.length}</p>
                    </div>
                    <UserX className="size-8 text-red-600" />
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-red-600">
                    <span className="text-sm">View All</span>
                    <ArrowRight className="size-4" />
                  </div>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => onNavigateToSubPage("tenantsLeft")}
              className="text-left transition-transform hover:scale-105"
            >
              <Card className="cursor-pointer hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground mb-1">Tenants Left</p>
                      <p className="text-neutral-600">{leftTenants.length}</p>
                    </div>
                    <UserX className="size-8 text-neutral-600" />
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-neutral-600">
                    <span className="text-sm">View All</span>
                    <ArrowRight className="size-4" />
                  </div>
                </CardContent>
              </Card>
            </button>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <button
                  onClick={() => onNavigateToSubPage("units")}
                  className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Home className="size-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p>Units Management</p>
                      <p className="text-muted-foreground">Manage properties, rent, and charges</p>
                    </div>
                  </div>
                  <ArrowRight className="size-5 text-blue-600" />
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <button
                  onClick={() => onNavigateToSubPage("activityLog")}
                  className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="size-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p>Activity Log</p>
                      <p className="text-muted-foreground">View all system activities and changes</p>
                    </div>
                  </div>
                  <ArrowRight className="size-5 text-purple-600" />
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Total Paid Card - Clickable */}
          <button
            onClick={() => onNavigateToSubPage("paymentHistory")}
            className="w-full text-left transition-transform hover:scale-105 mb-8"
          >
            <Card className="cursor-pointer hover:shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Total Amount Paid This Month</p>
                    <p className="text-green-600">${totalPaid.toLocaleString()}</p>
                  </div>
                  <DollarSign className="size-10 text-green-600" />
                </div>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <span className="text-sm">View Payment History</span>
                  <ArrowRight className="size-4" />
                </div>
              </CardContent>
            </Card>
          </button>

          {/* Quick Overview */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="mb-4">Quick Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span>Total Units</span>
                <span>{activeTenants.length + vacantUnits.length}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span>Occupancy Rate</span>
                <span>
                  {((activeTenants.length / (activeTenants.length + vacantUnits.length)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <span>Payment Collection Rate</span>
                <span>
                  {((paidTenants.length / activeTenants.length) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          </>
          )}
          </>
          )}
        </div>
      </div>

      {/* Add Tenant Dialog */}
      {hasUnitsConfigured && apartment && (
        <AddTenantDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={handleAddTenant}
        />
      )}
    </div>
  );
}