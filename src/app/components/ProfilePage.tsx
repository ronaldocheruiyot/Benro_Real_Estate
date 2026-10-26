import { Navigation } from "./Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Mail, Phone, MapPin, Calendar, Edit, TrendingUp, ArrowRight, BarChart3 } from "lucide-react";
import { UserRole } from "./UserManagementPage";

interface ProfilePageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser?: UserRole;
}

export function ProfilePage({ onLogout, onNavigate, currentUser }: ProfilePageProps) {
  const userInfo = {
    name: currentUser?.name || "John Doe",
    email: currentUser?.email || "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    role: currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : "Property Manager",
    address: "123 Main Street, New York, NY 10001",
    joinDate: "January 15, 2023",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NjAzOTUxMjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  };

  const stats = [
    { label: "Total Properties", value: "3" },
    { label: "Active Tenants", value: "24" },
    { label: "Maintenance Requests", value: "5" },
    { label: "Monthly Revenue", value: "$45,000" },
  ];

  return (
    <div className="size-full flex flex-col bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="profile" currentUser={currentUser} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1>My Profile</h1>
            <p className="text-neutral-600 mt-1">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <Button variant="outline" className="gap-2">
                  <Edit className="size-4" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="size-32">
                    <AvatarImage src={userInfo.avatar} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                </div>

                {/* Information Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={userInfo.name} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={userInfo.role} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-neutral-400" />
                      <Input value={userInfo.email} readOnly className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-neutral-400" />
                      <Input value={userInfo.phone} readOnly className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-neutral-400" />
                      <Input value={userInfo.address} readOnly className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-neutral-400" />
                      <Input value={userInfo.joinDate} readOnly className="flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Statistics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <p className="text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-blue-600">{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Reports Link */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-100">
            <CardContent className="pt-6">
              <button
                onClick={() => onNavigate("financialReports")}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-neutral-900 mb-1">Financial Reports & Analytics</h3>
                    <p className="text-neutral-600">
                      View detailed income reports, payment history, and analytics from all properties
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Revenue Tracking
                      </span>
                      <span>• Advanced Filters</span>
                      <span>• Export Reports</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-blue-600" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
