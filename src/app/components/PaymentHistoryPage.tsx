import { useState, useEffect } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  ArrowLeft, 
  Download, 
  DollarSign, 
  Calendar,
  CreditCard,
  Banknote,
  AlertCircle,
  Filter
} from "lucide-react";
import { Apartment } from "./ApartmentCard";
import { Tenant, Payment } from "./TenantsPage";
import { AddPaymentDialog } from "./AddPaymentDialog";

interface PaymentHistoryPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  apartment: Apartment;
  onBack: () => void;
  tenants: Tenant[];
  payments: Payment[];
  setPayments: (payments: Payment[] | ((prev: Payment[]) => Payment[])) => void | Promise<void>;
}

// Initial payment data
const initialPayments: Payment[] = [
  {
    id: "1",
    tenantId: "1",
    tenantName: "John Doe",
    unit: "Unit 4B",
    amount: 2500,
    date: "2024-10-01",
    method: "bank_transfer",
    status: "claimed",
    transactionId: "TXN001234567",
    notes: "Monthly rent - October",
  },
  {
    id: "2",
    tenantId: "2",
    tenantName: "Mary Jane",
    unit: "Unit 3C",
    amount: 2200,
    date: "2024-10-03",
    method: "cash",
    status: "claimed",
    notes: "Cash payment received",
  },
  {
    id: "3",
    tenantId: "1",
    tenantName: "John Doe",
    unit: "Unit 4B",
    amount: 2500,
    date: "2024-09-01",
    method: "bank_transfer",
    status: "claimed",
    transactionId: "TXN001234566",
    notes: "Monthly rent - September",
  },
  {
    id: "4",
    tenantId: "unknown",
    tenantName: "Unknown",
    unit: "Unknown",
    amount: 2800,
    date: "2024-10-05",
    method: "bank_transfer",
    status: "unclaimed",
    transactionId: "TXN001234568",
    notes: "Payment received but no matching tenant",
  },
  {
    id: "5",
    tenantId: "2",
    tenantName: "Mary Jane",
    unit: "Unit 3C",
    amount: 2200,
    date: "2024-09-05",
    method: "online",
    status: "claimed",
    transactionId: "TXN001234565",
    notes: "Online payment - September",
  },
];

