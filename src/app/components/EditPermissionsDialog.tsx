import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";
import { UserRole, UserPermissions } from "./UserManagementPage";
import { Apartment } from "./ApartmentCard";
import { Shield, Lock, Unlock } from "lucide-react";

interface EditPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserRole;
  apartments: Apartment[];
  onSave: (userId: string, permissions: UserPermissions, assignedProperties?: string[]) => void;
}

export function EditPermissionsDialog({ 
  open, 
  onOpenChange, 
  user,
  apartments,
  onSave 
}: EditPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<UserPermissions>(user.permissions);
  const [assignedProperties, setAssignedProperties] = useState<string[]>(
    user.assignedProperties || []
  );

  const handlePermissionToggle = (key: keyof UserPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePropertyToggle = (propertyId: string) => {
    setAssignedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSave = () => {
    if (!permissions.viewAllProperties && assignedProperties.length === 0) {
      alert("Please assign at least one property or enable 'View All Properties'");
      return;
    }

    onSave(
      user.id, 
      permissions, 
      permissions.viewAllProperties ? undefined : assignedProperties
    );
  };

  const permissionLabels: Record<keyof UserPermissions, { label: string; description: string }> = {
    viewDashboard: {
      label: "View Dashboard",
      description: "Access to main dashboard and statistics"
    },
    manageTenants: {
      label: "Manage Tenants",
      description: "Add, edit, and remove tenants"
    },
    managePayments: {
      label: "Manage Payments",
      description: "Process payments and view payment history"
    },
    manageUnits: {
      label: "Manage Units",
      description: "Edit unit details, rent, and charges"
    },
    viewReports: {
      label: "View Financial Reports",
      description: "Access financial analytics and reports"
    },
    manageUsers: {
      label: "Manage Users",
      description: "Create and manage staff accounts (Admin only)"
    },
    manageAdvertisements: {
      label: "Manage Advertisements",
      description: "Create and publish property listings"
    },
    viewAllProperties: {
      label: "View All Properties",
      description: "Access all properties (otherwise limited to assigned)"
    },
    deleteData: {
      label: "Delete Data",
      description: "Permission to delete records (use with caution)"
    },
    exportData: {
      label: "Export Data",
      description: "Download reports and export data to CSV"
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Edit Permissions - {user.name}
          </DialogTitle>
          <DialogDescription>
            Configure access permissions and property assignments for this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-neutral-600">Email:</span>{" "}
                <span className="text-neutral-900">{user.email}</span>
              </div>
              <div>
                <span className="text-neutral-600">Role:</span>{" "}
                <span className="text-neutral-900 capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-neutral-600" />
              <h3 className="text-neutral-900">Permissions</h3>
            </div>

            <div className="space-y-4">
              {Object.entries(permissionLabels).map(([key, { label, description }]) => (
                <div 
                  key={key} 
                  className="flex items-start justify-between p-4 bg-white border rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex-1">
                    <Label htmlFor={key} className="cursor-pointer">
                      {label}
                    </Label>
                    <p className="text-sm text-neutral-600 mt-1">{description}</p>
                  </div>
                  <Switch
                    id={key}
                    checked={permissions[key as keyof UserPermissions]}
                    onCheckedChange={() => handlePermissionToggle(key as keyof UserPermissions)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Property Assignment */}
          {!permissions.viewAllProperties && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Unlock className="h-5 w-5 text-neutral-600" />
                <h3 className="text-neutral-900">Assigned Properties</h3>
              </div>
              <p className="text-sm text-neutral-600">
                User can only access these selected properties
              </p>
              <div className="border rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto bg-white">
                {apartments.length === 0 ? (
                  <p className="text-neutral-500 text-sm">No properties available</p>
                ) : (
                  apartments.map((apt) => (
                    <div key={apt.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`edit-property-${apt.id}`}
                        checked={assignedProperties.includes(apt.id)}
                        onCheckedChange={() => handlePropertyToggle(apt.id)}
                      />
                      <label
                        htmlFor={`edit-property-${apt.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <p className="text-neutral-900">{apt.name}</p>
                        <p className="text-sm text-neutral-600">{apt.description}</p>
                      </label>
                    </div>
                  ))
                )}
              </div>
              {assignedProperties.length === 0 && (
                <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
                  ⚠️ No properties assigned. User won't be able to access any property data.
                </p>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-blue-900 mb-2">📋 Permission Summary</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>Active Permissions:</strong>{" "}
                {Object.values(permissions).filter(Boolean).length} of {Object.keys(permissions).length}
              </p>
              <p>
                <strong>Property Access:</strong>{" "}
                {permissions.viewAllProperties 
                  ? "All Properties" 
                  : `${assignedProperties.length} Selected`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Permissions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}