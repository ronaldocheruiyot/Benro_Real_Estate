import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tenant } from "./TenantsPage";
import { Eye, FileUp, Trash2, Upload } from "lucide-react";
import { FilePreviewDialog, isImagePath } from "./FilePreviewDialog";
import { toast } from "sonner";

export type NewTenantPayload = Omit<Tenant, "id"> & {
  documents?: File[];
};

interface AddTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (tenant: NewTenantPayload) => void | Promise<void>;
}

export function AddTenantDialog({ open, onOpenChange, onAdd }: AddTenantDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [deposit, setDeposit] = useState("");
  const [firstMonthPay, setFirstMonthPay] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [localPreview, setLocalPreview] = useState<{ title: string; url: string; mimeType?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const urls = documents.map((f) =>
      f.type.startsWith("image/") || isImagePath(f.name, f.type) ? URL.createObjectURL(f) : ""
    );
    setPreviewUrls(urls);
    return () => {
      urls.forEach((u) => u && URL.revokeObjectURL(u));
    };
  }, [documents]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setUnit("");
    setRentAmount("");
    setIdNumber("");
    setDeposit("");
    setFirstMonthPay("");
    setJoiningDate("");
    setDocuments([]);
    setLocalPreview(null);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setDocuments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !unit || !rentAmount || !joiningDate || !idNumber) {
      toast.error("Please fill in all required fields (including ID number)");
      return;
    }

    const rent = parseFloat(rentAmount) || 0;
    const depositAmt = parseFloat(deposit) || 0;
    const firstMonth = parseFloat(firstMonthPay) || 0;
    let paymentStatus: Tenant["paymentStatus"] = "unpaid";
    if (firstMonth >= rent && rent > 0) paymentStatus = "paid";
    else if (firstMonth > 0) paymentStatus = "partial";

    const newTenant: NewTenantPayload = {
      name,
      email,
      phone,
      unit,
      rentAmount: rent,
      paymentStatus,
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
      joiningDate,
      status: "active",
      idNumber: idNumber.trim(),
      birthDate: "",
      deposit: depositAmt,
      firstMonthPay: firstMonth,
      documents,
    };

    setSubmitting(true);
    try {
      await onAdd(newTenant);
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to add tenant");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Tenant</DialogTitle>
          <DialogDescription>
            Capture tenant details, deposit, first-month payment, and ID documents
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number *</Label>
                <Input
                  id="idNumber"
                  placeholder="National ID / Passport"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit Number *</Label>
                <Input
                  id="unit"
                  placeholder="e.g., Unit 4B"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rent">Monthly Rent *</Label>
                <Input
                  id="rent"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="2500"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deposit">Security Deposit</Label>
                <Input
                  id="deposit"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 5000"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstMonthPay">First Month Pay</Label>
                <Input
                  id="firstMonthPay"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 2500"
                  value={firstMonthPay}
                  onChange={(e) => setFirstMonthPay(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joining-date">Joining Date *</Label>
              <Input
                id="joining-date"
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant-docs">Documents & Images</Label>
              <div className="rounded-lg border border-dashed border-brand-navy/20 bg-brand-cyan-soft/40 p-4">
                <label
                  htmlFor="tenant-docs"
                  className="flex cursor-pointer flex-col items-center gap-2 text-center text-sm text-brand-navy/80"
                >
                  <Upload className="size-6 text-brand-cyan" />
                  <span>Upload ID photos, scans, or documents</span>
                  <span className="text-xs text-muted-foreground">
                    Images (JPG, PNG, WEBP) or files (PDF, DOC) — multiple allowed
                  </span>
                </label>
                <Input
                  id="tenant-docs"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={handleFiles}
                />
              </div>
              {documents.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {documents.map((file, index) => {
                    const thumb = previewUrls[index];
                    const image = !!thumb;
                    return (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {image ? (
                            <img
                              src={thumb}
                              alt=""
                              className="size-10 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <FileUp className="size-4 shrink-0 text-brand-cyan" />
                          )}
                          <span className="truncate">{file.name}</span>
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => {
                              const url = thumb || URL.createObjectURL(file);
                              setLocalPreview({
                                title: file.name,
                                url,
                                mimeType: file.type,
                              });
                            }}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-red-600"
                            onClick={() => removeFile(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-brand-navy text-white hover:bg-brand-navy-deep"
            >
              {submitting ? "Saving…" : "Add Tenant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      {localPreview && (
        <FilePreviewDialog
          open={!!localPreview}
          onOpenChange={(open) => !open && setLocalPreview(null)}
          title={localPreview.title}
          fileUrl={localPreview.url}
          mimeType={localPreview.mimeType}
        />
      )}
    </Dialog>
  );
}
