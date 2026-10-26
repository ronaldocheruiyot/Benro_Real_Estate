import { useState } from "react";
import { Navigation } from "./Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Home, 
  Users, 
  Wrench,
  FileText,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { UserRole } from "./UserManagementPage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface ApprovalItem {
  id: string;
  type: "property" | "tenant" | "landlord" | "advertisement" | "maintenanceBudget" | "tenantActivation";
  title: string;
  description: string;
  requestedBy: string;
  requestedDate: string;
  status: "pending" | "approved" | "rejected";
  details: any;
}

interface ApprovalCenterPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser: UserRole;
}

export function ApprovalCenterPage({ 
  onLogout, 
  onNavigate,
  currentUser 
}: ApprovalCenterPageProps) {
  // Sample approval items (in a real app, these would come from a backend)
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([
    {
      id: "1",
      type: "property",
      title: "New Property Listing - Sunset Gardens",
      description: "3-bedroom apartments with modern amenities",
      requestedBy: "Admin User",
      requestedDate: "2026-01-28",
      status: "pending",
      details: { units: 20, rentRange: "$2000-$2500" }
    },
    {
      id: "2",
      type: "tenant",
      title: "Tenant Allocation - Unit 101",
      description: "Allocate John Doe to Unit 101, Sunset Apartments",
      requestedBy: "Admin User",
      requestedDate: "2026-01-29",
      status: "pending",
      details: { tenant: "John Doe", unit: "Unit 101" }
    },
    {
      id: "3",
      type: "advertisement",
      title: "Advertisement - Downtown Lofts",
      description: "Promotional ad for new property launch",
      requestedBy: "Admin User",
      requestedDate: "2026-01-30",
      status: "pending",
      details: { budget: "$500" }
    },
    {
      id: "4",
      type: "maintenanceBudget",
      title: "Maintenance Budget - Roof Repair",
      description: "Roof repair for Harbor View Residences",
      requestedBy: "Mike Caretaker",
      requestedDate: "2026-01-27",
      status: "pending",
      details: { amount: "$5,000", property: "Harbor View Residences" }
    },
  ]);

  const handleApprove = (id: string) => {
    setApprovalItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: "approved" as const } : item
      )
    );
  };

  const handleReject = (id: string) => {
    setApprovalItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: "rejected" as const } : item
      )
    );
  };

  const getTypeIcon = (type: ApprovalItem["type"]) => {
    switch (type) {
      case "property": return <Home className="h-4 w-4" />;
      case "tenant": return <Users className="h-4 w-4" />;
      case "landlord": return <Users className="h-4 w-4" />;
      case "advertisement": return <FileText className="h-4 w-4" />;
      case "maintenanceBudget": return <Wrench className="h-4 w-4" />;
      case "tenantActivation": return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: ApprovalItem["type"]) => {
    const colors = {
      property: "bg-blue-100 text-blue-700",
      tenant: "bg-green-100 text-green-700",
      landlord: "bg-purple-100 text-purple-700",
      advertisement: "bg-orange-100 text-orange-700",
      maintenanceBudget: "bg-red-100 text-red-700",
      tenantActivation: "bg-teal-100 text-teal-700"
    };
    return colors[type];
  };

  const pendingItems = approvalItems.filter(item => item.status === "pending");
  const approvedItems = approvalItems.filter(item => item.status === "approved");
  const rejectedItems = approvalItems.filter(item => item.status === "rejected");

  const ApprovalTable = ({ items }: { items: ApprovalItem[] }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Requested By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-neutral-500 py-8">
                No items to display
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge className={getTypeBadge(item.type)}>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(item.type)}
                      <span className="capitalize">{item.type.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell className="text-neutral-600">{item.description}</TableCell>
                <TableCell>{item.requestedBy}</TableCell>
                <TableCell className="text-neutral-600">{item.requestedDate}</TableCell>
                <TableCell>
                  {item.status === "pending" && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {item.status === "approved" && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  )}
                  {item.status === "rejected" && (
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      <XCircle className="h-3 w-3 mr-1" />
                      Rejected
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {item.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(item.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="approvals" currentUser={currentUser} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-neutral-900 mb-2 flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-purple-600" />
            Approval Center
          </h1>
          <p className="text-neutral-600">
            Review and approve pending requests across the system
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Pending</p>
                  <p className="text-neutral-900">{pendingItems.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Approved Today</p>
                  <p className="text-neutral-900">{approvedItems.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Rejected</p>
                  <p className="text-neutral-900">{rejectedItems.length}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Total Items</p>
                  <p className="text-neutral-900">{approvalItems.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approval Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  Pending ({pendingItems.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedItems.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedItems.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-6">
                <ApprovalTable items={pendingItems} />
              </TabsContent>
              
              <TabsContent value="approved" className="mt-6">
                <ApprovalTable items={approvedItems} />
              </TabsContent>
              
              <TabsContent value="rejected" className="mt-6">
                <ApprovalTable items={rejectedItems} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Property Manager Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-blue-900 mb-2">✅ Approval Authority</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Landlord onboarding and property listings</li>
                  <li>• Tenant allocation and account activation</li>
                  <li>• Advertisement and rental pricing</li>
                  <li>• Maintenance budgets and major repairs</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="text-purple-900 mb-2">🔍 Oversight Duties</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Review financial summaries</li>
                  <li>• Resolve escalated issues</li>
                  <li>• Suspend/terminate accounts when necessary</li>
                  <li>• Monitor system performance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
