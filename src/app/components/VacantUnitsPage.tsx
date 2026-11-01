import { useState } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { ArrowLeft, Search, Plus, Home } from "lucide-react";
import { Apartment } from "./ApartmentCard";
import { AddVacantUnitDialog } from "./AddVacantUnitDialog";

interface VacantUnitsPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  apartment: Apartment;
  onBack: () => void;
  vacantUnits: string[];
  setVacantUnits: (units: string[]) => void;
  units?: { id: string; unitNumber: string }[];
  onAddUnit?: (unit: {
    unitNumber: string;
    unitType: string;
    baseRent: number;
    charges: [];
    status: "vacant";
  }) => Promise<void>;
}

export function VacantUnitsPage({ 
  onLogout, 
  onNavigate, 
  apartment, 
  onBack,
  vacantUnits,
  setVacantUnits,
  onAddUnit,
}: VacantUnitsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const filteredUnits = vacantUnits.filter((unit) =>
    unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUnit = async (unitName: string) => {
    if (vacantUnits.includes(unitName)) return;
    if (onAddUnit) {
      await onAddUnit({
        unitNumber: unitName,
        unitType: "bedsitter",
        baseRent: 0,
        charges: [],
        status: "vacant",
      });
      return;
    }
    setVacantUnits([...vacantUnits, unitName]);
  };

  const handleRemoveUnit = (unitName: string) => {
    if (confirm(`Remove ${unitName} from vacant units?`)) {
      setVacantUnits(vacantUnits.filter(u => u !== unitName));
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
            <div className="flex items-center justify-between">
              <div>
                <h1>Vacant Units - {apartment.name}</h1>
                <p className="text-neutral-600 mt-1">
                  {vacantUnits.length} vacant units available
                </p>
              </div>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 gap-2"
              >
                <Plus className="size-5" />
                Add Vacant Unit
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 size-5" />
                <Input
                  placeholder="Search vacant units..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Units Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnits.map((unit, index) => (
              <Card key={index} className="border-orange-200 bg-orange-50 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Home className="size-6 text-orange-700" />
                      </div>
                      <div>
                        <p className="text-orange-900">{unit}</p>
                        <p className="text-orange-700">Available</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveUnit(unit)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredUnits.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  {vacantUnits.length === 0 
                    ? "All units are occupied! Great job!" 
                    : "No units found matching your search"}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Statistics */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="mb-4">Vacancy Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span>Total Vacant Units</span>
                  <span className="text-orange-600">{vacantUnits.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span>Potential Monthly Revenue</span>
                  <span className="text-brand-cyan">
                    ${(vacantUnits.length * 2400).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Vacant Unit Dialog */}
      <AddVacantUnitDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddUnit}
      />
    </div>
  );
}
