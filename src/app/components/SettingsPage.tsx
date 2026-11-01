import { useEffect, useRef, useState } from "react";
import { Navigation } from "./Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { UserRole } from "./UserManagementPage";
import { companySettingsApi, uploadsApi, type CompanySettings } from "../api/services";
import { assetUrl } from "../api/client";
import { toast } from "sonner";
import { Upload, Building2, Eye } from "lucide-react";
import { InvoiceTemplatePreview } from "./InvoiceTemplatePreview";
import { openInvoicePrint } from "../utils/invoicePrint";
import type { InvoiceRecord } from "../api/services";

interface SettingsPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser?: UserRole;
}

const emptyCompany: CompanySettings = {
  companyName: "",
  logoUrl: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  website: "",
  taxId: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  bankBranch: "",
  paymentInstructions: "",
  invoicePrefix: "INV",
  currency: "KES",
  currencySymbol: "KSh",
  invoiceTemplateUrl: "",
};

export function SettingsPage({ onLogout, onNavigate, currentUser }: SettingsPageProps) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [company, setCompany] = useState<CompanySettings>(emptyCompany);
  const [savingCompany, setSavingCompany] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);

  const canEditCompany =
    currentUser?.role === "admin" || currentUser?.role === "manager";

  useEffect(() => {
    companySettingsApi
      .get()
      .then(setCompany)
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF draft invoice");
      return;
    }
    setUploadingTemplate(true);
    try {
      const uploaded = await uploadsApi.file("documents", file);
      setCompany((prev) => ({ ...prev, invoiceTemplateUrl: uploaded.url }));
      toast.success("Draft invoice uploaded — save to apply");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload template");
    } finally {
      setUploadingTemplate(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setUploadingLogo(true);
    try {
      const uploaded = await uploadsApi.file("avatars", file);
      setCompany((prev) => ({ ...prev, logoUrl: uploaded.url }));
      toast.success("Logo uploaded — save to apply");
    } catch (err: any) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompany((prev) => ({ ...prev, logoUrl: reader.result as string }));
        toast.message("Logo set locally — save to store");
      };
      reader.readAsDataURL(file);
      if (err?.message) toast.error(err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const saveCompany = async () => {
    if (!canEditCompany) {
      toast.error("Only admin or manager can update company branding");
      return;
    }
    if (!company.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    setSavingCompany(true);
    try {
      const saved = await companySettingsApi.update(company);
      setCompany(saved);
      toast.success("Company branding saved", {
        description: "Logo and address will appear on invoices",
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to save");
    } finally {
      setSavingCompany(false);
    }
  };

  return (
    <div className="size-full flex flex-col bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="settings" currentUser={currentUser} />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl">Settings</h1>
            <p className="mt-1 text-sm text-neutral-600 sm:text-base">
              Manage account preferences and company invoice branding
            </p>
          </div>

          <Tabs defaultValue="company" className="w-full">
            <TabsList className="mb-6 flex h-auto w-full flex-wrap gap-1">
              <TabsTrigger value="company">Company / Invoices</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-6">
              <InvoiceTemplatePreview company={company} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="size-5 text-brand-cyan" />
                    Company Branding for Invoices
                  </CardTitle>
                  <CardDescription>
                    Fill these details to match the preview above. Customer ID on invoices is
                    the tenant’s unit number. Uploaded draft PDFs keep branding; old filled
                    text is ignored.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-neutral-50">
                      {company.logoUrl ? (
                        <img
                          src={assetUrl(company.logoUrl)}
                          alt="Company logo"
                          className="size-full object-contain p-2"
                        />
                      ) : (
                        <span className="px-2 text-center text-xs text-muted-foreground">
                          No logo
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Company Logo</Label>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        disabled={!canEditCompany || uploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="size-4" />
                        {uploadingLogo ? "Uploading…" : "Upload Logo"}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        PNG or JPG recommended. Shown at the top of every invoice.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg border border-dashed border-brand-navy/20 bg-brand-cyan-soft/30 p-4">
                    <Label>Draft invoice template (PDF)</Label>
                    <p className="text-sm text-muted-foreground">
                      Upload a blank draft or an already-filled sample PDF (like your AMON invoice).
                      The system keeps the top branding/logo look, ignores old details on that file, and
                      fills invoice number, customer ID (unit), tenant, dates, and amounts.
                    </p>
                    <input
                      ref={templateInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={handleTemplateUpload}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        disabled={!canEditCompany || uploadingTemplate}
                        onClick={() => templateInputRef.current?.click()}
                      >
                        <Upload className="size-4" />
                        {uploadingTemplate ? "Uploading…" : "Upload Draft Invoice PDF"}
                      </Button>
                      {company.invoiceTemplateUrl && (
                        <a
                          href={assetUrl(company.invoiceTemplateUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-brand-navy underline"
                        >
                          View current template
                        </a>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={company.companyName}
                        disabled={!canEditCompany}
                        onChange={(e) =>
                          setCompany((p) => ({ ...p, companyName: e.target.value }))
                        }
                        placeholder="e.g. AMON Properties Ltd"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address1">Address line 1</Label>
                      <Input
                        id="address1"
                        value={company.addressLine1}
                        disabled={!canEditCompany}
                        onChange={(e) =>
                          setCompany((p) => ({ ...p, addressLine1: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address2">Address line 2</Label>
                      <Input
                        id="address2"
                        value={company.addressLine2}
                        disabled={!canEditCompany}
                        onChange={(e) =>
                          setCompany((p) => ({ ...p, addressLine2: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={company.city}
                        disabled={!canEditCompany}
                        onChange={(e) => setCompany((p) => ({ ...p, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={company.country}
                        disabled={!canEditCompany}
                        onChange={(e) =>
                          setCompany((p) => ({ ...p, country: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cphone">Phone</Label>
                      <Input
                        id="cphone"
                        value={company.phone}
                        disabled={!canEditCompany}
                        onChange={(e) => setCompany((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cemail">Email</Label>
                      <Input
                        id="cemail"
                        type="email"
                        value={company.email}
                        disabled={!canEditCompany}
                        onChange={(e) => setCompany((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax / PIN</Label>
                      <Input
                        id="taxId"
                        value={company.taxId}
                        disabled={!canEditCompany}
                        onChange={(e) => setCompany((p) => ({ ...p, taxId: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoicePrefix">Invoice number prefix</Label>
                      <Input
                        id="invoicePrefix"
                        value={company.invoicePrefix}
                        disabled={!canEditCompany}
                        onChange={(e) =>
                          setCompany((p) => ({ ...p, invoicePrefix: e.target.value }))
                        }
                        placeholder="INV or AMON"
                      />
                      <p className="text-xs text-muted-foreground">
                        Numbers look like PREFIX-YYYYMM-0001
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currencySymbol">Currency symbol</Label>
                      <Input
                        id="currencySymbol"
                        value={company.currencySymbol}
                        disabled={!canEditCompany}
                        onChange={(e) =>
                          setCompany((p) => ({ ...p, currencySymbol: e.target.value }))
                        }
                        placeholder="KSh"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank name</Label>
                      <Input
                        id="bankName"
                        value={company.bankName}
                        disabled={!canEditCompany}
                        onChange={(e) =>
                          setCompany((p) => ({ ...p, bankName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankBranch">Branch</Label>
                      <Input
                        id="bankBranch"
                        value={company.bankBranch}
                        disabled={!canEditCompany}
                        onChange={(e) =>
                          setCompany((p) => ({ ...p, bankBranch: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankAccountName">Account name</Label>
                      <Input
                        id="bankAccountName"
                        value={company.bankAccountName}
                        disabled={!canEditCompany}
                        onChange={(e) =>
                          setCompany((p) => ({ ...p, bankAccountName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankAccountNumber">Account number</Label>
                      <Input
                        id="bankAccountNumber"
                        value={company.bankAccountNumber}
                        disabled={!canEditCompany}
                        onChange={(e) =>
                          setCompany((p) => ({ ...p, bankAccountNumber: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="payInstr">Payment instructions</Label>
                      <Textarea
                        id="payInstr"
                        rows={3}
                        value={company.paymentInstructions}
                        disabled={!canEditCompany}
                        onChange={(e) =>
                          setCompany((p) => ({
                            ...p,
                            paymentInstructions: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {canEditCompany ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="bg-brand-navy text-white hover:bg-brand-navy-deep"
                        onClick={saveCompany}
                        disabled={savingCompany}
                      >
                        {savingCompany ? "Saving…" : "Save Company Details"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          const sample: InvoiceRecord = {
                            id: "preview",
                            invoiceNumber: `${(company.invoicePrefix || "INV").toUpperCase()}-202611-0001`,
                            customerId: "Unit 850",
                            tenantId: "preview",
                            tenantName: "Sample Tenant",
                            tenantEmail: "tenant@example.com",
                            tenantPhone: "+254700000000",
                            unit: "Unit 850",
                            periodLabel: "Nov 2026",
                            issueDate: new Date().toISOString().slice(0, 10),
                            dueDate: "",
                            items: [
                              {
                                description: "Monthly Rent",
                                quantity: 1,
                                unitPrice: 8500,
                                amount: 8500,
                              },
                              {
                                description: "Water charge",
                                quantity: 12,
                                unitPrice: 50,
                                amount: 600,
                              },
                            ],
                            subtotal: 9100,
                            total: 9100,
                            currency: company.currency || "KES",
                            status: "draft",
                          };
                          openInvoicePrint(sample, company);
                        }}
                      >
                        <Eye className="size-4" />
                        Full-page preview
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onNavigate("payments")}
                      >
                        Go to Invoices
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Only admins and managers can edit company branding.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Update your general preferences and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="sw">Swahili</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="eat">
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <Button className="bg-brand-navy text-white hover:bg-brand-navy-deep">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notif">Email Notifications</Label>
                      <p className="text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notif"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notif">Push Notifications</Label>
                      <p className="text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      id="push-notif"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance">Maintenance Alerts</Label>
                      <p className="text-muted-foreground">
                        Get notified about maintenance requests
                      </p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={maintenanceAlerts}
                      onCheckedChange={setMaintenanceAlerts}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="payment">Payment Reminders</Label>
                      <p className="text-muted-foreground">
                        Receive reminders about upcoming payments
                      </p>
                    </div>
                    <Switch
                      id="payment"
                      checked={paymentReminders}
                      onCheckedChange={setPaymentReminders}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button className="bg-brand-navy text-white hover:bg-brand-navy-deep">
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
