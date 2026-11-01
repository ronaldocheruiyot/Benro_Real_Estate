import { useEffect, useMemo, useState } from "react";
import { Navigation } from "./Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  DollarSign,
  Plus,
  AlertCircle,
  TrendingUp,
  Receipt,
  FileText,
  Eye,
  Mail,
  Send,
  Trash2,
  Search,
  Download,
  MessageCircle,
} from "lucide-react";
import { UserAccount } from "../types/roles";
import { Apartment } from "./ApartmentCard";
import { Tenant, Payment } from "./TenantsPage";
import { AddPaymentDialog } from "./AddPaymentDialog";
import { GenerateInvoicesDialog } from "./GenerateInvoicesDialog";
import {
  companySettingsApi,
  invoicesApi,
  type CompanySettings,
  type InvoiceRecord,
} from "../api/services";
import {
  downloadFilledTemplatePdf,
  emailInvoice,
  emailInvoicesBulk,
  openInvoicePrint,
  whatsappInvoiceUrl,
} from "../utils/invoicePrint";
import { toast } from "sonner";

interface PaymentsManagementPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser: UserAccount;
  apartments: Apartment[];
  tenants: Tenant[];
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
}

export function PaymentsManagementPage({
  onLogout,
  onNavigate,
  currentUser,
  apartments,
  tenants,
  payments,
  setPayments,
}: PaymentsManagementPageProps) {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const perms = (currentUser as any).permissions || {};
  const canManage =
    perms.recordPayments === true ||
    perms.managePayments === true ||
    perms.generateInvoices === true ||
    perms.viewReports === true ||
    currentUser.role === "admin" ||
    currentUser.role === "accountant" ||
    currentUser.role === "manager" ||
    currentUser.role === "administrator";

  const load = async () => {
    setLoading(true);
    try {
      const [inv, settings] = await Promise.all([
        invoicesApi.list(),
        companySettingsApi.get(),
      ]);
      setInvoices(inv);
      setCompany(settings);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) load();
  }, []);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const thisMonth = new Date().getMonth();
  const monthlyRevenue = payments
    .filter((p) => new Date(p.date).getMonth() === thisMonth)
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingInvoices = invoices.filter(
    (i) => i.status === "draft" || i.status === "sent" || i.status === "overdue"
  ).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.tenantName.toLowerCase().includes(q) ||
        i.customerId.toLowerCase().includes(q) ||
        i.unit.toLowerCase().includes(q)
    );
  }, [invoices, search]);

  const handlePreview = (invoice: InvoiceRecord) => {
    if (!company) {
      toast.error("Load company branding in Settings first");
      return;
    }
    openInvoicePrint(invoice, company);
  };

  const markSentIfNeeded = async (invoice: InvoiceRecord) => {
    if (invoice.status !== "draft") return invoice;
    const updated = await invoicesApi.send(invoice.id);
    setInvoices((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    return updated;
  };

  const handleEmail = async (invoice: InvoiceRecord) => {
    if (!company) return;
    if (!invoice.tenantEmail) {
      toast.error("Tenant has no email on file — use WhatsApp or print PDF instead");
      return;
    }
    try {
      await markSentIfNeeded(invoice);
      emailInvoice(invoice, company);
      toast.success("Email app opened with the invoice details");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send");
    }
  };

  const handleWhatsApp = async (invoice: InvoiceRecord) => {
    if (!company) return;
    try {
      await markSentIfNeeded(invoice);
      window.open(whatsappInvoiceUrl(invoice, company), "_blank");
      toast.success("WhatsApp opened with invoice message");
    } catch (err: any) {
      toast.error(err?.message || "Failed");
    }
  };

  const handleDownloadFilled = async (invoice: InvoiceRecord) => {
    try {
      await downloadFilledTemplatePdf(invoice);
      toast.success("Filled draft PDF downloaded");
    } catch (err: any) {
      toast.error(err?.message || "Upload a draft invoice PDF in Settings first");
    }
  };

  const handleEmailAllVisible = async () => {
    if (!company) return;
    const targets = filtered.filter((i) => i.tenantEmail);
    if (!targets.length) {
      toast.error("No invoices with tenant emails in this list");
      return;
    }
    try {
      const drafts = targets.filter((i) => i.status === "draft");
      if (drafts.length) await invoicesApi.sendBulk(drafts.map((d) => d.id));
      emailInvoicesBulk(targets, company);
      await load();
      toast.success(`Opened email to ${targets.length} tenant(s) (BCC)`);
    } catch (err: any) {
      toast.error(err?.message || "Failed");
    }
  };

  const handleMarkSent = async (invoice: InvoiceRecord) => {
    try {
      const updated = await invoicesApi.send(invoice.id);
      setInvoices((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      toast.success("Marked as sent");
    } catch (err: any) {
      toast.error(err?.message || "Failed");
    }
  };

  const handleDelete = async (invoice: InvoiceRecord) => {
    if (!confirm(`Delete invoice ${invoice.invoiceNumber}?`)) return;
    try {
      await invoicesApi.remove(invoice.id);
      setInvoices((prev) => prev.filter((i) => i.id !== invoice.id));
      toast.success("Invoice deleted");
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    }
  };

  const sendAllDrafts = async () => {
    const drafts = invoices.filter((i) => i.status === "draft");
    if (!drafts.length) {
      toast.message("No draft invoices");
      return;
    }
    try {
      await invoicesApi.sendBulk(drafts.map((d) => d.id));
      await load();
      toast.success(`Marked ${drafts.length} invoice(s) as sent`);
    } catch (err: any) {
      toast.error(err?.message || "Failed");
    }
  };

  if (!canManage) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation
          onLogout={onLogout}
          onNavigate={onNavigate}
          currentView="payments"
          currentUser={currentUser}
        />
        <div className="p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h2 className="mb-2 text-xl">Access Denied</h2>
              <p className="text-neutral-600">
                You don't have permission to access payment management.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentView="payments"
        currentUser={currentUser}
      />

      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl text-neutral-900 sm:text-2xl">Payment & Invoices</h1>
            <p className="mt-1 text-sm text-neutral-600 sm:text-base">
              Record payments and send rent, water, or charge invoices. Customer ID = unit
              number.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
            <Button
              variant="outline"
              className="w-full justify-center gap-2 sm:w-auto"
              onClick={() => onNavigate("settings")}
            >
              Company Logo & Address
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center gap-2 sm:w-auto"
              onClick={() => setIsGenerateOpen(true)}
            >
              <FileText className="h-4 w-4" />
              Generate Invoices
            </Button>
            <Button
              onClick={() => setIsAddPaymentOpen(true)}
              className="w-full justify-center gap-2 bg-brand-navy text-white hover:bg-brand-navy-deep sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </div>
        </div>

        <Card className="mb-6 border-brand-cyan/30 bg-brand-cyan-soft/40">
          <CardContent className="space-y-2 py-4 text-sm text-brand-navy">
            <p className="font-medium">How invoicing works</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                In <strong>Settings → Company / Invoices</strong>, upload your logo/address and
                (optional) your blank <strong>draft invoice PDF</strong> — like the sample you shared.
              </li>
              <li>
                Click <strong>Generate Invoices</strong> — the system fills invoice number, customer
                ID (unit), amounts, and dates for each tenant.
              </li>
              <li>
                <strong>Send</strong> with Email, WhatsApp, Print, or Download filled PDF (uses your
                draft template when uploaded).
              </li>
            </ol>
            {!company?.invoiceTemplateUrl && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-brand-navy/20 bg-white"
                onClick={() => onNavigate("settings")}
              >
                Upload draft invoice template
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-500" />
                <span className="text-2xl">{payments.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-2xl">${totalRevenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="text-2xl">${monthlyRevenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Open Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span className="text-2xl">{pendingInvoices}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Invoices</CardTitle>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  className="pl-9"
                  placeholder="Search invoice #, tenant, unit…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleEmailAllVisible} className="gap-2">
                <Mail className="size-4" />
                Email all (BCC)
              </Button>
              <Button variant="outline" onClick={sendAllDrafts} className="gap-2">
                <Send className="size-4" />
                Mark drafts sent
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-10 text-center text-muted-foreground">Loading invoices…</p>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-neutral-600">
                <FileText className="mx-auto mb-3 size-10 text-neutral-400" />
                <p>No invoices yet.</p>
                <p className="mt-1 text-sm">
                  Use <strong>Generate Invoices</strong> to bill rent, water, or other
                  charges for all tenants.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {filtered.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{inv.invoiceNumber}</p>
                        <Badge
                          variant={inv.status === "paid" ? "default" : "secondary"}
                          className={
                            inv.status === "sent"
                              ? "bg-brand-cyan-soft text-brand-navy"
                              : inv.status === "draft"
                                ? ""
                                : inv.status === "paid"
                                  ? "bg-green-600"
                                  : ""
                          }
                        >
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {inv.tenantName} · Customer ID (Unit):{" "}
                        <span className="font-medium text-foreground">{inv.customerId}</span>
                        {inv.periodLabel ? ` · ${inv.periodLabel}` : ""}
                      </p>
                      <p className="text-sm">
                        {inv.currency || "KES"} {Number(inv.total).toLocaleString()} ·{" "}
                        {inv.issueDate}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Preview / print branded invoice"
                        onClick={() => handlePreview(inv)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Download filled draft PDF"
                        onClick={() => handleDownloadFilled(inv)}
                      >
                        <Download className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Email tenant"
                        onClick={() => handleEmail(inv)}
                      >
                        <Mail className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="WhatsApp tenant"
                        onClick={() => handleWhatsApp(inv)}
                      >
                        <MessageCircle className="size-4" />
                      </Button>
                      {inv.status === "draft" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Mark sent"
                          onClick={() => handleMarkSent(inv)}
                        >
                          <Send className="size-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() => handleDelete(inv)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="py-8 text-center text-neutral-600">No payments recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {payments.slice(0, 10).map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{p.tenantName}</p>
                      <p className="text-muted-foreground">
                        {p.unit} · {p.date} · {p.method}
                      </p>
                    </div>
                    <p className="font-medium">${Number(p.amount).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {isAddPaymentOpen && (
        <AddPaymentDialog
          isOpen={isAddPaymentOpen}
          onClose={() => setIsAddPaymentOpen(false)}
          onAddPayment={(payment) => {
            setPayments([...payments, payment]);
            toast.success("Payment recorded successfully");
          }}
          tenants={tenants}
        />
      )}

      <GenerateInvoicesDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
        apartments={apartments}
        tenants={tenants}
        onDone={load}
      />
    </div>
  );
}
