import { useState } from "react";
import { Navigation } from "./Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Camera,
  MapPin,
  Calendar,
  User,
  MessageSquare
} from "lucide-react";
import { UserAccount } from "../types/roles";
import { Apartment } from "./ApartmentCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

type TaskStatus = "pending" | "in_progress" | "completed";
type TaskPriority = "low" | "medium" | "high" | "urgent";

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  property: string;
  propertyName: string;
  location: string; // Unit number or area
  status: TaskStatus;
  priority: TaskPriority;
  reportedBy: string;
  assignedTo?: string;
  createdDate: string;
  updatedDate: string;
  completedDate?: string;
  estimatedCost?: string;
  photos?: string[];
  notes?: string;
}

interface MaintenanceTasksPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser: UserAccount;
  apartments: Apartment[];
}

export function MaintenanceTasksPage({ 
  onLogout, 
  onNavigate,
  currentUser,
  apartments
}: MaintenanceTasksPageProps) {
  // Check permissions
  if (!currentUser.permissions.reportMaintenance && !currentUser.permissions.updateMaintenanceTasks) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navigation 
          onLogout={onLogout} 
          onNavigate={onNavigate} 
          currentView="maintenanceTasks"
          currentUser={currentUser}
        />
        <div className="p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl mb-2">Access Denied</h2>
              <p className="text-neutral-600">You don't have permission to access maintenance tasks.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const [tasks, setTasks] = useState<MaintenanceTask[]>([
    {
      id: "1",
      title: "Leaking Faucet - Unit 101",
      description: "Kitchen faucet is leaking constantly, needs replacement",
      property: "1",
      propertyName: "Sunset Apartments",
      location: "Unit 101 - Kitchen",
      status: "pending",
      priority: "medium",
      reportedBy: "Mike Caretaker",
      createdDate: "2026-01-28",
      updatedDate: "2026-01-28",
      estimatedCost: "$150"
    },
    {
      id: "2",
      title: "Broken Window - Unit 205",
      description: "Window pane cracked, needs urgent replacement for security",
      property: "2",
      propertyName: "Harbor View Residences",
      location: "Unit 205 - Living Room",
      status: "in_progress",
      priority: "high",
      reportedBy: "Mike Caretaker",
      assignedTo: "John Handyman",
      createdDate: "2026-01-25",
      updatedDate: "2026-01-30",
      estimatedCost: "$300"
    },
    {
      id: "3",
      title: "HVAC System Maintenance",
      description: "Quarterly HVAC system check and filter replacement",
      property: "1",
      propertyName: "Sunset Apartments",
      location: "Building - Mechanical Room",
      status: "completed",
      priority: "low",
      reportedBy: "Mike Caretaker",
      assignedTo: "HVAC Tech",
      createdDate: "2026-01-15",
      updatedDate: "2026-01-20",
      completedDate: "2026-01-20",
      estimatedCost: "$200"
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    property: "",
    location: "",
    priority: "medium" as TaskPriority,
    estimatedCost: "",
  });

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.description || !newTask.property) {
      toast.error("Please fill in all required fields");
      return;
    }

    const propertyName = apartments.find(a => a.id === newTask.property)?.name || "Unknown Property";

    const task: MaintenanceTask = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      property: newTask.property,
      propertyName,
      location: newTask.location,
      status: "pending",
      priority: newTask.priority,
      reportedBy: currentUser.name,
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      estimatedCost: newTask.estimatedCost || undefined,
    };

    setTasks([...tasks, task]);
    toast.success("Maintenance task created", {
      description: "Task has been reported and is pending assignment"
    });
    
    setIsCreateDialogOpen(false);
    setNewTask({
      title: "",
      description: "",
      property: "",
      location: "",
      priority: "medium",
      estimatedCost: "",
    });
  };

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    if (!currentUser.permissions.updateMaintenanceTasks) {
      toast.error("You don't have permission to update task status");
      return;
    }

    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus,
          updatedDate: new Date().toISOString().split('T')[0],
          ...(newStatus === "completed" && { completedDate: new Date().toISOString().split('T')[0] })
        };
      }
      return task;
    }));

    toast.success("Task status updated");
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Wrench className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="border-neutral-300 text-neutral-700">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="border-orange-300 text-orange-700">High</Badge>;
      case "urgent":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Urgent</Badge>;
    }
  };

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation 
        onLogout={onLogout} 
        onNavigate={onNavigate} 
        currentView="maintenanceTasks"
        currentUser={currentUser}
      />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-neutral-900 mb-2">Maintenance Tasks</h1>
            <p className="text-neutral-600">
              Report and manage property maintenance issues and repairs
            </p>
          </div>
          
          {currentUser.permissions.reportMaintenance && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Report Maintenance Issue</DialogTitle>
                  <DialogDescription>
                    Submit a new maintenance request
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="taskTitle">Issue Title *</Label>
                    <Input
                      id="taskTitle"
                      placeholder="e.g., Leaking Faucet - Unit 101"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="taskDesc">Description *</Label>
                    <Textarea
                      id="taskDesc"
                      placeholder="Detailed description of the issue..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="taskProperty">Property *</Label>
                    <Select 
                      value={newTask.property}
                      onValueChange={(value) => setNewTask({...newTask, property: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
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

                  <div>
                    <Label htmlFor="taskLocation">Location</Label>
                    <Input
                      id="taskLocation"
                      placeholder="e.g., Unit 101 - Kitchen"
                      value={newTask.location}
                      onChange={(e) => setNewTask({...newTask, location: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="taskPriority">Priority *</Label>
                    <Select 
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({...newTask, priority: value as TaskPriority})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="taskCost">Estimated Cost</Label>
                    <Input
                      id="taskCost"
                      placeholder="e.g., $150"
                      value={newTask.estimatedCost}
                      onChange={(e) => setNewTask({...newTask, estimatedCost: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="taskPhotos">Upload Photos</Label>
                    <Input
                      id="taskPhotos"
                      type="file"
                      accept="image/*"
                      multiple
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Upload photos of the issue (optional)
                    </p>
                  </div>

                  <Button 
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={handleCreateTask}
                  >
                    Report Issue
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-500" />
                <span className="text-2xl">{tasks.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl">{pendingTasks.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-500" />
                <span className="text-2xl">{inProgressTasks.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-neutral-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl">{completedTasks.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Table */}
        <Card>
          <Tabs defaultValue="all" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  All ({tasks.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingTasks.length})
                </TabsTrigger>
                <TabsTrigger value="in_progress">
                  In Progress ({inProgressTasks.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedTasks.length})
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="all" className="mt-0">
                <TasksTable 
                  tasks={tasks} 
                  onUpdateStatus={handleUpdateStatus}
                  onViewDetails={(task) => {
                    setSelectedTask(task);
                    setIsDetailDialogOpen(true);
                  }}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  canUpdate={currentUser.permissions.updateMaintenanceTasks}
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-0">
                <TasksTable 
                  tasks={pendingTasks} 
                  onUpdateStatus={handleUpdateStatus}
                  onViewDetails={(task) => {
                    setSelectedTask(task);
                    setIsDetailDialogOpen(true);
                  }}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  canUpdate={currentUser.permissions.updateMaintenanceTasks}
                />
              </TabsContent>

              <TabsContent value="in_progress" className="mt-0">
                <TasksTable 
                  tasks={inProgressTasks} 
                  onUpdateStatus={handleUpdateStatus}
                  onViewDetails={(task) => {
                    setSelectedTask(task);
                    setIsDetailDialogOpen(true);
                  }}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  canUpdate={currentUser.permissions.updateMaintenanceTasks}
                />
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                <TasksTable 
                  tasks={completedTasks} 
                  onUpdateStatus={handleUpdateStatus}
                  onViewDetails={(task) => {
                    setSelectedTask(task);
                    setIsDetailDialogOpen(true);
                  }}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  canUpdate={currentUser.permissions.updateMaintenanceTasks}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// Tasks Table Component
function TasksTable({ 
  tasks, 
  onUpdateStatus, 
  onViewDetails,
  getStatusBadge,
  getPriorityBadge,
  canUpdate
}: {
  tasks: MaintenanceTask[];
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onViewDetails: (task: MaintenanceTask) => void;
  getStatusBadge: (status: TaskStatus) => JSX.Element;
  getPriorityBadge: (priority: TaskPriority) => JSX.Element;
  canUpdate: boolean;
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Wrench className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-600">No maintenance tasks</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Property</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Reported By</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>
              <div>
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-neutral-500 line-clamp-1">{task.description}</div>
              </div>
            </TableCell>
            <TableCell>{task.propertyName}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-neutral-400" />
                <span className="text-sm">{task.location}</span>
              </div>
            </TableCell>
            <TableCell>{getPriorityBadge(task.priority)}</TableCell>
            <TableCell>{getStatusBadge(task.status)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-neutral-400" />
                <span className="text-sm">{task.reportedBy}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-neutral-400" />
                <span className="text-sm">{task.createdDate}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {canUpdate && task.status === "pending" && (
                  <Button 
                    size="sm" 
                    onClick={() => onUpdateStatus(task.id, "in_progress")}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Start
                  </Button>
                )}
                {canUpdate && task.status === "in_progress" && (
                  <Button 
                    size="sm" 
                    onClick={() => onUpdateStatus(task.id, "completed")}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Complete
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onViewDetails(task)}
                >
                  View
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
