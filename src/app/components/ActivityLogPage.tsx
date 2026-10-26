import { useState } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { ArrowLeft, Search, Clock, User, Activity } from "lucide-react";
import { Apartment } from "./ApartmentCard";
import { ActivityLog } from "./TenantsPage";

interface ActivityLogPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  apartment: Apartment;
  onBack: () => void;
  activityLogs: ActivityLog[];
}

export function ActivityLogPage({ 
  onLogout, 
  onNavigate, 
  apartment, 
  onBack,
  activityLogs
}: ActivityLogPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterUser, setFilterUser] = useState("all");

  const filteredLogs = activityLogs.filter((log) => {
    const searchMatch = 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const actionMatch = filterAction === "all" || log.action === filterAction;
    const userMatch = filterUser === "all" || log.userName === filterUser;

    return searchMatch && actionMatch && userMatch;
  });

  const uniqueActions = Array.from(new Set(activityLogs.map(log => log.action)));
  const uniqueUsers = Array.from(new Set(activityLogs.map(log => log.userName)));

  const getActionColor = (action: string) => {
    if (action.includes("Added") || action.includes("Created")) return "bg-green-100 text-green-800";
    if (action.includes("Updated") || action.includes("Set")) return "bg-blue-100 text-blue-800";
    if (action.includes("Deleted") || action.includes("Marked")) return "bg-red-100 text-red-800";
    return "bg-neutral-100 text-neutral-800";
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case "tenant":
        return "👤";
      case "payment":
        return "💰";
      case "apartment":
        return "🏠";
      default:
        return "⚙️";
    }
  };

  return (
    <div className="size-full flex flex-col bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={onBack}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="size-4" />
              Back to Tenants Overview
            </Button>
            <div>
              <h1>Activity Log - {apartment.name}</h1>
              <p className="text-neutral-600 mt-1">
                Track all system activities and changes
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Total Activities</p>
                    <p className="text-purple-600">{activityLogs.length}</p>
                  </div>
                  <Activity className="size-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Active Users</p>
                    <p className="text-blue-600">{uniqueUsers.length}</p>
                  </div>
                  <User className="size-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground mb-1">Action Types</p>
                    <p className="text-green-600">{uniqueActions.length}</p>
                  </div>
                  <Clock className="size-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 size-5" />
                    <Input
                      id="search"
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action">Action Type</Label>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger id="action">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {uniqueActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user">User</Label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger id="user">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {uniqueUsers.map((user) => (
                        <SelectItem key={user} value={user}>
                          {user}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLogs.length > 0 ? (
                <div className="space-y-3">
                  {filteredLogs
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((log) => (
                      <div key={log.id} className="p-4 border rounded-lg bg-white hover:bg-neutral-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="text-2xl">{getTargetIcon(log.targetType)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getActionColor(log.action)}>
                                {log.action}
                              </Badge>
                              <span className="text-muted-foreground">•</span>
                              <span>{log.targetName}</span>
                            </div>
                            <p className="text-muted-foreground mb-2">{log.details}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <User className="size-4 text-blue-600" />
                                <span className="text-blue-600">{log.userName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="size-4 text-neutral-600" />
                                <span className="text-neutral-600">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                              {log.ipAddress && (
                                <span className="text-neutral-600">IP: {log.ipAddress}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {activityLogs.length === 0 
                    ? "No activities recorded yet" 
                    : "No activities match your filters"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
