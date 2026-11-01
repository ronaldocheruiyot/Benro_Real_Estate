import { useState } from "react";
import { Navigation } from "./Navigation";
import { ApartmentCard, Apartment } from "./ApartmentCard";
import { AddApartmentDialog } from "./AddApartmentDialog";
import { EditApartmentDialog } from "./EditApartmentDialog";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Plus } from "lucide-react";
import { UserRole } from "./UserManagementPage";
import { toast } from "sonner";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState<Apartment | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Check permissions
  const canEdit = currentUser?.permissions?.manageProperties !== false;
  const canDelete = currentUser?.permissions?.deleteData !== false;
  const canAdd = currentUser?.permissions?.manageProperties !== false;

  const requestDelete = (id: string) => {
    const apt = apartments.find((a) => a.id === id) || null;
    setApartmentToDelete(apt);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!apartmentToDelete) return;
    setDeleting(true);
    try {
      if (onPersistDeleteApartment) {
        await onPersistDeleteApartment(apartmentToDelete.id);
      } else {
        await onApartmentsChange(apartments.filter((apt) => apt.id !== apartmentToDelete.id));
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(apartmentToDelete.id);
        return next;
      });
      toast.success("Apartment deleted", {
        description: `"${apartmentToDelete.name}" and its linked data were removed.`,
      });
      setDeleteDialogOpen(false);
      setApartmentToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete apartment");
    } finally {
      setDeleting(false);
    }
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
    <div className="size-full flex flex-col bg-brand-cyan-soft/40">
      {/* Navigation */}
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="dashboard" currentUser={currentUser} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-brand-navy">Available Houses</h1>
              <p className="text-brand-navy/60 mt-1">
                Manage your apartment properties
              </p>
            </div>
            {canAdd && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="gap-2 bg-brand-navy text-white hover:bg-brand-navy-deep"
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
                onDelete={requestDelete}
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
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-brand-navy text-white hover:bg-brand-navy-deep">
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

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setApartmentToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this apartment?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                You are about to permanently delete{" "}
                <strong>“{apartmentToDelete?.name}”</strong>.
              </span>
              <span className="block text-red-700">
                This can remove linked units, tenants, payments, and documents for this
                property. This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteConfirm();
              }}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? "Deleting…" : "Yes, delete apartment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
