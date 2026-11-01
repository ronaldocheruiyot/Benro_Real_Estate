import { useEffect, useState } from "react";
import { Navigation } from "./Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Search,
  Filter,
  File,
  Image,
  FileCheck,
  AlertCircle,
  Home,
  Users,
  Folder
} from "lucide-react";
import { UserAccount } from "../types/roles";
import { Apartment } from "./ApartmentCard";
import { Tenant } from "./TenantsPage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { documentsApi, uploadsApi } from "../api/services";
import { assetUrl } from "../api/client";
import { FilePreviewDialog } from "./FilePreviewDialog";

type DocumentType = "lease" | "ownership" | "permit" | "identification" | "other";
type DocumentCategory = "property" | "tenant" | "general";

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  relatedTo?: string; // Property ID or Tenant ID
  relatedName?: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  fileUrl?: string;
  mimeType?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
}

interface DocumentsManagementPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser: UserAccount;
  apartments: Apartment[];
  tenants: Tenant[];
}

export function DocumentsManagementPage({ 
  onLogout, 
  onNavigate,
  currentUser,
  apartments,
  tenants
}: DocumentsManagementPageProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<DocumentType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | "all">("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // Form state for upload
  const [uploadForm, setUploadForm] = useState({
    name: "",
    type: "lease" as DocumentType,
    category: "property" as DocumentCategory,
    relatedTo: "",
  });

  const canUpload = (currentUser as any).permissions?.uploadDocuments !== false
    || (currentUser as any).permissions?.manageTenants !== false
    || (currentUser as any).role === "admin"
    || (currentUser as any).role === "administrator";

  const reloadDocs = async () => {
    try {
      const rows = await documentsApi.list();
      setDocuments(
        rows.map((raw: any) => ({
          id: raw.id,
          name: raw.name,
          type: (raw.category === "id" ? "identification" : raw.category) as DocumentType,
          category: raw.tenantId ? "tenant" : raw.apartmentId ? "property" : "general",
          relatedTo: raw.tenantId || raw.apartmentId,
          relatedName:
            tenants.find((t) => t.id === raw.tenantId)?.name ||
            apartments.find((a) => a.id === raw.apartmentId)?.name,
          uploadedBy: currentUser.name,
          uploadDate: raw.createdAt ? String(raw.createdAt).slice(0, 10) : "",
          size: raw.size ? `${Math.round(raw.size / 1024)} KB` : "",
          fileUrl: assetUrl(raw.fileUrl),
          mimeType: raw.mimeType,
          approvalStatus: raw.status,
        }))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to load documents");
    }
  };

  useEffect(() => {
    if (canUpload) reloadDocs();
  }, []);

  if (!canUpload) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation 
          onLogout={onLogout} 
          onNavigate={onNavigate} 
          currentView="documents"
          currentUser={currentUser}
        />
        <div className="p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl mb-2">Access Denied</h2>
              <p className="text-neutral-600">You don't have permission to manage documents.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleUpload = async () => {
    if (!uploadForm.name) {
      toast.error("Please provide a document name");
      return;
    }

    try {
      let fileUrl = "";
      let fileName = "";
      let mimeType = "";
      let size = 0;
      if (selectedFile) {
        const uploaded = await uploadsApi.file("documents", selectedFile);
        fileUrl = uploaded.url;
        fileName = uploaded.fileName;
        mimeType = uploaded.mimeType;
        size = uploaded.size;
      } else {
        fileUrl = `/uploads/documents/placeholder-${Date.now()}.txt`;
        fileName = `${uploadForm.name}.txt`;
      }

      const categoryMap: Record<DocumentType, string> = {
        lease: "lease",
        ownership: "ownership",
        permit: "permit",
        identification: "id",
        other: "other",
      };

      await documentsApi.createJson({
        name: uploadForm.name,
        category: categoryMap[uploadForm.type],
        fileUrl,
        fileName,
        mimeType,
        size,
        apartmentId: uploadForm.category === "property" ? uploadForm.relatedTo || undefined : undefined,
        tenantId: uploadForm.category === "tenant" ? uploadForm.relatedTo || undefined : undefined,
        status: "pending",
      });

      await reloadDocs();
      toast.success("Document uploaded successfully", {
        description: "Awaiting manager approval"
      });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadForm({
        name: "",
        type: "lease",
        category: "property",
        relatedTo: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await documentsApi.remove(id);
      await reloadDocs();
      toast.success("Document deleted");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.relatedName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || doc.type === filterType;
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case "lease":
        return <FileCheck className="h-4 w-4 text-blue-500" />;
      case "ownership":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "permit":
        return <File className="h-4 w-4 text-green-500" />;
      case "identification":
        return <Image className="h-4 w-4 text-orange-500" />;
      default:
        return <File className="h-4 w-4 text-neutral-500" />;
    }
  };

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case "property":
        return <Home className="h-3 w-3" />;
      case "tenant":
        return <Users className="h-3 w-3" />;
      default:
        return <Folder className="h-3 w-3" />;
    }
  };

  const getStatusBadge = (status?: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-neutral-100 text-neutral-700 border-neutral-200">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation 
        onLogout={onLogout} 
        onNavigate={onNavigate} 
        currentView="documents"
        currentUser={currentUser}
      />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-neutral-900 mb-2">Documents Management</h1>
            <p className="text-neutral-600">
              Upload and manage leases, ownership documents, permits, and tenant identification
            </p>
          </div>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-navy text-white hover:bg-brand-navy-deep">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>
                  Upload leases, permits, ownership docs, or tenant IDs
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="docName">Document Name *</Label>
                  <Input
                    id="docName"
                    placeholder="e.g., Lease Agreement - Unit 101"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="docType">Document Type *</Label>
                  <Select 
                    value={uploadForm.type}
                    onValueChange={(value) => setUploadForm({...uploadForm, type: value as DocumentType})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lease">Lease Agreement</SelectItem>
                      <SelectItem value="ownership">Ownership Document</SelectItem>
                      <SelectItem value="permit">Building Permit</SelectItem>
                      <SelectItem value="identification">Tenant ID</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="docCategory">Category *</Label>
                  <Select 
                    value={uploadForm.category}
                    onValueChange={(value) => setUploadForm({...uploadForm, category: value as DocumentCategory, relatedTo: ""})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {uploadForm.category === "property" && (
                  <div>
                    <Label htmlFor="relatedProperty">Related Property</Label>
                    <Select 
                      value={uploadForm.relatedTo}
                      onValueChange={(value) => setUploadForm({...uploadForm, relatedTo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
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
                )}

                {uploadForm.category === "tenant" && (
                  <div>
                    <Label htmlFor="relatedTenant">Related Tenant</Label>
                    <Select 
                      value={uploadForm.relatedTo}
                      onValueChange={(value) => setUploadForm({...uploadForm, relatedTo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="file">Upload Document or Image *</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,.txt"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Accepted: images (JPG, PNG, WEBP, GIF) or documents (PDF, DOC). Max 15MB.
                  </p>
                </div>

                <Button 
                  className="w-full bg-brand-navy text-white hover:bg-brand-navy-deep"
                  onClick={handleUpload}
                >
                  Upload Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="text-2xl">{documents.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Leases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-purple-500" />
                <span className="text-2xl">{documents.filter(d => d.type === "lease").length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl">{documents.filter(d => d.approvalStatus === "pending").length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Tenant IDs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5 text-orange-500" />
                <span className="text-2xl">{documents.filter(d => d.type === "identification").length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">Search Documents</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or related item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="filterType">Filter by Type</Label>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as DocumentType | "all")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="lease">Lease</SelectItem>
                    <SelectItem value="ownership">Ownership</SelectItem>
                    <SelectItem value="permit">Permit</SelectItem>
                    <SelectItem value="identification">ID</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filterCategory">Filter by Category</Label>
                <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as DocumentCategory | "all")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardContent className="p-0">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600">No documents found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Related To</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDocumentIcon(doc.type)}
                          <span>{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{doc.type}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {getCategoryIcon(doc.category)}
                          <span className="capitalize">{doc.category}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.relatedName || "-"}</TableCell>
                      <TableCell>{doc.uploadedBy}</TableCell>
                      <TableCell>{doc.uploadDate}</TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>{getStatusBadge(doc.approvalStatus)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Preview"
                            disabled={!doc.fileUrl}
                            onClick={() => setPreviewDoc(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" asChild disabled={!doc.fileUrl}>
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" download title="Download">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {previewDoc?.fileUrl && (
        <FilePreviewDialog
          open={!!previewDoc}
          onOpenChange={(open) => !open && setPreviewDoc(null)}
          title={previewDoc.name}
          fileUrl={previewDoc.fileUrl}
          mimeType={previewDoc.mimeType}
        />
      )}
    </div>
  );
}
