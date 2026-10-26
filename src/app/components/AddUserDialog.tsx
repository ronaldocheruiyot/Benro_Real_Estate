import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { UserRole, UserPermissions } from "./UserManagementPage";
import { Apartment } from "./ApartmentCard";
import { Mail, User, Briefcase } from "lucide-react";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (user: Omit<UserRole, "id" | "createdDate" | "tempPassword" | "password">) => void;
  apartments: Apartment[];
  defaultPermissionsByRole: Record<UserRole["role"], UserPermissions>;
}

export function AddUserDialog({ 
  open, 
  onOpenChange, 
  onAdd, 
  apartments,
  defaultPermissionsByRole 
}: AddUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole["role"]>("caretaker");
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    const permissions = defaultPermissionsByRole[role];

    onAdd({
      name: name.trim(),
      email: email.trim(),
      role,
      status: "pending",
      permissions,
      assignedProperties: permissions.viewAllProperties ? undefined : selectedProperties,
    });

    // Reset form
    setName("");
    setEmail("");
    setRole("caretaker");
    setSelectedProperties([]);
  };

  const handlePropertyToggle = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const currentPermissions = defaultPermissionsByRole[role];
  const needsPropertySelection = !currentPermissions.viewAllProperties;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a new user to your property management system and assign them the appropriate role and permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-sm text-neutral-600">
                Login credentials will be sent to this email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 z-10" />
                <Select value={role} onValueChange={(value) => setRole(value as UserRole["role"])}>
                  <SelectTrigger id="role" className="pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full Access</SelectItem>
                    <SelectItem value="manager">Manager - Property Management</SelectItem>
                    <SelectItem value="caretaker">Caretaker - Unit Maintenance</SelectItem>
                    <SelectItem value="accountant">Accountant - Financial Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Role Permissions Preview */}
          <div className="p-4 bg-neutral-50 rounded-lg">
            <h4 className="mb-3 text-neutral-900">Default Permissions for {role.charAt(0).toUpperCase() + role.slice(1)}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(currentPermissions).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-neutral-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-600 mt-3">
              You can customize these permissions after creating the user
            </p>
          </div>

          {/* Property Assignment */}
          {needsPropertySelection && (
            <div className="space-y-3">
              <Label>Assign Properties *</Label>
              <p className="text-sm text-neutral-600 mb-3">
                Select which properties this {role} can access
              </p>
              <div className="border rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
                {apartments.length === 0 ? (
                  <p className="text-neutral-500 text-sm">No properties available</p>
                ) : (
                  apartments.map((apt) => (
                    <div key={apt.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`property-${apt.id}`}
                        checked={selectedProperties.includes(apt.id)}
                        onCheckedChange={() => handlePropertyToggle(apt.id)}
                      />
                      <label
                        htmlFor={`property-${apt.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <p className="text-neutral-900">{apt.name}</p>
                        <p className="text-sm text-neutral-600">{apt.description}</p>
                      </label>
                    </div>
                  ))
                )}
              </div>
              {needsPropertySelection && selectedProperties.length === 0 && (
                <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
                  ⚠️ Please select at least one property for this user
                </p>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-blue-900 mb-2">📧 What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• An auto-generated password will be created</li>
              <li>• Email with login credentials will be sent to the user</li>
              <li>• User must change password on first login</li>
              <li>• You can view/edit permissions after creation</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={needsPropertySelection && selectedProperties.length === 0}
            >
              Create User & Send Email
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}