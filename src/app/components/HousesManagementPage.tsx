import { useState } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Plus, Settings, Home, CheckCircle2, AlertCircle, Building2, Trash2 } from "lucide-react";
import { Apartment } from "./ApartmentCard";
import { AddApartmentDialog } from "./AddApartmentDialog";
import { EditApartmentDialog } from "./EditApartmentDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

interface HousesManagementPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  apartments: Apartment[];
  onApartmentsChange: (apartments: Apartment[]) => void | Promise<void>;
  onPersistApartment?: (data: Omit<Apartment, "id"> & { name: string }, id?: string) => Promise<void>;
  onPersistDeleteApartment?: (id: string) => Promise<void>;
  onConfigureUnits: (apartment: Apartment) => void;
  currentUser?: any;
}

export function HousesManagementPage({
  onLogout,
  onNavigate,
  apartments,
  onApartmentsChange,
  onPersistApartment,
  onPersistDeleteApartment,
  onConfigureUnits,
  currentUser
}: HousesManagementPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [apartmentToEdit, setApartmentToEdit] = useState<Apartment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState<Apartment | null>(null);

  // Check permissions
  const canEdit = currentUser?.permissions?.manageProperties !== false;

  const filteredApartments = apartments.filter((apt) =>
    apt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddApartment = async (apartment: Omit<Apartment, "id">) => {
    if (onPersistApartment) {
      await onPersistApartment({ ...apartment, name: apartment.name, hasUnitsConfigured: false });
      return;
    }
    const newApartment: Apartment = {
      ...apartment,
      id: Date.now().toString(),
      hasUnitsConfigured: false
    };
    await onApartmentsChange([...apartments, newApartment]);
  };

  const handleEditApartment = async (updatedApartment: Apartment) => {
    if (onPersistApartment) {
      const { id, ...rest } = updatedApartment;
      await onPersistApartment({ ...rest, name: updatedApartment.name }, id);
      return;
    }
    const updatedApartments = apartments.map((apt) =>
      apt.id === updatedApartment.id ? updatedApartment : apt
    );
    await onApartmentsChange(updatedApartments);
  };

  const handleDeleteConfirm = async () => {
    if (apartmentToDelete) {
      if (onPersistDeleteApartment) {
        await onPersistDeleteApartment(apartmentToDelete.id);
      } else {
        const updatedApartments = apartments.filter((apt) => apt.id !== apartmentToDelete.id);
        await onApartmentsChange(updatedApartments);
      }
      setDeleteDialogOpen(false);
      setApartmentToDelete(null);
    }
  };

  const stats = {
    total: apartments.length,
    configured: apartments.filter(apt => apt.hasUnitsConfigured).length,
    notConfigured: apartments.filter(apt => !apt.hasUnitsConfigured).length
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="houses" currentUser={currentUser} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-neutral-900 mb-2">Houses Management</h1>
              <p className="text-neutral-600">Manage all your properties and configure units</p>
            </div>
            {canEdit && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add House/Property
              </Button>
            )}
          </div>
        </div>

        {/* Info Alert */}
        <div className="mb-6 p-4 bg-brand-cyan-soft border border-brand-cyan/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-brand-cyan mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-brand-navy mb-1">Manage Your Properties</p>
            <p className="text-brand-navy">
              Add all your houses/properties here, then configure units for each one. Units define the individual rental spaces (apartments, rooms, etc.) within each property.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Total Properties</p>
                  <p className="text-neutral-900">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-brand-cyan-soft rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-brand-cyan" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Units Configured</p>
                  <p className="text-neutral-900">{stats.configured}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Needs Setup</p>
                  <p className="text-neutral-900">{stats.notConfigured}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search properties by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        {filteredApartments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApartments.map((apartment) => (
              <Card key={apartment.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {/* Property Image */}
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={apartment.imageUrl}
                    alt={apartment.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={apartment.hasUnitsConfigured ? "default" : "secondary"}
                      className={apartment.hasUnitsConfigured ? "bg-green-600" : "bg-orange-500"}
                    >
                      {apartment.hasUnitsConfigured ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" /> Units Setup</>
                      ) : (
                        <><AlertCircle className="mr-1 h-3 w-3" /> No Units</>
                      )}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-neutral-900">{apartment.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {apartment.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="flex-1 bg-brand-navy text-white hover:bg-brand-navy-deep"
                      onClick={() => onConfigureUnits(apartment)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {apartment.hasUnitsConfigured ? "Manage Units" : "Setup Units"}
                    </Button>
                    
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setApartmentToEdit(apartment);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setApartmentToDelete(apartment);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 mb-2">
                {searchQuery ? "No properties found" : "No properties yet"}
              </p>
              <p className="text-neutral-500 mb-4">
                {searchQuery 
                  ? "Try adjusting your search query" 
                  : "Get started by adding your first house or property"}
              </p>
              {!searchQuery && canEdit && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Property
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Apartment Dialog */}
      <AddApartmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddApartment}
      />

      {/* Edit Apartment Dialog */}
      <EditApartmentDialog
        apartment={apartmentToEdit}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setApartmentToEdit(null);
        }}
        onSave={async (id, updates) => {
          const current = apartments.find((a) => a.id === id);
          if (!current) return;
          await handleEditApartment({ ...current, ...updates });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                You are about to permanently delete{" "}
                <strong>“{apartmentToDelete?.name}”</strong>.
              </span>
              <span className="block text-red-700">
                This can remove linked units, tenants, payments, and documents. This action
                cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setApartmentToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
