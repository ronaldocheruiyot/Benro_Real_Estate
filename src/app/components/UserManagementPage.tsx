import { useState } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Key, 
  Shield, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { AddUserDialog } from "./AddUserDialog";
import { EditPermissionsDialog } from "./EditPermissionsDialog";
import { Apartment } from "./ApartmentCard";

export interface UserRole {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "caretaker" | "accountant";
  status: "active" | "inactive" | "pending";
  createdDate: string;
  lastLogin?: string;
  password: string;
  tempPassword: boolean;
  permissions: UserPermissions;
  assignedProperties?: string[]; // Property IDs they can access
  phone?: string;
  address?: string;
  avatar?: string;
}

export interface UserPermissions {
  viewDashboard: boolean;
  manageTenants: boolean;
  managePayments: boolean;
  manageUnits: boolean;
  viewReports: boolean;
  manageUsers: boolean;
  manageAdvertisements: boolean;
  viewAllProperties: boolean;
  deleteData: boolean;
  exportData: boolean;
  manageProperties: boolean; // Edit apartment details
}

interface UserManagementPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  apartments: Apartment[];
  currentUser: UserRole;
  users: UserRole[];
  onUpdateUsers: (users: UserRole[] | ((prev: UserRole[]) => UserRole[])) => void | Promise<void>;
}

export const defaultPermissionsByRole: Record<UserRole["role"], UserPermissions> = {
  admin: {
    viewDashboard: true,
    manageTenants: true,
    managePayments: true,
    manageUnits: true,
    viewReports: true,
    manageUsers: true,
    manageAdvertisements: true,
    viewAllProperties: true,
    deleteData: true,
    exportData: true,
    manageProperties: true,
  },
  manager: {
    viewDashboard: true,
    manageTenants: true,
    managePayments: true,
    manageUnits: true,
    viewReports: true,
    manageUsers: false,
    manageAdvertisements: true,
    viewAllProperties: true,
    deleteData: false,
    exportData: true,
    manageProperties: true, // Managers can edit apartment descriptions
  },
  caretaker: {
    viewDashboard: true,
    manageTenants: false,
    managePayments: false,
    manageUnits: true,
    viewReports: false,
    manageUsers: false,
    manageAdvertisements: false,
    viewAllProperties: false,
    deleteData: false,
    exportData: false,
    manageProperties: true, // Caretakers can edit apartment descriptions
  },
  accountant: {
    viewDashboard: true,
    manageTenants: false,
    managePayments: true,
    manageUnits: false,
    viewReports: true,
    manageUsers: false,
    manageAdvertisements: false,
    viewAllProperties: true,
    deleteData: false,
    exportData: true,
    manageProperties: false, // Accountants cannot edit apartment descriptions
  },
};

