import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Mail,
  Phone,
  Home,
  Calendar,
  DollarSign,
  CreditCard,
  User,
  Printer,
  UserPlus,
  Key,
  FileText,
  Upload,
  ExternalLink,
  Trash2,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import { Tenant, Payment } from "./TenantsPage";
import { useEffect, useState } from "react";
import { CreateTenantAccountDialog } from "./CreateTenantAccountDialog";
import { FilePreviewDialog, isImagePath, isPdfPath } from "./FilePreviewDialog";
import { documentsApi } from "../api/services";
import { assetUrl } from "../api/client";
import { toast } from "sonner";

interface TenantDetailDialogProps {
  tenant: Tenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payments?: Payment[];
  onUpdateTenant?: (updatedTenant: Tenant) => void;
}

type TenantDoc = {
  id: string;
  name: string;
  fileUrl: string;
  mimeType?: string;
  category?: string;
  createdAt?: string;
  size?: number;
};

export function TenantDetailDialog({
  tenant,
  open,
  onOpenChange,
  payments = [],
  onUpdateTenant,
}: TenantDetailDialogProps) {
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [docs, setDocs] = useState<TenantDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<TenantDoc | null>(null);

  const loadDocs = async () => {
    if (!tenant?.id) return;
    setLoadingDocs(true);
    try {
      const rows = await documentsApi.list({ tenantId: tenant.id });
      setDocs(
        rows.map((r: any) => ({
          id: r.id,
          name: r.name || r.fileName || "File",
          fileUrl: assetUrl(r.fileUrl),
          mimeType: r.mimeType,
          category: r.category,
          createdAt: r.createdAt,
          size: r.size,
        }))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to load documents");
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (open && tenant?.id) loadDocs();
  }, [open, tenant?.id]);

  const handleEmail = () => {
    window.location.href = `mailto:${tenant.email}`;
  };

  const handleCall = () => {
    if (tenant.phone) window.location.href = `tel:${tenant.phone}`;
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return null;
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const tenantPayments = payments.filter((p) => p.tenantId === tenant.id);
  const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0);
  const age = calculateAge(tenant.birthDate);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("name", file.name);
        fd.append("category", "id");
        fd.append("uploadFolder", "documents");
        fd.append("tenantId", tenant.id);
        if (tenant.apartmentId) fd.append("apartmentId", tenant.apartmentId);
        await documentsApi.create(fd);
      }
      await loadDocs();
      toast.success("File(s) uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      await documentsApi.remove(id);
      await loadDocs();
      toast.success("Document deleted");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handlePrintPaymentHistory = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment History - ${tenant.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f3f3f5; }
          </style>
        </head>
        <body>
          <h1>Payment History</h1>
          <p><strong>Tenant:</strong> ${tenant.name}</p>
          <p><strong>Unit:</strong> ${tenant.unit}</p>
          <p><strong>ID Number:</strong> ${tenant.idNumber || "N/A"}</p>
          <p><strong>Deposit:</strong> $${(tenant.deposit || 0).toLocaleString()}</p>
          <p><strong>First Month Pay:</strong> $${(tenant.firstMonthPay || 0).toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Amount</th><th>Method</th><th>Status</th><th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${tenantPayments
                .map(
                  (p) => `
                <tr>
                  <td>${new Date(p.date).toLocaleDateString()}</td>
                  <td>$${p.amount.toLocaleString()}</td>
                  <td>${p.method.replace("_", " ").toUpperCase()}</td>
                  <td>${p.status.toUpperCase()}</td>
                  <td>${p.notes || "N/A"}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <p><strong>Total Paid:</strong> $${totalPaid.toLocaleString()}</p>
          <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();};</script>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tenant Profile</DialogTitle>
          <DialogDescription>
            Details, payments, and documents for {tenant.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="payments">Payments ({tenantPayments.length})</TabsTrigger>
            <TabsTrigger value="documents">Documents ({docs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="size-20">
                <AvatarImage src={tenant.avatar} />
                <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="truncate">{tenant.name}</h3>
                <p className="text-muted-foreground">{tenant.unit}</p>
                <p className="text-sm text-muted-foreground">ID: {tenant.idNumber || "Not set"}</p>
              </div>
              <Badge
                variant={tenant.paymentStatus === "paid" ? "default" : "destructive"}
                className={tenant.paymentStatus === "paid" ? "bg-green-600" : ""}
              >
                {tenant.paymentStatus === "paid"
                  ? "Paid"
                  : tenant.paymentStatus === "partial"
                    ? "Partial"
                    : "Unpaid"}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4>Personal Information</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="size-5 text-brand-cyan" />
                  <div>
                    <p className="text-muted-foreground">ID Number</p>
                    <p>{tenant.idNumber || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-brand-cyan" />
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p>
                      {tenant.birthDate
                        ? `${new Date(tenant.birthDate).toLocaleDateString()}${
                            age != null ? ` (Age: ${age})` : ""
                          }`
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-brand-cyan" />
                  <div>
                    <p className="text-muted-foreground">Joining Date</p>
                    <p>
                      {tenant.joiningDate
                        ? new Date(tenant.joiningDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-brand-cyan" />
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="break-all">{tenant.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-brand-cyan" />
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p>{tenant.phone || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="size-5 text-brand-cyan" />
                  <div>
                    <p className="text-muted-foreground">Unit</p>
                    <p>{tenant.unit}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4>Payments on Move-in</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg bg-brand-cyan-soft/50 p-3">
                  <DollarSign className="size-5 text-brand-cyan" />
                  <div>
                    <p className="text-muted-foreground">Monthly Rent</p>
                    <p>${tenant.rentAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-brand-cyan-soft/50 p-3">
                  <DollarSign className="size-5 text-brand-cyan" />
                  <div>
                    <p className="text-muted-foreground">Security Deposit</p>
                    <p>${(tenant.deposit || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-brand-cyan-soft/50 p-3">
                  <DollarSign className="size-5 text-brand-cyan" />
                  <div>
                    <p className="text-muted-foreground">First Month Pay</p>
                    <p>${(tenant.firstMonthPay || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4>Account Status</h4>
              <div className="flex items-center gap-3 rounded-lg bg-neutral-50 p-4">
                {tenant.hasAccount ? (
                  <>
                    <Key className="size-5 text-green-600" />
                    <div className="flex-1">
                      <p>Login Account Active</p>
                      <p className="text-muted-foreground">Username: {tenant.username}</p>
                    </div>
                    <Badge className="bg-green-600">Active</Badge>
                  </>
                ) : (
                  <>
                    <Key className="size-5 text-neutral-400" />
                    <div className="flex-1">
                      <p>No Login Account</p>
                      <p className="text-muted-foreground">Create an account for portal access</p>
                    </div>
                    <Badge variant="secondary">Inactive</Badge>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleEmail} className="flex-1 gap-2">
                <Mail className="size-4" />
                Send Email
              </Button>
              <Button onClick={handleCall} variant="outline" className="flex-1 gap-2">
                <Phone className="size-4" />
                Call Tenant
              </Button>
              <Button
                onClick={() => setIsCreateAccountOpen(true)}
                variant="outline"
                className="flex-1 gap-2"
              >
                <UserPlus className="size-4" />
                Create Account
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-6 space-y-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4>Payment History</h4>
                <p className="text-muted-foreground">Total Paid: ${totalPaid.toLocaleString()}</p>
              </div>
              <Button onClick={handlePrintPaymentHistory} variant="outline" className="gap-2">
                <Printer className="size-4" />
                Print History
              </Button>
            </div>

            {tenantPayments.length > 0 ? (
              <div className="space-y-3">
                {tenantPayments.map((payment) => (
                  <div key={payment.id} className="rounded-lg border bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-lg p-3 ${
                            payment.method === "cash" ? "bg-green-100" : "bg-brand-cyan-soft"
                          }`}
                        >
                          <CreditCard className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium">${payment.amount.toLocaleString()}</p>
                          <p className="capitalize text-muted-foreground">
                            {payment.method.replace("_", " ")}
                          </p>
                          {payment.notes && (
                            <p className="text-sm text-muted-foreground">{payment.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p>{new Date(payment.date).toLocaleDateString()}</p>
                        <Badge
                          variant={payment.status === "claimed" ? "default" : "secondary"}
                          className={payment.status === "claimed" ? "mt-1 bg-green-600" : "mt-1"}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No payment history available
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="mt-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4>Tenant Documents</h4>
                <p className="text-sm text-muted-foreground">
                  Upload documents or images (ID photos, leases, receipts)
                </p>
              </div>
              <div>
                <Label htmlFor="detail-doc-upload" className="sr-only">
                  Upload document or image
                </Label>
                <Button asChild variant="outline" className="gap-2" disabled={uploading}>
                  <label htmlFor="detail-doc-upload" className="cursor-pointer">
                    <Upload className="size-4" />
                    {uploading ? "Uploading…" : "Upload File"}
                  </label>
                </Button>
                <Input
                  id="detail-doc-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={handleUpload}
                />
              </div>
            </div>

            {loadingDocs ? (
              <p className="py-8 text-center text-muted-foreground">Loading documents…</p>
            ) : docs.length > 0 ? (
              <ul className="space-y-2">
                {docs.map((doc) => {
                  const image = isImagePath(doc.name || doc.fileUrl, doc.mimeType);
                  const pdf = isPdfPath(doc.name || doc.fileUrl, doc.mimeType);
                  return (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-3"
                    >
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        {image ? (
                          <img
                            src={doc.fileUrl}
                            alt=""
                            className="size-12 shrink-0 rounded-md border object-cover"
                          />
                        ) : (
                          <div className="rounded-lg bg-brand-cyan-soft p-2">
                            {pdf ? (
                              <FileText className="size-4 text-brand-navy" />
                            ) : (
                              <ImageIcon className="size-4 text-brand-navy" />
                            )}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{doc.name}</p>
                          <p className="text-xs capitalize text-muted-foreground">
                            {image ? "Image" : pdf ? "PDF" : doc.category || "file"}
                            {doc.createdAt
                              ? ` · ${new Date(doc.createdAt).toLocaleDateString()}`
                              : ""}
                          </p>
                        </div>
                      </button>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Preview"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" title="Open">
                            <ExternalLink className="size-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleDeleteDoc(doc.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
                No files yet. Upload a document or image to get started.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
      <CreateTenantAccountDialog
        open={isCreateAccountOpen}
        onOpenChange={setIsCreateAccountOpen}
        tenant={tenant}
        onUpdateTenant={onUpdateTenant}
      />
      {previewDoc && (
        <FilePreviewDialog
          open={!!previewDoc}
          onOpenChange={(open) => !open && setPreviewDoc(null)}
          title={previewDoc.name}
          fileUrl={previewDoc.fileUrl}
          mimeType={previewDoc.mimeType}
        />
      )}
    </Dialog>
  );
}
