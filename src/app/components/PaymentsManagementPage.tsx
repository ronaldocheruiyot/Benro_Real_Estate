import { Navigation } from "./Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { DollarSign, Plus, Download, AlertCircle, TrendingUp, Receipt } from "lucide-react";
import { UserAccount } from "../types/roles";
import { Apartment } from "./ApartmentCard";
import { Tenant, Payment } from "./TenantsPage";
import { AddPaymentDialog } from "./AddPaymentDialog";
import { useState } from "react";
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
  setPayments
}: PaymentsManagementPageProps) {
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  
  // Check permissions
  if (!currentUser.permissions.recordPayments) {
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
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl mb-2">Access Denied</h2>
              <p className="text-neutral-600">You don't have permission to access payment management.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const thisMonth = new Date().getMonth();
  const monthlyRevenue = payments.filter(p => new Date(p.date).getMonth() === thisMonth).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation 
        onLogout={onLogout} 
        onNavigate={onNavigate} 
        currentView="payments"
        currentUser={currentUser}
      />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-neutral-900 mb-2">Payment Management</h1>
            <p className="text-neutral-600">
              Record rent payments, deposits, penalties, and generate invoices
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => setIsAddPaymentOpen(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Total Payments</CardTitle>
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
              <CardTitle className="text-sm text-neutral-600">Pending Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span className="text-2xl">0</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 text-center py-12">
              Payment recording and invoice generation interface<br/>
              (Full implementation with transaction history, receipts, and reconciliation)
            </p>
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
    </div>
  );
}
