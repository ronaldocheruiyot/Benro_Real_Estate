import { useState } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ArrowLeft, Search, Home, Plus, DollarSign, Edit, Users, Grid3x3, Info } from "lucide-react";
import { Apartment } from "./ApartmentCard";
import { Tenant } from "./TenantsPage";
import { AddEditUnitDialog } from "./AddEditUnitDialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { UnitsGuide } from "./UnitsGuide";

interface UnitsPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  apartment: Apartment;
  onBack: () => void;
  units: Unit[];
  setUnits: (units: Unit[] | ((prev: Unit[]) => Unit[])) => void | Promise<void>;
  tenants: Tenant[];
  currentUser?: any;
}

export interface UnitCharge {
  id: string;
  name: string;
  amount: number;
  isOptional: boolean;
  type: "fixed" | "variable";
}

export interface Unit {
  id: string;
  unitNumber: string;
  unitType: string;
  baseRent: number;
  charges: UnitCharge[];
  status: "occupied" | "vacant";
  tenantId?: string;
  floor?: number;
  squareFeet?: number;
}

export function UnitsPage({
  onLogout,
  onNavigate,
  apartment,
  onBack,
  units,
  setUnits,
  tenants,
  currentUser
}: UnitsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "occupied" | "vacant">("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  const getTenantForUnit = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit?.tenantId) return null;
    return tenants.find(t => t.id === unit.tenantId) || null;
  };

  const getTotalRent = (unit: Unit) => {
    const chargesTotal = unit.charges
      .filter(c => !c.isOptional)
      .reduce((sum, charge) => sum + charge.amount, 0);
    return unit.baseRent + chargesTotal;
  };

  const filteredUnits = units.filter((unit) => {
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || unit.status === filterStatus;
    const matchesType = filterType === "all" || unit.unitType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: units.length,
    occupied: units.filter(u => u.status === "occupied").length,
    vacant: units.filter(u => u.status === "vacant").length,
    totalRevenue: units
      .filter(u => u.status === "occupied")
      .reduce((sum, u) => sum + getTotalRent(u), 0)
  };

  const handleAddUnit = (unit: Omit<Unit, "id">) => {
    const newUnit: Unit = {
      ...unit,
      id: Date.now().toString()
    };
    setUnits([...units, newUnit]);
  };

  const handleEditUnit = (unit: Unit) => {
    setUnits(units.map(u => u.id === unit.id ? unit : u));
    setEditingUnit(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="units" currentUser={currentUser} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Houses
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-neutral-900 mb-2">{apartment.name} - Units Management</h1>
              <p className="text-neutral-600">Manage your property units, rent, and charges</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowGuide(!showGuide)}>
                <Info className="mr-2 h-4 w-4" />
                {showGuide ? "Hide" : "Show"} Guide
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Unit
              </Button>
            </div>
          </div>
        </div>

        {/* Guide */}
        {showGuide && <UnitsGuide />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Total Units</p>
                  <p className="text-neutral-900">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-brand-cyan-soft rounded-lg flex items-center justify-center">
                  <Home className="h-6 w-6 text-brand-cyan" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Occupied</p>
                  <p className="text-neutral-900">{stats.occupied}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Vacant</p>
                  <p className="text-neutral-900">{stats.vacant}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Home className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Monthly Revenue</p>
                  <p className="text-neutral-900">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search by unit number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="vacant">Vacant</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Unit Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="3-bedroom">3 Bedroom</SelectItem>
                  <SelectItem value="2-bedroom">2 Bedroom</SelectItem>
                  <SelectItem value="1-bedroom">1 Bedroom</SelectItem>
                  <SelectItem value="bedsitter">Bedsitter</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  {Array.from(
                    new Set(
                      units
                        .map((u) => u.unitType)
                        .filter(
                          (t) =>
                            ![
                              "3-bedroom",
                              "2-bedroom",
                              "1-bedroom",
                              "bedsitter",
                              "studio",
                            ].includes(t)
                        )
                    )
                  ).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/-/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => {
            const tenant = getTenantForUnit(unit.id);
            const totalRent = getTotalRent(unit);
            
            return (
              <Card key={unit.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-neutral-900">{unit.unitNumber}</CardTitle>
                      <p className="text-neutral-600 mt-1 capitalize">
                        {unit.unitType.replace(/-/g, " ")}
                      </p>
                    </div>
                    <Badge variant={unit.status === "occupied" ? "default" : "secondary"}>
                      {unit.status === "occupied" ? "Occupied" : "Vacant"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Tenant Info */}
                  {unit.status === "occupied" && tenant && (
                    <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={tenant.avatar} />
                          <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-neutral-900 truncate">{tenant.name}</p>
                          <p className="text-neutral-600 truncate">{tenant.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rent Information */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Base Rent:</span>
                      <span className="text-neutral-900">${unit.baseRent.toLocaleString()}</span>
                    </div>
                    
                    {unit.charges.length > 0 && (
                      <>
                        <div className="text-neutral-600 mt-3 mb-2">Charges:</div>
                        {unit.charges.map((charge) => (
                          <div key={charge.id} className="flex justify-between items-center pl-3">
                            <span className="text-neutral-600">
                              {charge.name}
                              {charge.isOptional && (
                                <span className="text-neutral-400 ml-1">(Optional)</span>
                              )}
                            </span>
                            <span className="text-neutral-900">
                              ${charge.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                    
                    <div className="pt-2 border-t border-neutral-200 flex justify-between items-center">
                      <span className="text-neutral-900">Total Monthly:</span>
                      <span className="text-neutral-900">${totalRent.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setEditingUnit(unit)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Unit
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredUnits.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Grid3x3 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">No units found</p>
              <p className="text-neutral-500">
                {searchQuery || filterStatus !== "all" || filterType !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by adding your first unit"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <AddEditUnitDialog
        open={isAddDialogOpen || !!editingUnit}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingUnit(null);
          }
        }}
        onSave={editingUnit ? handleEditUnit : handleAddUnit}
        unit={editingUnit}
      />
    </div>
  );
}