export function PaymentHistoryPage({ 
  onLogout, 
  onNavigate, 
  apartment, 
  onBack,
  tenants,
  payments,
  setPayments
}: PaymentHistoryPageProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  // Initialize payments if empty
  useEffect(() => {
    if (payments.length === 0) {
      setPayments(initialPayments);
    }
  }, []);

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const paymentDate = new Date(payment.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const dateMatch = 
      (!start || paymentDate >= start) && 
      (!end || paymentDate <= end);

    const methodMatch = 
      filterMethod === "all" || payment.method === filterMethod;

    return dateMatch && methodMatch;
  });

  const unclaimedPayments = filteredPayments.filter(p => p.status === "unclaimed");
  const cashPayments = filteredPayments.filter(p => p.method === "cash");
  const bankTransfers = filteredPayments.filter(p => p.method === "bank_transfer");

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalCash = cashPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalUnclaimed = unclaimedPayments.reduce((sum, p) => sum + p.amount, 0);

  const handleExportExcel = () => {
    // Create CSV content
    const headers = ["Date", "Tenant", "Unit", "Amount", "Method", "Status", "Transaction ID", "Notes"];
    const rows = filteredPayments.map(p => [
      new Date(p.date).toLocaleDateString(),
      p.tenantName,
      p.unit,
      `$${p.amount}`,
      p.method.replace("_", " ").toUpperCase(),
      p.status.toUpperCase(),
      p.transactionId || "N/A",
      p.notes || "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `payment_history_${apartment.name}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddPayment = (paymentData: Omit<Payment, "id">) => {
    const newPayment: Payment = {
      id: Date.now().toString(),
      ...paymentData,
    };
    setPayments([newPayment, ...payments]);
  };

  const handleClaimPayment = (paymentId: string, tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setPayments(payments.map(p => 
        p.id === paymentId 
          ? { ...p, tenantId: tenant.id, tenantName: tenant.name, unit: tenant.unit, status: "claimed" as const }
          : p
      ));
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilterMethod("all");
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="size-4" />;
      case "bank_transfer":
      case "online":
        return <CreditCard className="size-4" />;
      default:
        return <DollarSign className="size-4" />;
    }
  };

  return (
    <div className="size-full flex flex-col bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Button
              variant="outline"
              onClick={onBack}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="size-4" />
              Back to Tenants Overview
            </Button>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="break-words text-xl sm:text-2xl lg:text-3xl">
                  Payment History
                  <span className="text-neutral-500"> — {apartment.name}</span>
                </h1>
                <p className="mt-1 text-sm text-neutral-600 sm:text-base">
                  Track and manage all rent payments
                </p>
              </div>
              <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end sm:gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportExcel}
                  className="w-full justify-center gap-2 sm:w-auto"
                >
                  <Download className="size-4 shrink-0" />
                  Export to Excel
                </Button>
                <Button
                  onClick={() => setIsAddPaymentOpen(true)}
                  className="w-full justify-center gap-2 bg-green-600 hover:bg-green-700 sm:w-auto"
                >
                  <DollarSign className="size-4 shrink-0" />
                  Add Payment
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Total Payments</p>
                    <p className="text-green-600">${totalAmount.toLocaleString()}</p>
                  </div>
                  <DollarSign className="size-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Cash Payments</p>
                    <p className="text-brand-cyan">${totalCash.toLocaleString()}</p>
                  </div>
                  <Banknote className="size-8 text-brand-cyan" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Unclaimed</p>
                    <p className="text-orange-600">${totalUnclaimed.toLocaleString()}</p>
                  </div>
                  <AlertCircle className="size-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Total Records</p>
                    <p className="text-neutral-600">{filteredPayments.length}</p>
                  </div>
                  <Calendar className="size-8 text-neutral-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="size-5" />
                  Filters
                </CardTitle>
                {(startDate || endDate || filterMethod !== "all") && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">From Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">To Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select value={filterMethod} onValueChange={setFilterMethod}>
                    <SelectTrigger id="method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
              <TabsTrigger
                value="all"
                className="h-auto min-h-9 whitespace-normal px-2 py-2 text-center text-xs leading-snug sm:whitespace-nowrap sm:text-sm"
              >
                All Payments{" "}
                <span className="tabular-nums">({filteredPayments.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="unclaimed"
                className="h-auto min-h-9 whitespace-normal px-2 py-2 text-center text-xs leading-snug sm:whitespace-nowrap sm:text-sm"
              >
                Unclaimed{" "}
                <span className="tabular-nums">({unclaimedPayments.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="cash"
                className="h-auto min-h-9 whitespace-normal px-2 py-2 text-center text-xs leading-snug sm:whitespace-nowrap sm:text-sm"
              >
                Cash{" "}
                <span className="tabular-nums">({cashPayments.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="bank"
                className="h-auto min-h-9 whitespace-normal px-2 py-2 text-center text-xs leading-snug sm:whitespace-nowrap sm:text-sm"
              >
                Bank Transfer{" "}
                <span className="tabular-nums">({bankTransfers.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* All Payments */}
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredPayments.map((payment) => (
                      <PaymentCard 
                        key={payment.id} 
                        payment={payment}
                        tenants={tenants}
                        onClaimPayment={handleClaimPayment}
                        getMethodIcon={getMethodIcon}
                      />
                    ))}
                    {filteredPayments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No payments found for the selected filters
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Unclaimed Payments */}
            <TabsContent value="unclaimed">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="size-5 text-orange-600" />
                    Unclaimed Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {unclaimedPayments.map((payment) => (
                      <PaymentCard 
                        key={payment.id} 
                        payment={payment}
                        tenants={tenants}
                        onClaimPayment={handleClaimPayment}
                        getMethodIcon={getMethodIcon}
                      />
                    ))}
                    {unclaimedPayments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No unclaimed payments
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cash Payments */}
            <TabsContent value="cash">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="size-5 text-brand-cyan" />
                    Cash Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cashPayments.map((payment) => (
                      <PaymentCard 
                        key={payment.id} 
                        payment={payment}
                        tenants={tenants}
                        onClaimPayment={handleClaimPayment}
                        getMethodIcon={getMethodIcon}
                      />
                    ))}
                    {cashPayments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No cash payments found
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bank Transfers */}
            <TabsContent value="bank">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="size-5 text-brand-cyan" />
                    Bank Transfers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bankTransfers.map((payment) => (
                      <PaymentCard 
                        key={payment.id} 
                        payment={payment}
                        tenants={tenants}
                        onClaimPayment={handleClaimPayment}
                        getMethodIcon={getMethodIcon}
                      />
                    ))}
                    {bankTransfers.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No bank transfers found
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Payment Dialog */}
      <AddPaymentDialog
        open={isAddPaymentOpen}
        onOpenChange={setIsAddPaymentOpen}
        onAdd={handleAddPayment}
        tenants={tenants}
      />
    </div>
  );
}

// Payment Card Component
interface PaymentCardProps {
  payment: Payment;
  tenants: Tenant[];
  onClaimPayment: (paymentId: string, tenantId: string) => void;
  getMethodIcon: (method: string) => JSX.Element;
}

function PaymentCard({ payment, tenants, onClaimPayment, getMethodIcon }: PaymentCardProps) {
  const [selectedTenantId, setSelectedTenantId] = useState("");

  return (
    <div className={`p-4 border rounded-lg ${
      payment.status === "unclaimed" ? "bg-orange-50 border-orange-200" : "bg-white"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-3 rounded-lg ${
            payment.method === "cash" ? "bg-blue-100" : "bg-green-100"
          }`}>
            {getMethodIcon(payment.method)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p>{payment.tenantName}</p>
              <Badge variant={payment.status === "claimed" ? "default" : "destructive"} className={
                payment.status === "claimed" ? "bg-green-600" : ""
              }>
                {payment.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{payment.unit}</p>
            <p className="text-muted-foreground">{payment.notes}</p>
          </div>
        </div>

        <div className="text-right mr-4">
          <p className="text-green-600">${payment.amount.toLocaleString()}</p>
          <p className="text-muted-foreground">
            {new Date(payment.date).toLocaleDateString()}
          </p>
          <p className="text-muted-foreground capitalize">
            {payment.method.replace("_", " ")}
          </p>
          {payment.transactionId && (
            <p className="text-xs text-muted-foreground">{payment.transactionId}</p>
          )}
        </div>

        {payment.status === "unclaimed" && (
          <div className="flex items-center gap-2">
            <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.filter(t => t.status === "active").map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!selectedTenantId}
              onClick={() => {
                if (selectedTenantId) {
                  onClaimPayment(payment.id, selectedTenantId);
                  setSelectedTenantId("");
                }
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Claim
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
