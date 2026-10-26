import { useState, useMemo } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { 
  ArrowLeft, 
  Download, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  FileText,
  Printer,
  Search,
  Filter,
  Home,
  BarChart3
} from "lucide-react";
import { Apartment } from "./ApartmentCard";
import { Payment } from "./TenantsPage";
import { UserRole } from "./UserManagementPage";

interface FinancialReportsPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  onBack: () => void;
  apartments: Apartment[];
  payments: Payment[];
  currentUser?: UserRole;
}

export function FinancialReportsPage({ 
  onLogout, 
  onNavigate, 
  onBack,
  apartments,
  payments,
  currentUser
}: FinancialReportsPageProps) {
  const [selectedApartment, setSelectedApartment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState<string>("all");

  // Filter payments based on all criteria
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      // Apartment filter
      if (selectedApartment !== "all") {
        // You would need to map payment to apartment - for now using a simple check
        const matchesApartment = payment.unit.toLowerCase().includes(selectedApartment.toLowerCase());
        if (!matchesApartment) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          payment.tenantName.toLowerCase().includes(query) ||
          payment.unit.toLowerCase().includes(query) ||
          payment.transactionId?.toLowerCase().includes(query) ||
          payment.amount.toString().includes(query);
        if (!matchesSearch) return false;
      }

      // Date filters
      if (dateFrom && payment.date < dateFrom) return false;
      if (dateTo && payment.date > dateTo) return false;

      // Payment method filter
      if (paymentMethod !== "all" && payment.method !== paymentMethod) return false;

      // Payment status filter
      if (paymentStatus !== "all" && payment.status !== paymentStatus) return false;

      return true;
    });
  }, [payments, selectedApartment, searchQuery, dateFrom, dateTo, paymentMethod, paymentStatus]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const count = filteredPayments.length;
    const average = count > 0 ? total / count : 0;

    // Group by apartment/property
    const byApartment: Record<string, { count: number; total: number }> = {};
    filteredPayments.forEach(payment => {
      const key = payment.unit.split(' ')[0] + ' ' + payment.unit.split(' ')[1]; // Extract apartment name
      if (!byApartment[key]) {
        byApartment[key] = { count: 0, total: 0 };
      }
      byApartment[key].count++;
      byApartment[key].total += payment.amount;
    });

    // Group by month
    const byMonth: Record<string, number> = {};
    filteredPayments.forEach(payment => {
      const month = payment.date.substring(0, 7); // YYYY-MM
      byMonth[month] = (byMonth[month] || 0) + payment.amount;
    });

    // Group by payment method
    const byMethod: Record<string, number> = {};
    filteredPayments.forEach(payment => {
      byMethod[payment.method] = (byMethod[payment.method] || 0) + payment.amount;
    });

    return {
      totalRevenue: total,
      totalPayments: count,
      averagePayment: average,
      byApartment,
      byMonth,
      byMethod
    };
  }, [filteredPayments]);

  const handleExportCSV = () => {
    const headers = ["Date", "Tenant", "Unit", "Amount", "Method", "Status", "Transaction ID", "Notes"];
    const rows = filteredPayments.map(p => [
      p.date,
      p.tenantName,
      p.unit,
      p.amount.toString(),
      p.method,
      p.status,
      p.transactionId || "",
      p.notes || ""
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Financial Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .summary { margin: 30px 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .stat { background: #f5f5f5; padding: 15px; border-radius: 8px; }
            .stat-label { color: #666; font-size: 14px; }
            .stat-value { color: #2563eb; font-size: 24px; font-weight: bold; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f3f3f5; font-weight: 600; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Financial Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          ${dateFrom || dateTo ? `<p>Period: ${dateFrom || 'Beginning'} to ${dateTo || 'Present'}</p>` : ''}
          
          <div class="summary">
            <div class="stat">
              <div class="stat-label">Total Revenue</div>
              <div class="stat-value">$${statistics.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total Payments</div>
              <div class="stat-value">${statistics.totalPayments}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Average Payment</div>
              <div class="stat-value">$${statistics.averagePayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
          </div>

          <h2>Payment Details</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPayments.map(p => `
                <tr>
                  <td>${new Date(p.date).toLocaleDateString()}</td>
                  <td>${p.tenantName}</td>
                  <td>${p.unit}</td>
                  <td>$${p.amount.toLocaleString()}</td>
                  <td>${p.method.replace('_', ' ')}</td>
                  <td>${p.status}</td>
                  <td>${p.transactionId || '-'}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3">Total</td>
                <td>$${statistics.totalRevenue.toLocaleString()}</td>
                <td colspan="3">${statistics.totalPayments} payments</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; margin-right: 10px; cursor: pointer;">Print</button>
            <button onclick="window.close()" style="padding: 10px 20px; cursor: pointer;">Close</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const clearFilters = () => {
    setSelectedApartment("all");
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setPaymentMethod("all");
    setPaymentStatus("all");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="financialReports" currentUser={currentUser} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-neutral-900 mb-2">Financial Reports & Analytics</h1>
              <p className="text-neutral-600">Comprehensive income tracking and payment history</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Report
              </Button>
              <Button onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Total Revenue</p>
                  <p className="text-neutral-900">${statistics.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Total Payments</p>
                  <p className="text-neutral-900">{statistics.totalPayments}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Average Payment</p>
                  <p className="text-neutral-900">
                    ${statistics.averagePayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-600 mb-1">Properties</p>
                  <p className="text-neutral-900">{Object.keys(statistics.byApartment).length}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Home className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    id="search"
                    placeholder="Tenant, unit, transaction ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Apartment Filter */}
              <div className="space-y-2">
                <Label htmlFor="apartment">Property/Apartment</Label>
                <Select value={selectedApartment} onValueChange={setSelectedApartment}>
                  <SelectTrigger id="apartment">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {apartments.map((apt) => (
                      <SelectItem key={apt.id} value={apt.name}>
                        {apt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              {/* Payment Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                    <SelectItem value="unclaimed">Unclaimed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different views */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="byProperty">By Property</TabsTrigger>
            <TabsTrigger value="byMonth">By Month</TabsTrigger>
            <TabsTrigger value="byMethod">By Method</TabsTrigger>
          </TabsList>

          {/* All Payments Table */}
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Payment History ({filteredPayments.length} records)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Transaction ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-neutral-500 py-8">
                            No payments found matching your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                            <TableCell>{payment.tenantName}</TableCell>
                            <TableCell>{payment.unit}</TableCell>
                            <TableCell className="text-green-600">
                              ${payment.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="capitalize">
                              {payment.method.replace('_', ' ')}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  payment.status === "claimed" ? "default" : 
                                  payment.status === "unclaimed" ? "destructive" : 
                                  "secondary"
                                }
                              >
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-neutral-600">
                              {payment.transactionId || '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredPayments.length > 0 && (
                  <div className="mt-4 p-4 bg-neutral-50 rounded-lg flex justify-between items-center">
                    <span className="text-neutral-700">Total Amount:</span>
                    <span className="text-green-600">${statistics.totalRevenue.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Property */}
          <TabsContent value="byProperty">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Property</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statistics.byApartment).map(([property, data]) => (
                    <Card key={property}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Home className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-neutral-900">{property}</p>
                              <p className="text-neutral-600">{data.count} payments</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-green-600">${data.total.toLocaleString()}</p>
                            <p className="text-neutral-600">
                              Avg: ${(data.total / data.count).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(data.total / statistics.totalRevenue) * 100}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Month */}
          <TabsContent value="byMonth">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(statistics.byMonth)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([month, amount]) => (
                          <TableRow key={month}>
                            <TableCell>{new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</TableCell>
                            <TableCell className="text-right text-green-600">
                              ${amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {((amount / statistics.totalRevenue) * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Payment Method */}
          <TabsContent value="byMethod">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(statistics.byMethod).map(([method, amount]) => (
                    <Card key={method}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-neutral-600 mb-1 capitalize">
                              {method.replace('_', ' ')}
                            </p>
                            <p className="text-neutral-900">${amount.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">
                              {((amount / statistics.totalRevenue) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
