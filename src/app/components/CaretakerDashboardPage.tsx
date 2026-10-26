import { useState } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Wrench, 
  ClipboardList, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Upload,
  Eye,
  Zap,
  FileText,
  Home,
  TrendingUp,
  Users,
  UserPlus,
  UserMinus,
  DollarSign,
  CalendarClock,
  FileWarning,
  Plus,
  X,
  Trash2,
  Building2,
  DoorOpen,
  DoorClosed
} from "lucide-react";
import { UserRole } from "./UserManagementPage";
import { toast } from "sonner";

interface CaretakerDashboardPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser?: UserRole;
}

interface CaretakerTenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  moveInDate: string;
  rentAmount: number;
  paymentStatus: "paid" | "unpaid" | "overdue";
  lastPaymentDate?: string;
  documents: TenantDocument[];
  hasAllDocuments: boolean;
}

interface TenantDocument {
  id: string;
  name: string;
  type: "id" | "lease" | "income_proof" | "reference" | "other";
  uploadedDate?: string;
  status: "uploaded" | "missing";
}

interface ExtensionRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  unit: string;
  requestedDays: number;
  reason: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
}

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedDate: string;
  dueDate: string;
  location: string;
  notes?: string;
}

interface PropertyUnit {
  id: string;
  unitNumber: string;
  building?: string;
  bedrooms: number;
  bathrooms: number;
  rentPrice: number;
  status: "vacant" | "occupied";
  tenant?: {
    id: string;
    name: string;
    moveInDate: string;
  };
  lastInspection?: string;
}

interface MaintenanceIssue {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  location: string;
  reportedDate: string;
  photos?: File[];
}

interface Inspection {
  id: string;
  type: "move_in" | "move_out" | "routine" | "property_condition";
  location: string;
  scheduledDate: string;
  notes?: string;
  photos?: File[];
}

interface UtilityReading {
  id: string;
  type: "water" | "electricity" | "gas";
  reading: number;
  location: string;
  date: string;
}

interface Incident {
  id: string;
  type: "emergency" | "violation" | "complaint" | "other";
  title: string;
  description: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  reportedDate: string;
}

interface SubmittedOperation {
  id: string;
  type: "maintenance" | "inspection" | "reading" | "incident";
  title: string;
  location: string;
  status: "pending" | "reviewed" | "completed";
  submittedDate: string;
  priority?: string;
  severity?: string;
  readingType?: string;
  readingValue?: number;
  description?: string;
  photos?: number;
  hasEvidence?: boolean;
}

