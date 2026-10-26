import { Navigation } from "./Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, PieChart } from "lucide-react";
import { UserAccount } from "../types/roles";
import { Apartment } from "./ApartmentCard";

interface BudgetsManagementPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser: UserAccount;
  apartments: Apartment[];
}

export function BudgetsManagementPage({ 
  onLogout, 
  onNavigate,
  currentUser,
  apartments
}: BudgetsManagementPageProps) {
  // Check permissions
  if (!currentUser.permissions.manageBudgets && !currentUser.permissions.approveMaintenanceBudgets) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation 
          onLogout={onLogout} 
          onNavigate={onNavigate} 
          currentView="budgets"
          currentUser={currentUser}
        />
        <div className="p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl mb-2">Access Denied</h2>
              <p className="text-neutral-600">You don't have permission to access budget management.</p>
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
        currentView="budgets"
        currentUser={currentUser}
      />
      
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-neutral-900 mb-2">Budget Management</h1>
          <p className="text-neutral-600">
            {currentUser.role === "accountant" 
              ? "Manage budgets and expense categories" 
              : "Review and approve maintenance budgets"}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <span className="text-2xl">$150K</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <span className="text-2xl">$87K</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-2xl">$63K</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                <span className="text-2xl">58%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 text-center py-12">
              {currentUser.role === "accountant" 
                ? "Budget allocation, expense tracking, and category management interface"
                : "Maintenance budget review and approval interface"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
