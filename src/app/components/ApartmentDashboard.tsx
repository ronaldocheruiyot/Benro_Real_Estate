import { useState } from "react";
import { Navigation } from "./Navigation";
import { ApartmentCard, Apartment } from "./ApartmentCard";
import { AddApartmentDialog } from "./AddApartmentDialog";
import { EditApartmentDialog } from "./EditApartmentDialog";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Plus, Building2, Settings, Info } from "lucide-react";
import { UserRole } from "./UserManagementPage";

interface ApartmentDashboardProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  onViewTenants: (apartment: Apartment) => void;
  apartments: Apartment[];
  onApartmentsChange: (apartments: Apartment[]) => void | Promise<void>;
  onPersistApartment?: (data: Omit<Apartment, "id"> & { name: string }, id?: string) => Promise<void>;
  onPersistDeleteApartment?: (id: string) => Promise<void>;
  currentUser?: UserRole;
}

export function ApartmentDashboard({ onLogout, onNavigate, onViewTenants, apartments, onApartmentsChange, onPersistApartment, onPersistDeleteApartment, currentUser }: ApartmentDashboardProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [apartmentToEdit, setApartmentToEdit] = useState<Apartment | null>(null);

  // Check permissions
  const canEdit = currentUser?.permissions?.manageProperties !== false;
  const canDelete = currentUser?.permissions?.deleteData !== false;
  const canAdd = currentUser?.permissions?.manageProperties !== false;

  const handleDelete = async (id: string) => {
    if (onPersistDeleteApartment) {
      await onPersistDeleteApartment(id);
    } else {
      const newApartments = apartments.filter((apt) => apt.id !== id);
      await onApartmentsChange(newApartments);
    }
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddApartment = async (apartmentData: Omit<Apartment, "id">) => {
    if (onPersistApartment) {
      await onPersistApartment({ ...apartmentData, name: apartmentData.name });
      return;
    }
    const newApartment: Apartment = {
      id: Date.now().toString(),
      ...apartmentData,
    };
    await onApartmentsChange([...apartments, newApartment]);
  };

  const handleEditApartment = (apartment: Apartment) => {
    setApartmentToEdit(apartment);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (id: string, updates: Partial<Apartment>) => {
    if (onPersistApartment) {
      const current = apartments.find((a) => a.id === id);
      await onPersistApartment(
        { name: updates.name || current?.name || "", description: updates.description ?? current?.description, imageUrl: updates.imageUrl ?? current?.imageUrl, hasUnitsConfigured: updates.hasUnitsConfigured ?? current?.hasUnitsConfigured },
        id
      );
      return;
    }
    const newApartments = apartments.map((apt) =>
      apt.id === id ? { ...apt, ...updates } : apt
    );
    await onApartmentsChange(newApartments);
  };

  return (
    <div className="size-full flex flex-col bg-neutral-50">
      {/* Navigation */}
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="dashboard" currentUser={currentUser} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1>Available Houses</h1>
              <p className="text-neutral-600 mt-1">
                Manage your apartment properties
              </p>
            </div>
            {canAdd && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Plus className="size-5" />
                Add Apartment
              </Button>
            )}
          </div>

          {/* Apartment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.map((apartment) => (
              <ApartmentCard
                key={apartment.id}
                apartment={apartment}
                onDelete={handleDelete}
                isSelected={selectedIds.has(apartment.id)}
                onSelect={handleSelect}
                onViewTenants={onViewTenants}
                onEdit={handleEditApartment}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </div>

          {apartments.length === 0 && (
            <div className="text-center py-20">
              <p className="text-neutral-500 mb-4">No apartments available</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="size-5 mr-2" />
                Add Your First Apartment
              </Button>
            </div>
          )}
        </div>
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
        onSave={handleSaveEdit}
      />
    </div>
  );
}