export function UserManagementPage({ 
  onLogout, 
  onNavigate,
  apartments,
  currentUser,
  users,
  onUpdateUsers
}: UserManagementPageProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const handleAddUser = (userData: Omit<UserRole, "id" | "createdDate" | "tempPassword" | "password">) => {
    // Generate a random password
    const tempPassword = generatePassword();
    
    const newUser: UserRole = {
      ...userData,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split('T')[0],
      password: tempPassword,
      tempPassword: true,
      status: "pending",
    };

    onUpdateUsers([...users, newUser]);

    // Simulate sending email
    simulateEmailSend(newUser.email, tempPassword);
    
    setIsAddDialogOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      onUpdateUsers(users.filter(u => u.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    onUpdateUsers(users.map(u => 
      u.id === id 
        ? { ...u, status: u.status === "active" ? "inactive" : "active" }
        : u
    ));
  };

  const handleUpdatePermissions = (userId: string, permissions: UserPermissions, assignedProperties?: string[]) => {
    onUpdateUsers(users.map(u => 
      u.id === userId 
        ? { ...u, permissions, assignedProperties }
        : u
    ));
    setIsPermissionsDialogOpen(false);
    setSelectedUser(null);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const simulateEmailSend = (email: string, password: string) => {
    // In a real app, this would send an actual email
    console.log(`
      ========================================
      EMAIL SENT TO: ${email}
      ========================================
      
      Subject: Welcome to Property Management System
      
      Hello,
      
      An account has been created for you in the Property Management System.
      
      Your login credentials:
      Email: ${email}
      Temporary Password: ${password}
      
      Please login and change your password immediately.
      
      Login at: [Your App URL]
      
      Best regards,
      Property Management Team
      ========================================
    `);
    
    alert(`✅ Account created!\n\nAn email has been sent to ${email} with login credentials.\n\nTemporary Password: ${password}\n\n(Check browser console for email preview)`);
  };

  const getRoleBadgeColor = (role: UserRole["role"]) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-700";
      case "manager": return "bg-blue-100 text-brand-navy";
      case "caretaker": return "bg-green-100 text-green-700";
      case "accountant": return "bg-orange-100 text-orange-700";
    }
  };

  const getStatusBadge = (status: UserRole["status"]) => {
    switch (status) {
      case "active": 
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "inactive": 
        return <Badge className="bg-red-100 text-red-700">Inactive</Badge>;
      case "pending": 
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="userManagement" />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-neutral-900 mb-2 flex items-center gap-3">
                <Users className="h-8 w-8 text-brand-cyan" />
                User Management & Roles
              </h1>
              <p className="text-neutral-600">
                Manage staff accounts, roles, and permissions
              </p>
            </div>
            {currentUser.permissions.manageUsers && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 mb-1">Total Users</p>
                    <p className="text-neutral-900">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-brand-cyan" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 mb-1">Active</p>
                    <p className="text-neutral-900">
                      {users.filter(u => u.status === "active").length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 mb-1">Pending</p>
                    <p className="text-neutral-900">
                      {users.filter(u => u.status === "pending").length}
                    </p>
                  </div>
                  <Mail className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-600 mb-1">Inactive</p>
                    <p className="text-neutral-900">
                      {users.filter(u => u.status === "inactive").length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Temp Password</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Properties Access</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-neutral-500 py-8">
                        No users found. Add your first staff member to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-neutral-400" />
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          {user.tempPassword ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              <Key className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Changed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-neutral-100 rounded text-xs">
                              {showPasswords[user.id] ? user.password : "••••••••"}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(user.id)}
                            >
                              {showPasswords[user.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.permissions.viewAllProperties ? (
                            <Badge variant="outline">All Properties</Badge>
                          ) : (
                            <Badge variant="outline">
                              {user.assignedProperties?.length || 0} Properties
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-neutral-600">
                          {user.createdDate}
                        </TableCell>
                        <TableCell className="text-neutral-600">
                          {user.lastLogin || "Never"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsPermissionsDialogOpen(true);
                              }}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(user.id)}
                            >
                              {user.status === "active" ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                            {currentUser.permissions.manageUsers && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Role Descriptions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Role Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="text-purple-900 mb-2">👑 Admin</h3>
                <p className="text-neutral-700">
                  Full system access. Can manage all users, properties, tenants, and system settings.
                </p>
              </div>
              <div className="p-4 bg-brand-cyan-soft rounded-lg">
                <h3 className="text-brand-navy mb-2">📊 Manager</h3>
                <p className="text-neutral-700">
                  Manages properties, tenants, payments, and reports. Cannot manage users or delete critical data.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-green-900 mb-2">🔧 Caretaker</h3>
                <p className="text-neutral-700">
                  Manages units and maintenance. Limited to assigned properties only. Cannot access financial data.
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="text-orange-900 mb-2">💰 Accountant</h3>
                <p className="text-neutral-700">
                  Handles payments and financial reports. Can view all properties but cannot modify tenant or unit data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddUser}
        apartments={apartments}
        defaultPermissionsByRole={defaultPermissionsByRole}
      />

      {selectedUser && (
        <EditPermissionsDialog
          open={isPermissionsDialogOpen}
          onOpenChange={setIsPermissionsDialogOpen}
          user={selectedUser}
          apartments={apartments}
          onSave={handleUpdatePermissions}
        />
      )}
    </div>
  );
}