export function CaretakerDashboardPage({ onLogout, onNavigate, currentUser }: CaretakerDashboardPageProps) {
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [removeTenantOpen, setRemoveTenantOpen] = useState(false);
  const [requestExtensionOpen, setRequestExtensionOpen] = useState(false);
  const [viewDocumentsOpen, setViewDocumentsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<CaretakerTenant | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Maintenance Operations Dialogs
  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const [conductInspectionOpen, setConductInspectionOpen] = useState(false);
  const [addReadingOpen, setAddReadingOpen] = useState(false);
  const [reportIncidentOpen, setReportIncidentOpen] = useState(false);

  // Report Maintenance Issue State
  const [issueTitle, setIssueTitle] = useState("");
  const [issueLocation, setIssueLocation] = useState("");
  const [issuePriority, setIssuePriority] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issuePhotos, setIssuePhotos] = useState<File[]>([]);

  // Conduct Inspection State
  const [inspectionType, setInspectionType] = useState("");
  const [inspectionLocation, setInspectionLocation] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [inspectionPhotos, setInspectionPhotos] = useState<File[]>([]);

  // Utility Reading State
  const [readingType, setReadingType] = useState("");
  const [readingLocation, setReadingLocation] = useState("");
  const [readingValue, setReadingValue] = useState("");
  const [readingDate, setReadingDate] = useState("");

  // Report Incident State
  const [incidentType, setIncidentType] = useState("");
  const [incidentSeverity, setIncidentSeverity] = useState("");
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentLocation, setIncidentLocation] = useState("");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentEvidence, setIncidentEvidence] = useState<File[]>([]);

  // New Tenant Form State
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantEmail, setNewTenantEmail] = useState("");
  const [newTenantPhone, setNewTenantPhone] = useState("");
  const [newTenantUnit, setNewTenantUnit] = useState("");
  const [newTenantRent, setNewTenantRent] = useState("");

  // Extension Request State
  const [extensionDays, setExtensionDays] = useState("");
  const [extensionReason, setExtensionReason] = useState("");

  // Sample tenants data
  const [tenants, setTenants] = useState<CaretakerTenant[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "555-0101",
      unit: "101",
      moveInDate: "2024-01-15",
      rentAmount: 1200,
      paymentStatus: "paid",
      lastPaymentDate: "2024-03-01",
      documents: [
        { id: "1", name: "National ID", type: "id", uploadedDate: "2024-01-10", status: "uploaded" },
        { id: "2", name: "Lease Agreement", type: "lease", uploadedDate: "2024-01-15", status: "uploaded" },
        { id: "3", name: "Income Proof", type: "income_proof", uploadedDate: "2024-01-12", status: "uploaded" },
      ],
      hasAllDocuments: true
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "555-0102",
      unit: "203",
      moveInDate: "2024-02-01",
      rentAmount: 1500,
      paymentStatus: "unpaid",
      documents: [
        { id: "1", name: "National ID", type: "id", uploadedDate: "2024-01-28", status: "uploaded" },
        { id: "2", name: "Lease Agreement", type: "lease", status: "missing" },
        { id: "3", name: "Income Proof", type: "income_proof", status: "missing" },
      ],
      hasAllDocuments: false
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael.b@email.com",
      phone: "555-0103",
      unit: "305",
      moveInDate: "2024-01-20",
      rentAmount: 1300,
      paymentStatus: "overdue",
      lastPaymentDate: "2024-01-20",
      documents: [
        { id: "1", name: "National ID", type: "id", uploadedDate: "2024-01-18", status: "uploaded" },
        { id: "2", name: "Lease Agreement", type: "lease", uploadedDate: "2024-01-20", status: "uploaded" },
        { id: "3", name: "Income Proof", type: "income_proof", status: "missing" },
        { id: "4", name: "References", type: "reference", status: "missing" },
      ],
      hasAllDocuments: false
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.d@email.com",
      phone: "555-0104",
      unit: "102",
      moveInDate: "2024-02-15",
      rentAmount: 1100,
      paymentStatus: "paid",
      lastPaymentDate: "2024-03-01",
      documents: [
        { id: "1", name: "National ID", type: "id", uploadedDate: "2024-02-10", status: "uploaded" },
        { id: "2", name: "Lease Agreement", type: "lease", uploadedDate: "2024-02-15", status: "uploaded" },
        { id: "3", name: "Income Proof", type: "income_proof", uploadedDate: "2024-02-12", status: "uploaded" },
        { id: "4", name: "References", type: "reference", uploadedDate: "2024-02-11", status: "uploaded" },
      ],
      hasAllDocuments: true
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david.w@email.com",
      phone: "555-0105",
      unit: "204",
      moveInDate: "2024-03-01",
      rentAmount: 1400,
      paymentStatus: "unpaid",
      documents: [
        { id: "1", name: "National ID", type: "id", status: "missing" },
        { id: "2", name: "Lease Agreement", type: "lease", status: "missing" },
        { id: "3", name: "Income Proof", type: "income_proof", status: "missing" },
      ],
      hasAllDocuments: false
    },
  ]);

  const [extensionRequests, setExtensionRequests] = useState<ExtensionRequest[]>([
    {
      id: "1",
      tenantId: "3",
      tenantName: "Michael Brown",
      unit: "305",
      requestedDays: 7,
      reason: "Waiting for salary payment",
      requestDate: "2024-03-05",
      status: "pending"
    }
  ]);

  // Property Units Data
  const [propertyUnits] = useState<PropertyUnit[]>([
    {
      id: "1",
      unitNumber: "101",
      building: "Block A",
      bedrooms: 2,
      bathrooms: 1,
      rentPrice: 1200,
      status: "occupied",
      tenant: {
        id: "1",
        name: "John Smith",
        moveInDate: "2024-01-15"
      },
      lastInspection: "2024-02-15"
    },
    {
      id: "2",
      unitNumber: "102",
      building: "Block A",
      bedrooms: 1,
      bathrooms: 1,
      rentPrice: 1100,
      status: "occupied",
      tenant: {
        id: "4",
        name: "Emily Davis",
        moveInDate: "2024-02-15"
      },
      lastInspection: "2024-03-01"
    },
    {
      id: "3",
      unitNumber: "103",
      building: "Block A",
      bedrooms: 2,
      bathrooms: 2,
      rentPrice: 1400,
      status: "vacant",
      lastInspection: "2024-02-20"
    },
    {
      id: "4",
      unitNumber: "201",
      building: "Block B",
      bedrooms: 2,
      bathrooms: 1,
      rentPrice: 1250,
      status: "vacant",
      lastInspection: "2024-03-05"
    },
    {
      id: "5",
      unitNumber: "203",
      building: "Block B",
      bedrooms: 3,
      bathrooms: 2,
      rentPrice: 1500,
      status: "occupied",
      tenant: {
        id: "2",
        name: "Sarah Johnson",
        moveInDate: "2024-02-01"
      },
      lastInspection: "2024-02-28"
    },
    {
      id: "6",
      unitNumber: "204",
      building: "Block B",
      bedrooms: 2,
      bathrooms: 2,
      rentPrice: 1400,
      status: "occupied",
      tenant: {
        id: "5",
        name: "David Wilson",
        moveInDate: "2024-03-01"
      }
    },
    {
      id: "7",
      unitNumber: "305",
      building: "Block C",
      bedrooms: 2,
      bathrooms: 1,
      rentPrice: 1300,
      status: "occupied",
      tenant: {
        id: "3",
        name: "Michael Brown",
        moveInDate: "2024-01-20"
      },
      lastInspection: "2024-02-10"
    },
    {
      id: "8",
      unitNumber: "306",
      building: "Block C",
      bedrooms: 3,
      bathrooms: 2,
      rentPrice: 1600,
      status: "vacant",
      lastInspection: "2024-01-30"
    }
  ]);

  const [myTasks] = useState<MaintenanceTask[]>([
    {
      id: "1",
      title: "Fix leaking faucet - Unit 201",
      description: "Kitchen faucet leaking, needs immediate attention",
      status: "in_progress",
      priority: "high",
      assignedDate: "2024-03-01",
      dueDate: "2024-03-05",
      location: "Unit 201"
    },
    {
      id: "2",
      title: "Replace light bulbs - Common Area",
      description: "3 light bulbs need replacement in hallway",
      status: "pending",
      priority: "low",
      assignedDate: "2024-03-02",
      dueDate: "2024-03-10",
      location: "3rd Floor Hallway"
    }
  ]);

  // Submitted Operations History
  const [submittedOperations, setSubmittedOperations] = useState<SubmittedOperation[]>([
    {
      id: "1",
      type: "maintenance",
      title: "Broken window in Unit 305",
      location: "Unit 305",
      status: "reviewed",
      submittedDate: "2024-03-10",
      priority: "high",
      description: "Window cracked, needs replacement",
      photos: 2
    },
    {
      id: "2",
      type: "inspection",
      title: "Routine Inspection",
      location: "Unit 102",
      status: "completed",
      submittedDate: "2024-03-08",
      photos: 5
    }
  ]);

  // Maintenance operations handlers
  const handleReportIssue = () => {
    if (!issueTitle || !issueLocation || !issuePriority || !issueDescription) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Create new submitted operation
    const newOperation: SubmittedOperation = {
      id: Date.now().toString(),
      type: "maintenance",
      title: issueTitle,
      location: issueLocation,
      status: "pending",
      submittedDate: new Date().toISOString().split('T')[0],
      priority: issuePriority,
      description: issueDescription,
      photos: issuePhotos.length
    };
    
    setSubmittedOperations([newOperation, ...submittedOperations]);
    toast.success(`Maintenance issue "${issueTitle}" reported successfully`);
    
    // Reset form
    setIssueTitle("");
    setIssueLocation("");
    setIssuePriority("");
    setIssueDescription("");
    setIssuePhotos([]);
    setReportIssueOpen(false);
  };

  const handleConductInspection = () => {
    if (!inspectionType || !inspectionLocation || !inspectionDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Create new submitted operation
    const newOperation: SubmittedOperation = {
      id: Date.now().toString(),
      type: "inspection",
      title: inspectionType,
      location: inspectionLocation,
      status: "pending",
      submittedDate: new Date().toISOString().split('T')[0],
      description: inspectionNotes,
      photos: inspectionPhotos.length
    };
    
    setSubmittedOperations([newOperation, ...submittedOperations]);
    toast.success(`${inspectionType} inspection recorded for ${inspectionLocation}`);
    
    // Reset form
    setInspectionType("");
    setInspectionLocation("");
    setInspectionDate("");
    setInspectionNotes("");
    setInspectionPhotos([]);
    setConductInspectionOpen(false);
  };

  const handleAddReading = () => {
    if (!readingType || !readingLocation || !readingValue || !readingDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Create new submitted operation
    const newOperation: SubmittedOperation = {
      id: Date.now().toString(),
      type: "reading",
      title: `${readingType} Reading`,
      location: readingLocation,
      status: "pending",
      submittedDate: new Date().toISOString().split('T')[0],
      readingType: readingType,
      readingValue: parseFloat(readingValue)
    };
    
    setSubmittedOperations([newOperation, ...submittedOperations]);
    toast.success(`${readingType} reading of ${readingValue} recorded for ${readingLocation}`);
    
    // Reset form
    setReadingType("");
    setReadingLocation("");
    setReadingValue("");
    setReadingDate("");
    setAddReadingOpen(false);
  };

  const handleReportIncident = () => {
    if (!incidentType || !incidentSeverity || !incidentTitle || !incidentLocation || !incidentDescription) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Create new submitted operation
    const newOperation: SubmittedOperation = {
      id: Date.now().toString(),
      type: "incident",
      title: incidentTitle,
      location: incidentLocation,
      status: "pending",
      submittedDate: new Date().toISOString().split('T')[0],
      severity: incidentSeverity,
      description: incidentDescription,
      hasEvidence: incidentEvidence.length > 0,
      photos: incidentEvidence.length
    };
    
    setSubmittedOperations([newOperation, ...submittedOperations]);
    toast.success(`${incidentSeverity.toUpperCase()} ${incidentType} incident reported`);
    
    // Reset form
    setIncidentType("");
    setIncidentSeverity("");
    setIncidentTitle("");
    setIncidentLocation("");
    setIncidentDescription("");
    setIncidentEvidence([]);
    setReportIncidentOpen(false);
  };

  const handleAddTenant = () => {
    if (!newTenantName || !newTenantEmail || !newTenantPhone || !newTenantUnit || !newTenantRent) {
      toast.error("Please fill all required fields");
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    const requiredDocs: TenantDocument[] = [
      { id: "1", name: "National ID", type: "id", status: uploadedFiles.some(f => f.name.toLowerCase().includes('id')) ? "uploaded" : "missing", uploadedDate: uploadedFiles.some(f => f.name.toLowerCase().includes('id')) ? new Date().toISOString().split('T')[0] : undefined },
      { id: "2", name: "Lease Agreement", type: "lease", status: uploadedFiles.some(f => f.name.toLowerCase().includes('lease')) ? "uploaded" : "missing", uploadedDate: uploadedFiles.some(f => f.name.toLowerCase().includes('lease')) ? new Date().toISOString().split('T')[0] : undefined },
      { id: "3", name: "Income Proof", type: "income_proof", status: uploadedFiles.some(f => f.name.toLowerCase().includes('income') || f.name.toLowerCase().includes('salary')) ? "uploaded" : "missing", uploadedDate: uploadedFiles.some(f => f.name.toLowerCase().includes('income') || f.name.toLowerCase().includes('salary')) ? new Date().toISOString().split('T')[0] : undefined },
    ];

    const newTenant: CaretakerTenant = {
      id: Date.now().toString(),
      name: newTenantName,
      email: newTenantEmail,
      phone: newTenantPhone,
      unit: newTenantUnit,
      moveInDate: new Date().toISOString().split('T')[0],
      rentAmount: parseFloat(newTenantRent),
      paymentStatus: "unpaid",
      documents: requiredDocs,
      hasAllDocuments: requiredDocs.every(doc => doc.status === "uploaded")
    };

    setTenants([...tenants, newTenant]);
    toast.success(`Tenant ${newTenantName} added successfully`);
    
    // Reset form
    setNewTenantName("");
    setNewTenantEmail("");
    setNewTenantPhone("");
    setNewTenantUnit("");
    setNewTenantRent("");
    setUploadedFiles([]);
    setAddTenantOpen(false);
  };

  const handleRemoveTenant = (tenant: CaretakerTenant) => {
    setTenants(tenants.filter(t => t.id !== tenant.id));
    toast.success(`Tenant ${tenant.name} removed successfully`);
    setRemoveTenantOpen(false);
    setSelectedTenant(null);
  };

  const handleRequestExtension = () => {
    if (!selectedTenant || !extensionDays || !extensionReason) {
      toast.error("Please fill all fields");
      return;
    }

    const newRequest: ExtensionRequest = {
      id: Date.now().toString(),
      tenantId: selectedTenant.id,
      tenantName: selectedTenant.name,
      unit: selectedTenant.unit,
      requestedDays: parseInt(extensionDays),
      reason: extensionReason,
      requestDate: new Date().toISOString().split('T')[0],
      status: "pending"
    };

    setExtensionRequests([...extensionRequests, newRequest]);
    toast.success(`Extension request submitted for ${selectedTenant.name}`);
    
    setExtensionDays("");
    setExtensionReason("");
    setRequestExtensionOpen(false);
    setSelectedTenant(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...filesArray]);
      toast.success(`${filesArray.length} file(s) uploaded`);
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      paid: "bg-green-100 text-green-700",
      unpaid: "bg-yellow-100 text-yellow-700",
      overdue: "bg-red-100 text-red-700"
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700"
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Badge>;
  };

  const paidTenants = tenants.filter(t => t.paymentStatus === "paid");
  const unpaidTenants = tenants.filter(t => t.paymentStatus === "unpaid" || t.paymentStatus === "overdue");
  const tenantsWithMissingDocs = tenants.filter(t => !t.hasAllDocuments);
  const pendingTasks = myTasks.filter(t => t.status !== "completed");
  const vacantUnits = propertyUnits.filter(u => u.status === "vacant");
  const occupiedUnits = propertyUnits.filter(u => u.status === "occupied");

  return (
    <div className="size-full flex flex-col bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="dashboard" currentUser={currentUser} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="flex items-center gap-2">
              <Wrench className="h-8 w-8 text-orange-600" />
              Caretaker Dashboard
            </h1>
            <p className="text-neutral-600 mt-1">
              Property Operations & Tenant Management - Comprehensive caretaker tools
            </p>
            <div className="mt-3 inline-flex items-center gap-2 bg-orange-50 text-orange-800 px-3 py-1.5 rounded-md text-sm">
              <span className="font-medium">🔑 Enhanced Access</span>
              <span className="text-orange-600">•</span>
              <span className="text-orange-700">Tenant & Property Management</span>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Total Tenants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{tenants.length}</div>
                <p className="text-xs text-neutral-600 mt-1">Active residents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Rent Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{paidTenants.length}</div>
                <p className="text-xs text-neutral-600 mt-1">Up to date</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Unpaid Rent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{unpaidTenants.length}</div>
                <p className="text-xs text-neutral-600 mt-1">Requires follow-up</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileWarning className="h-4 w-4 text-red-600" />
                  Missing Docs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{tenantsWithMissingDocs.length}</div>
                <p className="text-xs text-neutral-600 mt-1">Incomplete files</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  Pending Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{pendingTasks.length}</div>
                <p className="text-xs text-neutral-600 mt-1">Maintenance work</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Button onClick={() => setAddTenantOpen(true)} className="h-auto py-4 gap-2">
              <UserPlus className="h-5 w-5" />
              <span>Add New Tenant</span>
            </Button>
            <Button variant="outline" onClick={() => setRequestExtensionOpen(true)} className="h-auto py-4 gap-2">
              <CalendarClock className="h-5 w-5" />
              <span>Request Extension</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 gap-2">
              <FileText className="h-5 w-5" />
              <span>View All Documents</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>Payment Reports</span>
            </Button>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="all_tenants" className="space-y-6">
            <div className="overflow-x-auto pb-2">
              <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="all_tenants" className="flex items-center gap-2 whitespace-nowrap">
                <Users className="h-4 w-4" />
                All Tenants ({tenants.length})
              </TabsTrigger>
              <TabsTrigger value="payment_status" className="flex items-center gap-2 whitespace-nowrap">
                <DollarSign className="h-4 w-4" />
                Payment Status
              </TabsTrigger>
              <TabsTrigger value="missing_docs" className="flex items-center gap-2 whitespace-nowrap">
                <FileWarning className="h-4 w-4" />
                Missing Docs ({tenantsWithMissingDocs.length})
              </TabsTrigger>
              <TabsTrigger value="extensions" className="flex items-center gap-2 whitespace-nowrap">
                <CalendarClock className="h-4 w-4" />
                Extensions ({extensionRequests.filter(r => r.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="units" className="flex items-center gap-2 whitespace-nowrap">
                <Building2 className="h-4 w-4" />
                Units ({propertyUnits.length})
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center gap-2 whitespace-nowrap">
                <Wrench className="h-4 w-4" />
                My Tasks ({pendingTasks.length})
              </TabsTrigger>
              <TabsTrigger value="operations" className="flex items-center gap-2 whitespace-nowrap">
                <ClipboardList className="h-4 w-4" />
                Operations
              </TabsTrigger>
              <TabsTrigger value="submissions" className="flex items-center gap-2 whitespace-nowrap">
                <FileText className="h-4 w-4" />
                Submissions ({submittedOperations.length})
              </TabsTrigger>
              </TabsList>
            </div>

            {/* All Tenants Tab */}
            <TabsContent value="all_tenants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Tenants</CardTitle>
                  <CardDescription>Complete list of all tenants under your management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tenants.map((tenant) => (
                      <div key={tenant.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">{tenant.name}</h4>
                              {getPaymentStatusBadge(tenant.paymentStatus)}
                              {!tenant.hasAllDocuments && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  <FileWarning className="h-3 w-3 mr-1" />
                                  Missing Docs
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral-600">
                              <div>
                                <span className="text-xs text-neutral-500">Unit:</span>
                                <p className="font-medium text-neutral-900">{tenant.unit}</p>
                              </div>
                              <div>
                                <span className="text-xs text-neutral-500">Email:</span>
                                <p className="font-medium text-neutral-900">{tenant.email}</p>
                              </div>
                              <div>
                                <span className="text-xs text-neutral-500">Phone:</span>
                                <p className="font-medium text-neutral-900">{tenant.phone}</p>
                              </div>
                              <div>
                                <span className="text-xs text-neutral-500">Rent:</span>
                                <p className="font-medium text-neutral-900">${tenant.rentAmount}/mo</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 md:flex-col lg:flex-row w-full md:w-auto">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1 md:flex-initial"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setViewDocumentsOpen(true);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 flex-1 md:flex-initial"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setRemoveTenantOpen(true);
                              }}
                            >
                              <UserMinus className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Status Tab */}
            <TabsContent value="payment_status" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Paid Tenants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      Rent Paid ({paidTenants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {paidTenants.map((tenant) => (
                        <div key={tenant.id} className="border-l-4 border-green-500 bg-green-50 p-3 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{tenant.name}</p>
                              <p className="text-sm text-neutral-600">Unit {tenant.unit}</p>
                              <p className="text-xs text-neutral-500 mt-1">
                                Last payment: {tenant.lastPaymentDate}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">${tenant.rentAmount}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Unpaid Tenants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Rent Unpaid ({unpaidTenants.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {unpaidTenants.map((tenant) => (
                        <div key={tenant.id} className={`border-l-4 p-3 rounded ${
                          tenant.paymentStatus === "overdue" 
                            ? "border-red-500 bg-red-50" 
                            : "border-yellow-500 bg-yellow-50"
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{tenant.name}</p>
                              <p className="text-sm text-neutral-600">Unit {tenant.unit}</p>
                              {tenant.lastPaymentDate && (
                                <p className="text-xs text-neutral-500 mt-1">
                                  Last payment: {tenant.lastPaymentDate}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-red-600">${tenant.rentAmount}</p>
                              {getPaymentStatusBadge(tenant.paymentStatus)}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setRequestExtensionOpen(true);
                            }}
                          >
                            <CalendarClock className="h-3 w-3 mr-1" />
                            Request Extension
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Missing Documents Tab */}
            <TabsContent value="missing_docs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <FileWarning className="h-5 w-5" />
                    Tenants with Missing Documents
                  </CardTitle>
                  <CardDescription>These tenants have incomplete documentation on file</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tenantsWithMissingDocs.map((tenant) => (
                      <div key={tenant.id} className="border rounded-lg p-4 bg-red-50">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {tenant.name}
                              <Badge variant="outline" className="bg-white">Unit {tenant.unit}</Badge>
                            </h4>
                            <p className="text-sm text-neutral-600">{tenant.email}</p>
                          </div>
                          <Badge className="bg-red-100 text-red-700">
                            {tenant.documents.filter(d => d.status === "missing").length} Missing
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Document Status:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {tenant.documents.map((doc) => (
                              <div 
                                key={doc.id} 
                                className={`flex items-center justify-between p-2 rounded ${
                                  doc.status === "uploaded" 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-white text-red-700 border border-red-200"
                                }`}
                              >
                                <span className="text-sm flex items-center gap-2">
                                  {doc.status === "uploaded" ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <X className="h-4 w-4" />
                                  )}
                                  {doc.name}
                                </span>
                                {doc.status === "uploaded" && doc.uploadedDate && (
                                  <span className="text-xs">{doc.uploadedDate}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {tenantsWithMissingDocs.length === 0 && (
                      <div className="text-center py-8 text-neutral-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>All tenants have complete documentation!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Extension Requests Tab */}
            <TabsContent value="extensions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Extension Requests</CardTitle>
                  <CardDescription>Track extension requests submitted to management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {extensionRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{request.tenantName}</h4>
                            <p className="text-sm text-neutral-600">Unit {request.unit}</p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-600">Extension Days:</span>
                            <span className="font-medium">{request.requestedDays} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-600">Request Date:</span>
                            <span className="font-medium">{request.requestDate}</span>
                          </div>
                          <div>
                            <span className="text-neutral-600">Reason:</span>
                            <p className="font-medium mt-1">{request.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {extensionRequests.length === 0 && (
                      <div className="text-center py-8 text-neutral-500">
                        <CalendarClock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No extension requests</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Maintenance Tasks Tab */}
            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Maintenance Tasks</CardTitle>
                  <CardDescription>Assigned maintenance and repair tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myTasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{task.title}</h4>
                            <p className="text-sm text-neutral-600 mt-1">{task.description}</p>
                          </div>
                          <Badge className={
                            task.priority === "urgent" ? "bg-red-100 text-red-700" :
                            task.priority === "high" ? "bg-orange-100 text-orange-700" :
                            task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-neutral-100 text-neutral-700"
                          }>
                            {task.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-neutral-600 mt-3">
                          <div>
                            <span className="text-xs text-neutral-500">Location:</span>
                            <p className="font-medium text-neutral-900">{task.location}</p>
                          </div>
                          <div>
                            <span className="text-xs text-neutral-500">Due Date:</span>
                            <p className="font-medium text-neutral-900">{task.dueDate}</p>
                          </div>
                          <div>
                            <span className="text-xs text-neutral-500">Status:</span>
                            <p className="font-medium text-neutral-900 capitalize">{task.status.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Property Units Tab */}
            <TabsContent value="units" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Units</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{propertyUnits.length}</div>
                    <p className="text-xs text-neutral-600 mt-1">All properties</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DoorClosed className="h-4 w-4 text-green-600" />
                      Occupied Units
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{occupiedUnits.length}</div>
                    <p className="text-xs text-neutral-600 mt-1">{((occupiedUnits.length/propertyUnits.length)*100).toFixed(0)}% occupancy</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DoorOpen className="h-4 w-4 text-orange-600" />
                      Vacant Units
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">{vacantUnits.length}</div>
                    <p className="text-xs text-neutral-600 mt-1">Ready to rent</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <DoorClosed className="h-5 w-5" />
                      Occupied Units
                    </CardTitle>
                    <CardDescription>Units currently rented</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {occupiedUnits.map((unit) => (
                        <div key={unit.id} className="border-l-4 border-green-500 bg-green-50 p-3 rounded">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">Unit {unit.unitNumber}</p>
                                {unit.building && (
                                  <Badge variant="outline" className="text-xs">{unit.building}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-neutral-600 mt-1">{unit.tenant?.name}</p>
                            </div>
                            <p className="text-sm font-medium text-green-700">${unit.rentPrice}/mo</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-neutral-600 mt-2 pt-2 border-t">
                            <div>
                              <span className="text-neutral-500">Beds:</span> {unit.bedrooms}
                            </div>
                            <div>
                              <span className="text-neutral-500">Baths:</span> {unit.bathrooms}
                            </div>
                            <div>
                              <span className="text-neutral-500">Move-in:</span> {unit.tenant?.moveInDate.slice(5)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <DoorOpen className="h-5 w-5" />
                      Vacant Units
                    </CardTitle>
                    <CardDescription>Units available for rent</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {vacantUnits.map((unit) => (
                        <div key={unit.id} className="border-l-4 border-orange-500 bg-orange-50 p-3 rounded">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">Unit {unit.unitNumber}</p>
                                {unit.building && (
                                  <Badge variant="outline" className="text-xs">{unit.building}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-orange-700 mt-1">Available Now</p>
                            </div>
                            <p className="text-sm font-medium text-orange-700">${unit.rentPrice}/mo</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-neutral-600 mt-2 pt-2 border-t">
                            <div>
                              <span className="text-neutral-500">Beds:</span> {unit.bedrooms}
                            </div>
                            <div>
                              <span className="text-neutral-500">Baths:</span> {unit.bathrooms}
                            </div>
                            {unit.lastInspection && (
                              <div>
                                <span className="text-neutral-500">Inspected:</span> {unit.lastInspection.slice(5)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {vacantUnits.length === 0 && (
                        <div className="text-center py-8 text-neutral-500">
                          <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>All units are occupied!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="operations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance & Property Operations</CardTitle>
                  <CardDescription>Report issues, conduct inspections, and manage property operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setReportIssueOpen(true)}
                      className="flex items-start gap-4 p-4 border-2 border-neutral-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left group"
                    >
                      <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <Wrench className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">Report Maintenance</h3>
                        <p className="text-sm text-neutral-600 mt-1">
                          Report maintenance issues and repair requests
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConductInspectionOpen(true)}
                      className="flex items-start gap-4 p-4 border-2 border-neutral-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <ClipboardList className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">Conduct Inspection</h3>
                        <p className="text-sm text-neutral-600 mt-1">
                          Perform property inspections and record findings
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddReadingOpen(true)}
                      className="flex items-start gap-4 p-4 border-2 border-neutral-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                    >
                      <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Zap className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">Utility Readings</h3>
                        <p className="text-sm text-neutral-600 mt-1">
                          Record meter readings for water, electricity, gas
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportIncidentOpen(true)}
                      className="flex items-start gap-4 p-4 border-2 border-neutral-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left group"
                    >
                      <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">Report Incident</h3>
                        <p className="text-sm text-neutral-600 mt-1">
                          Report emergencies, violations, and complaints
                        </p>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Submissions Tab */}
            <TabsContent value="submissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Submitted Operations</CardTitle>
                  <CardDescription>Track all your submitted maintenance reports, inspections, readings, and incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {submittedOperations.length === 0 ? (
                      <div className="text-center py-12 text-neutral-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No submissions yet</p>
                        <p className="text-sm mt-1">Your submitted operations will appear here</p>
                      </div>
                    ) : (
                      submittedOperations.map((operation) => (
                        <div key={operation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Icon based on type */}
                              <div className={`p-2 rounded-lg ${
                                operation.type === "maintenance" ? "bg-orange-100" :
                                operation.type === "inspection" ? "bg-blue-100" :
                                operation.type === "reading" ? "bg-green-100" :
                                "bg-red-100"
                              }`}>
                                {operation.type === "maintenance" && <Wrench className="h-5 w-5 text-orange-600" />}
                                {operation.type === "inspection" && <ClipboardList className="h-5 w-5 text-blue-600" />}
                                {operation.type === "reading" && <Zap className="h-5 w-5 text-green-600" />}
                                {operation.type === "incident" && <AlertTriangle className="h-5 w-5 text-red-600" />}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{operation.title}</h4>
                                  <Badge className={
                                    operation.type === "maintenance" ? "bg-orange-100 text-orange-700" :
                                    operation.type === "inspection" ? "bg-blue-100 text-blue-700" :
                                    operation.type === "reading" ? "bg-green-100 text-green-700" :
                                    "bg-red-100 text-red-700"
                                  }>
                                    {operation.type.toUpperCase()}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-2">
                                  <div>
                                    <span className="text-xs text-neutral-500">Location:</span>
                                    <p className="font-medium text-neutral-900">{operation.location}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-neutral-500">Submitted:</span>
                                    <p className="font-medium text-neutral-900">{operation.submittedDate}</p>
                                  </div>
                                  {operation.priority && (
                                    <div>
                                      <span className="text-xs text-neutral-500">Priority:</span>
                                      <p className="font-medium text-neutral-900 capitalize">{operation.priority}</p>
                                    </div>
                                  )}
                                  {operation.severity && (
                                    <div>
                                      <span className="text-xs text-neutral-500">Severity:</span>
                                      <p className="font-medium text-neutral-900 capitalize">{operation.severity}</p>
                                    </div>
                                  )}
                                  {operation.readingType && (
                                    <div>
                                      <span className="text-xs text-neutral-500">Type:</span>
                                      <p className="font-medium text-neutral-900">{operation.readingType}</p>
                                    </div>
                                  )}
                                  {operation.readingValue && (
                                    <div>
                                      <span className="text-xs text-neutral-500">Value:</span>
                                      <p className="font-medium text-neutral-900">{operation.readingValue}</p>
                                    </div>
                                  )}
                                  {operation.photos !== undefined && operation.photos > 0 && (
                                    <div>
                                      <span className="text-xs text-neutral-500">Attachments:</span>
                                      <p className="font-medium text-neutral-900 flex items-center gap-1">
                                        <Camera className="h-3 w-3" />
                                        {operation.photos} photo{operation.photos > 1 ? 's' : ''}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                {operation.description && (
                                  <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                                    {operation.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <Badge className={
                              operation.status === "completed" ? "bg-green-100 text-green-700" :
                              operation.status === "reviewed" ? "bg-blue-100 text-blue-700" :
                              "bg-yellow-100 text-yellow-700"
                            }>
                              {operation.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Tenant Dialog */}
      <Dialog open={addTenantOpen} onOpenChange={setAddTenantOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogDescription>
              Enter tenant details and upload required documents
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Smith"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@email.com"
                  value={newTenantEmail}
                  onChange={(e) => setNewTenantEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="555-0101"
                  value={newTenantPhone}
                  onChange={(e) => setNewTenantPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit Number *</Label>
                <Input
                  id="unit"
                  placeholder="101"
                  value={newTenantUnit}
                  onChange={(e) => setNewTenantUnit(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rent">Monthly Rent ($) *</Label>
              <Input
                id="rent"
                type="number"
                placeholder="1200"
                value={newTenantRent}
                onChange={(e) => setNewTenantRent(e.target.value)}
              />
            </div>

            <div className="border-t pt-4">
              <Label>Upload Documents *</Label>
              <p className="text-sm text-neutral-600 mb-3">
                Required: National ID, Lease Agreement, Income Proof
              </p>
              
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                <p className="text-sm text-neutral-600 mb-2">
                  Click to upload or drag and drop
                </p>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Uploaded Files ({uploadedFiles.length}):</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-neutral-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-neutral-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeUploadedFile(index)}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddTenantOpen(false);
              setUploadedFiles([]);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddTenant}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Tenant Dialog */}
      <Dialog open={removeTenantOpen} onOpenChange={setRemoveTenantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this tenant?
            </DialogDescription>
          </DialogHeader>
          
          {selectedTenant && (
            <div className="space-y-3 p-4 bg-neutral-50 rounded-lg">
              <div>
                <span className="text-sm text-neutral-600">Name:</span>
                <p className="font-semibold">{selectedTenant.name}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">Unit:</span>
                <p className="font-semibold">{selectedTenant.unit}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">Email:</span>
                <p className="font-semibold">{selectedTenant.email}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTenantOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedTenant && handleRemoveTenant(selectedTenant)}
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Remove Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Extension Dialog */}
      <Dialog open={requestExtensionOpen} onOpenChange={setRequestExtensionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payment Extension</DialogTitle>
            <DialogDescription>
              Submit extension request to management for approval
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!selectedTenant ? (
              <div>
                <Label>Select Tenant *</Label>
                <Select onValueChange={(value) => {
                  const tenant = unpaidTenants.find(t => t.id === value);
                  setSelectedTenant(tenant || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tenant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unpaidTenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name} - Unit {tenant.unit} (${tenant.rentAmount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="p-3 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Selected Tenant:</p>
                <p className="font-semibold">{selectedTenant.name} - Unit {selectedTenant.unit}</p>
              </div>
            )}

            <div>
              <Label htmlFor="extension-days">Extension Days *</Label>
              <Input
                id="extension-days"
                type="number"
                placeholder="7"
                value={extensionDays}
                onChange={(e) => setExtensionDays(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="extension-reason">Reason for Extension *</Label>
              <Textarea
                id="extension-reason"
                placeholder="Explain why the extension is needed..."
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRequestExtensionOpen(false);
              setSelectedTenant(null);
              setExtensionDays("");
              setExtensionReason("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleRequestExtension}>
              <CalendarClock className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Documents Dialog */}
      <Dialog open={viewDocumentsOpen} onOpenChange={setViewDocumentsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tenant Documents</DialogTitle>
            <DialogDescription>
              {selectedTenant?.name} - Unit {selectedTenant?.unit}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTenant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg">
                <div>
                  <span className="text-sm text-neutral-600">Email:</span>
                  <p className="font-medium">{selectedTenant.email}</p>
                </div>
                <div>
                  <span className="text-sm text-neutral-600">Phone:</span>
                  <p className="font-medium">{selectedTenant.phone}</p>
                </div>
                <div>
                  <span className="text-sm text-neutral-600">Move-in Date:</span>
                  <p className="font-medium">{selectedTenant.moveInDate}</p>
                </div>
                <div>
                  <span className="text-sm text-neutral-600">Monthly Rent:</span>
                  <p className="font-medium">${selectedTenant.rentAmount}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Document Status</h4>
                <div className="space-y-2">
                  {selectedTenant.documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className={`flex items-center justify-between p-3 rounded border ${
                        doc.status === "uploaded" 
                          ? "bg-green-50 border-green-200" 
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {doc.status === "uploaded" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          {doc.uploadedDate && (
                            <p className="text-xs text-neutral-600">Uploaded: {doc.uploadedDate}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={
                        doc.status === "uploaded" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }>
                        {doc.status === "uploaded" ? "Complete" : "Missing"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setViewDocumentsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Maintenance Issue Dialog */}
      <Dialog open={reportIssueOpen} onOpenChange={setReportIssueOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Maintenance Issue</DialogTitle>
            <DialogDescription>
              Report a maintenance issue or repair request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="issue-title">Issue Title *</Label>
              <Input
                id="issue-title"
                placeholder="e.g., Leaking faucet in Unit 201"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue-location">Location *</Label>
                <Input
                  id="issue-location"
                  placeholder="Unit number or area"
                  value={issueLocation}
                  onChange={(e) => setIssueLocation(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="issue-priority">Priority *</Label>
                <Select value={issuePriority} onValueChange={setIssuePriority}>
                  <SelectTrigger id="issue-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="issue-description">Description *</Label>
              <Textarea
                id="issue-description"
                placeholder="Describe the issue in detail..."
                rows={4}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="issue-photos">Photos (Optional)</Label>
              <Input
                id="issue-photos"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setIssuePhotos(Array.from(e.target.files));
                  }
                }}
              />
              <p className="text-xs text-neutral-600 mt-1">Upload photos of the issue</p>
              
              {/* Image Preview */}
              {issuePhotos.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {issuePhotos.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => setIssuePhotos(issuePhotos.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-neutral-600 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setReportIssueOpen(false);
              setIssueTitle("");
              setIssueLocation("");
              setIssuePriority("");
              setIssueDescription("");
              setIssuePhotos([]);
            }}>
              Cancel
            </Button>
            <Button onClick={handleReportIssue}>
              <Wrench className="h-4 w-4 mr-2" />
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conduct Inspection Dialog */}
      <Dialog open={conductInspectionOpen} onOpenChange={setConductInspectionOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conduct Property Inspection</DialogTitle>
            <DialogDescription>
              Record inspection details and findings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inspection-type">Inspection Type *</Label>
                <Select value={inspectionType} onValueChange={setInspectionType}>
                  <SelectTrigger id="inspection-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Move-In Inspection">Move-In Inspection</SelectItem>
                    <SelectItem value="Move-Out Inspection">Move-Out Inspection</SelectItem>
                    <SelectItem value="Routine Inspection">Routine Inspection</SelectItem>
                    <SelectItem value="Property Condition">Property Condition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inspection-location">Location *</Label>
                <Input
                  id="inspection-location"
                  placeholder="Unit number or area"
                  value={inspectionLocation}
                  onChange={(e) => setInspectionLocation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="inspection-date">Inspection Date *</Label>
              <Input
                id="inspection-date"
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="inspection-notes">Notes & Findings</Label>
              <Textarea
                id="inspection-notes"
                placeholder="Record inspection findings, condition notes, and recommendations..."
                rows={5}
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="inspection-photos">Photos (Optional)</Label>
              <Input
                id="inspection-photos"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setInspectionPhotos(Array.from(e.target.files));
                  }
                }}
              />
              <p className="text-xs text-neutral-600 mt-1">Upload inspection photos</p>
              
              {/* Image Preview */}
              {inspectionPhotos.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {inspectionPhotos.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => setInspectionPhotos(inspectionPhotos.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-neutral-600 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setConductInspectionOpen(false);
              setInspectionType("");
              setInspectionLocation("");
              setInspectionDate("");
              setInspectionNotes("");
              setInspectionPhotos([]);
            }}>
              Cancel
            </Button>
            <Button onClick={handleConductInspection}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Save Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Utility Reading Dialog */}
      <Dialog open={addReadingOpen} onOpenChange={setAddReadingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Utility Reading</DialogTitle>
            <DialogDescription>
              Record meter readings for utilities
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reading-type">Utility Type *</Label>
                <Select value={readingType} onValueChange={setReadingType}>
                  <SelectTrigger id="reading-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Water">Water</SelectItem>
                    <SelectItem value="Electricity">Electricity</SelectItem>
                    <SelectItem value="Gas">Gas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reading-location">Location *</Label>
                <Input
                  id="reading-location"
                  placeholder="Unit number"
                  value={readingLocation}
                  onChange={(e) => setReadingLocation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reading-value">Meter Reading *</Label>
              <Input
                id="reading-value"
                type="number"
                placeholder="Enter reading value"
                value={readingValue}
                onChange={(e) => setReadingValue(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="reading-date">Reading Date *</Label>
              <Input
                id="reading-date"
                type="date"
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddReadingOpen(false);
              setReadingType("");
              setReadingLocation("");
              setReadingValue("");
              setReadingDate("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddReading}>
              <Zap className="h-4 w-4 mr-2" />
              Save Reading
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Incident Dialog */}
      <Dialog open={reportIncidentOpen} onOpenChange={setReportIncidentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Incident</DialogTitle>
            <DialogDescription>
              Report emergencies, violations, or complaints
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="incident-type">Incident Type *</Label>
                <Select value={incidentType} onValueChange={setIncidentType}>
                  <SelectTrigger id="incident-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Policy Violation">Policy Violation</SelectItem>
                    <SelectItem value="Complaint">Complaint</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="incident-severity">Severity *</Label>
                <Select value={incidentSeverity} onValueChange={setIncidentSeverity}>
                  <SelectTrigger id="incident-severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="incident-title">Incident Title *</Label>
              <Input
                id="incident-title"
                placeholder="Brief description of the incident"
                value={incidentTitle}
                onChange={(e) => setIncidentTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="incident-location">Location *</Label>
              <Input
                id="incident-location"
                placeholder="Unit number or area"
                value={incidentLocation}
                onChange={(e) => setIncidentLocation(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="incident-description">Description *</Label>
              <Textarea
                id="incident-description"
                placeholder="Provide detailed information about the incident..."
                rows={4}
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="incident-evidence">Upload Evidence (Photos/Videos)</Label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                <p className="text-sm text-neutral-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-neutral-500">
                  PNG, JPG, MP4 up to 10MB
                </p>
                <Input
                  id="incident-evidence"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setIncidentEvidence(Array.from(e.target.files));
                    }
                  }}
                  className="mt-3"
                />
              </div>
              
              {/* Evidence Preview */}
              {incidentEvidence.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {incidentEvidence.map((file, index) => (
                    <div key={index} className="relative group">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-full h-24 bg-neutral-100 rounded border flex items-center justify-center">
                          <Camera className="h-8 w-8 text-neutral-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setIncidentEvidence(incidentEvidence.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-neutral-600 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setReportIncidentOpen(false);
              setIncidentType("");
              setIncidentSeverity("");
              setIncidentTitle("");
              setIncidentLocation("");
              setIncidentDescription("");
              setIncidentEvidence([]);
            }}>
              Cancel
            </Button>
            <Button onClick={handleReportIncident} className="bg-red-600 hover:bg-red-700 text-white">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}