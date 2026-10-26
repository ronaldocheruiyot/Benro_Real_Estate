import { useState } from "react";
import { Navigation } from "./Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  ClipboardCheck, 
  Plus, 
  Calendar, 
  Camera,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Home
} from "lucide-react";
import { UserAccount } from "../types/roles";
import { Apartment } from "./ApartmentCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

type InspectionType = "move_in" | "move_out" | "routine" | "emergency";
type InspectionStatus = "scheduled" | "in_progress" | "completed";

interface InspectionItem {
  area: string;
  condition: "excellent" | "good" | "fair" | "poor";
  notes?: string;
  photoRequired: boolean;
}

interface Inspection {
  id: string;
  type: InspectionType;
  property: string;
  propertyName: string;
  location: string; // Unit number
  status: InspectionStatus;
  scheduledDate: string;
  completedDate?: string;
  conductedBy?: string;
  tenant?: string;
  items: InspectionItem[];
  overallRating?: "excellent" | "good" | "fair" | "poor";
  photos?: number;
  utilityReadings?: {
    water?: string;
    electricity?: string;
    gas?: string;
  };
  notes?: string;
}

interface InspectionsPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser: UserAccount;
  apartments: Apartment[];
}

export function InspectionsPage({ 
  onLogout, 
  onNavigate,
  currentUser,
  apartments
}: InspectionsPageProps) {
  // Check permissions
  if (!currentUser.permissions.conductInspections) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation 
          onLogout={onLogout} 
          onNavigate={onNavigate} 
          currentView="inspections"
          currentUser={currentUser}
        />
        <div className="p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl mb-2">Access Denied</h2>
              <p className="text-neutral-600">You don't have permission to access inspections.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const [inspections, setInspections] = useState<Inspection[]>([
    {
      id: "1",
      type: "move_in",
      property: "1",
      propertyName: "Sunset Apartments",
      location: "Unit 101",
      status: "scheduled",
      scheduledDate: "2026-02-05",
      tenant: "John Doe",
      items: [
        { area: "Living Room", condition: "good", photoRequired: true },
        { area: "Kitchen", condition: "good", photoRequired: true },
        { area: "Bedroom", condition: "good", photoRequired: true },
        { area: "Bathroom", condition: "good", photoRequired: true },
      ]
    },
    {
      id: "2",
      type: "routine",
      property: "2",
      propertyName: "Harbor View Residences",
      location: "Building Common Areas",
      status: "in_progress",
      scheduledDate: "2026-02-01",
      conductedBy: "Mike Caretaker",
      items: [
        { area: "Lobby", condition: "excellent", photoRequired: false },
        { area: "Elevators", condition: "good", photoRequired: true, notes: "Minor wear on buttons" },
        { area: "Parking Lot", condition: "fair", photoRequired: true, notes: "Some cracks need repair" },
      ]
    },
    {
      id: "3",
      type: "move_out",
      property: "1",
      propertyName: "Sunset Apartments",
      location: "Unit 205",
      status: "completed",
      scheduledDate: "2026-01-25",
      completedDate: "2026-01-25",
      conductedBy: "Mike Caretaker",
      tenant: "Jane Smith",
      overallRating: "good",
      photos: 12,
      items: [
        { area: "Living Room", condition: "good", photoRequired: true },
        { area: "Kitchen", condition: "fair", photoRequired: true, notes: "Stove needs cleaning" },
        { area: "Bedroom", condition: "excellent", photoRequired: true },
        { area: "Bathroom", condition: "good", photoRequired: true },
      ],
      utilityReadings: {
        water: "12,450",
        electricity: "8,920",
        gas: "3,150"
      }
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [newInspection, setNewInspection] = useState({
    type: "routine" as InspectionType,
    property: "",
    location: "",
    scheduledDate: "",
    tenant: "",
  });

  const handleCreateInspection = () => {
    if (!newInspection.type || !newInspection.property || !newInspection.scheduledDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const propertyName = apartments.find(a => a.id === newInspection.property)?.name || "Unknown Property";

    const inspection: Inspection = {
      id: Date.now().toString(),
      type: newInspection.type,
      property: newInspection.property,
      propertyName,
      location: newInspection.location,
      status: "scheduled",
      scheduledDate: newInspection.scheduledDate,
      tenant: newInspection.tenant || undefined,
      items: getDefaultInspectionItems(newInspection.type),
    };

    setInspections([...inspections, inspection]);
    toast.success("Inspection scheduled successfully");
    
    setIsCreateDialogOpen(false);
    setNewInspection({
      type: "routine",
      property: "",
      location: "",
      scheduledDate: "",
      tenant: "",
    });
  };

  const getDefaultInspectionItems = (type: InspectionType): InspectionItem[] => {
    if (type === "move_in" || type === "move_out") {
      return [
        { area: "Living Room", condition: "good", photoRequired: true },
        { area: "Kitchen", condition: "good", photoRequired: true },
        { area: "Bedroom", condition: "good", photoRequired: true },
        { area: "Bathroom", condition: "good", photoRequired: true },
        { area: "Doors & Windows", condition: "good", photoRequired: true },
        { area: "Walls & Ceiling", condition: "good", photoRequired: false },
      ];
    } else {
      return [
        { area: "Common Areas", condition: "good", photoRequired: false },
        { area: "Building Exterior", condition: "good", photoRequired: true },
        { area: "Safety Equipment", condition: "good", photoRequired: false },
      ];
    }
  };

  const handleStartInspection = (id: string) => {
    setInspections(inspections.map(ins => 
      ins.id === id ? { ...ins, status: "in_progress" as InspectionStatus, conductedBy: currentUser.name } : ins
    ));
    toast.success("Inspection started");
  };

  const handleCompleteInspection = (id: string) => {
    setInspections(inspections.map(ins => 
      ins.id === id ? { 
        ...ins, 
        status: "completed" as InspectionStatus, 
        completedDate: new Date().toISOString().split('T')[0],
        overallRating: "good" as const,
        photos: Math.floor(Math.random() * 15) + 5
      } : ins
    ));
    toast.success("Inspection completed");
  };

  const getStatusBadge = (status: InspectionStatus) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Calendar className="h-3 w-3 mr-1" /> Scheduled</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><ClipboardCheck className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
    }
  };

  const getTypeBadge = (type: InspectionType) => {
    const colors = {
      move_in: "bg-purple-100 text-purple-700 border-purple-200",
      move_out: "bg-orange-100 text-orange-700 border-orange-200",
      routine: "bg-blue-100 text-blue-700 border-blue-200",
      emergency: "bg-red-100 text-red-700 border-red-200",
    };
    return <Badge className={colors[type]}>{type.replace("_", " ").toUpperCase()}</Badge>;
  };

  const scheduledInspections = inspections.filter(i => i.status === "scheduled");
  const inProgressInspections = inspections.filter(i => i.status === "in_progress");
  const completedInspections = inspections.filter(i => i.status === "completed");

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation 
        onLogout={onLogout} 
        onNavigate={onNavigate} 
        currentView="inspections"
        currentUser={currentUser}
      />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-neutral-900 mb-2">Property Inspections</h1>
            <p className="text-neutral-600">
              Schedule and conduct move-in, move-out, and routine property inspections
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Inspection
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Inspection</DialogTitle>
                <DialogDescription>
                  Create a new property inspection
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="inspType">Inspection Type *</Label>
                  <Select 
                    value={newInspection.type}
                    onValueChange={(value) => setNewInspection({...newInspection, type: value as InspectionType})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="move_in">Move-In Inspection</SelectItem>
                      <SelectItem value="move_out">Move-Out Inspection</SelectItem>
                      <SelectItem value="routine">Routine Inspection</SelectItem>
                      <SelectItem value="emergency">Emergency Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="inspProperty">Property *</Label>
                  <Select 
                    value={newInspection.property}
                    onValueChange={(value) => setNewInspection({...newInspection, property: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {apartments.map((apt) => (
                        <SelectItem key={apt.id} value={apt.id}>
                          {apt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="inspLocation">Location</Label>
                  <Input
                    id="inspLocation"
                    placeholder="e.g., Unit 101 or Common Areas"
                    value={newInspection.location}
                    onChange={(e) => setNewInspection({...newInspection, location: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="inspDate">Scheduled Date *</Label>
                  <Input
                    id="inspDate"
                    type="date"
                    value={newInspection.scheduledDate}
                    onChange={(e) => setNewInspection({...newInspection, scheduledDate: e.target.value})}
                  />
                </div>

                {(newInspection.type === "move_in" || newInspection.type === "move_out") && (
                  <div>
                    <Label htmlFor="inspTenant">Tenant Name</Label>
                    <Input
                      id="inspTenant"
                      placeholder="Tenant name"
                      value={newInspection.tenant}
                      onChange={(e) => setNewInspection({...newInspection, tenant: e.target.value})}
                    />
                  </div>
                )}

                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={handleCreateInspection}
                >
                  Schedule Inspection
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Total Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-500" />
                <span className="text-2xl">{inspections.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-2xl">{scheduledInspections.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl">{inProgressInspections.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl">{completedInspections.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inspections Table */}
        <Card>
          <Tabs defaultValue="all" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  All ({inspections.length})
                </TabsTrigger>
                <TabsTrigger value="scheduled">
                  Scheduled ({scheduledInspections.length})
                </TabsTrigger>
                <TabsTrigger value="in_progress">
                  In Progress ({inProgressInspections.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedInspections.length})
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="all" className="mt-0">
                <InspectionsTable 
                  inspections={inspections} 
                  onStart={handleStartInspection}
                  onComplete={handleCompleteInspection}
                  onView={(inspection) => {
                    setSelectedInspection(inspection);
                    setIsDetailDialogOpen(true);
                  }}
                  getStatusBadge={getStatusBadge}
                  getTypeBadge={getTypeBadge}
                />
              </TabsContent>

              <TabsContent value="scheduled" className="mt-0">
                <InspectionsTable 
                  inspections={scheduledInspections} 
                  onStart={handleStartInspection}
                  onComplete={handleCompleteInspection}
                  onView={(inspection) => {
                    setSelectedInspection(inspection);
                    setIsDetailDialogOpen(true);
                  }}
                  getStatusBadge={getStatusBadge}
                  getTypeBadge={getTypeBadge}
                />
              </TabsContent>

              <TabsContent value="in_progress" className="mt-0">
                <InspectionsTable 
                  inspections={inProgressInspections} 
                  onStart={handleStartInspection}
                  onComplete={handleCompleteInspection}
                  onView={(inspection) => {
                    setSelectedInspection(inspection);
                    setIsDetailDialogOpen(true);
                  }}
                  getStatusBadge={getStatusBadge}
                  getTypeBadge={getTypeBadge}
                />
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                <InspectionsTable 
                  inspections={completedInspections} 
                  onStart={handleStartInspection}
                  onComplete={handleCompleteInspection}
                  onView={(inspection) => {
                    setSelectedInspection(inspection);
                    setIsDetailDialogOpen(true);
                  }}
                  getStatusBadge={getStatusBadge}
                  getTypeBadge={getTypeBadge}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// Inspections Table Component
function InspectionsTable({ 
  inspections, 
  onStart, 
  onComplete,
  onView,
  getStatusBadge,
  getTypeBadge
}: {
  inspections: Inspection[];
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onView: (inspection: Inspection) => void;
  getStatusBadge: (status: InspectionStatus) => JSX.Element;
  getTypeBadge: (type: InspectionType) => JSX.Element;
}) {
  if (inspections.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardCheck className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-600">No inspections found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Property</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Tenant</TableHead>
          <TableHead>Scheduled Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inspections.map((inspection) => (
          <TableRow key={inspection.id}>
            <TableCell>{getTypeBadge(inspection.type)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Home className="h-3 w-3 text-neutral-400" />
                <span>{inspection.propertyName}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-neutral-400" />
                <span>{inspection.location}</span>
              </div>
            </TableCell>
            <TableCell>{inspection.tenant || "-"}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-neutral-400" />
                <span>{inspection.scheduledDate}</span>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(inspection.status)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                {inspection.status === "scheduled" && (
                  <Button 
                    size="sm" 
                    onClick={() => onStart(inspection.id)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Start
                  </Button>
                )}
                {inspection.status === "in_progress" && (
                  <Button 
                    size="sm" 
                    onClick={() => onComplete(inspection.id)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Complete
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onView(inspection)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
