import { useState } from "react";
import { Navigation } from "./Navigation";
import { UserRole } from "./UserManagementPage";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Search, Edit, Trash2, MapPin, Ruler, DollarSign, Calendar, FileText, Image as ImageIcon, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { landsApi } from "../api/services";

export interface LandListing {
  id: string;
  title: string;
  landType: "farm" | "residential" | "commercial" | "industrial" | "vacant" | "mixed-use";
  size: number;
  sizeUnit: "acres" | "hectares" | "sqft" | "sqm";
  price: number;
  location: string;
  description: string;
  features: string[];
  images: string[];
  status: "available" | "pending" | "sold";
  uploadedDate: string;
  uploadedBy: string;
  contactInfo: string;
  zoning?: string;
  waterAccess?: boolean;
  electricityAccess?: boolean;
  roadAccess?: boolean;
}

interface LandManagementPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser: UserRole;
}

function mapLandFromApi(raw: any, uploadedBy: string): LandListing {
  const sizeNum = Number(String(raw.size || "0").replace(/[^\d.]/g, "")) || 0;
  return {
    id: raw.id,
    title: raw.name || raw.title || "Untitled",
    landType: "vacant",
    size: sizeNum,
    sizeUnit: "acres",
    price: raw.value || raw.price || 0,
    location: raw.location || "",
    description: raw.notes || raw.description || "",
    features: [],
    images: raw.imageUrl ? [raw.imageUrl] : [],
    status: raw.status === "sold" ? "sold" : raw.status === "leased" ? "pending" : "available",
    uploadedDate: raw.createdAt ? String(raw.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
    uploadedBy,
    contactInfo: "",
  };
}

export function LandManagementPage({ onLogout, onNavigate, currentUser }: LandManagementPageProps) {
  const [landListings, setLandListings] = useState<LandListing[]>([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLand, setSelectedLand] = useState<LandListing | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [formData, setFormData] = useState<Partial<LandListing>>({
    title: "",
    landType: "farm",
    size: 0,
    sizeUnit: "acres",
    price: 0,
    location: "",
    description: "",
    features: [],
    images: [],
    status: "available",
    contactInfo: "",
    zoning: "",
    waterAccess: false,
    electricityAccess: false,
    roadAccess: false
  });

  const [newFeature, setNewFeature] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const reloadLands = async () => {
    try {
      const rows = await landsApi.list();
      setLandListings(rows.map((r) => mapLandFromApi(r, currentUser.name)));
    } catch (err: any) {
      toast.error(err.message || "Failed to load land listings");
    }
  };

  useEffect(() => {
    reloadLands();
  }, []);

  const handleAddListing = async () => {
    if (!formData.title || !formData.location || formData.size === 0 || formData.price === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await landsApi.create({
        name: formData.title,
        location: formData.location,
        size: `${formData.size} ${formData.sizeUnit || "acres"}`,
        value: formData.price || 0,
        notes: formData.description || "",
        status: formData.status === "sold" ? "sold" : formData.status === "pending" ? "leased" : "available",
        imageUrl: formData.images?.[0] || "",
      });
      await reloadLands();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Land listing added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add land listing");
    }
  };

  const handleEditListing = async () => {
    if (!selectedLand || !formData.title || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await landsApi.update(selectedLand.id, {
        name: formData.title,
        location: formData.location,
        size: `${formData.size || 0} ${formData.sizeUnit || "acres"}`,
        value: formData.price || 0,
        notes: formData.description || "",
        status: formData.status === "sold" ? "sold" : formData.status === "pending" ? "leased" : "available",
        imageUrl: formData.images?.[0] || "",
      });
      await reloadLands();
      setIsEditDialogOpen(false);
      setSelectedLand(null);
      resetForm();
      toast.success("Land listing updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update land listing");
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this land listing?")) return;
    try {
      await landsApi.remove(id);
      await reloadLands();
      toast.success("Land listing deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete land listing");
    }
  };

  const openEditDialog = (land: LandListing) => {
    setSelectedLand(land);
    setFormData({
      title: land.title,
      landType: land.landType,
      size: land.size,
      sizeUnit: land.sizeUnit,
      price: land.price,
      location: land.location,
      description: land.description,
      features: land.features,
      images: land.images,
      status: land.status,
      contactInfo: land.contactInfo,
      zoning: land.zoning,
      waterAccess: land.waterAccess,
      electricityAccess: land.electricityAccess,
      roadAccess: land.roadAccess
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      landType: "farm",
      size: 0,
      sizeUnit: "acres",
      price: 0,
      location: "",
      description: "",
      features: [],
      images: [],
      status: "available",
      contactInfo: "",
      zoning: "",
      waterAccess: false,
      electricityAccess: false,
      roadAccess: false
    });
    setNewFeature("");
    setNewImageUrl("");
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature.trim()]
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((_, i) => i !== index) || []
    });
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), newImageUrl.trim()]
      });
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images?.filter((_, i) => i !== index) || []
    });
  };

  const filteredListings = landListings.filter(land => {
    const matchesSearch = land.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         land.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         land.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || land.landType === filterType;
    const matchesStatus = filterStatus === "all" || land.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getLandTypeBadgeColor = (type: string) => {
    const colors = {
      farm: "bg-green-500",
      residential: "bg-blue-500",
      commercial: "bg-purple-500",
      industrial: "bg-gray-500",
      vacant: "bg-yellow-500",
      "mixed-use": "bg-orange-500"
    };
    return colors[type as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      available: "bg-green-500",
      pending: "bg-yellow-500",
      sold: "bg-red-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const LandForm = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter land title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="landType">Land Type *</Label>
          <Select
            value={formData.landType}
            onValueChange={(value: any) => setFormData({ ...formData, landType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="farm">Farm Land</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="vacant">Vacant Land</SelectItem>
              <SelectItem value="mixed-use">Mixed Use</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Size *</Label>
          <Input
            id="size"
            type="number"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: parseFloat(e.target.value) })}
            placeholder="Enter size"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sizeUnit">Size Unit *</Label>
          <Select
            value={formData.sizeUnit}
            onValueChange={(value: any) => setFormData({ ...formData, sizeUnit: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acres">Acres</SelectItem>
              <SelectItem value="hectares">Hectares</SelectItem>
              <SelectItem value="sqft">Square Feet</SelectItem>
              <SelectItem value="sqm">Square Meters</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            placeholder="Enter price"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Enter location"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zoning">Zoning</Label>
          <Input
            id="zoning"
            value={formData.zoning}
            onChange={(e) => setFormData({ ...formData, zoning: e.target.value })}
            placeholder="e.g., Agricultural, Residential"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactInfo">Contact Info</Label>
          <Input
            id="contactInfo"
            value={formData.contactInfo}
            onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
            placeholder="Phone or email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter detailed description of the land"
          rows={4}
        />
      </div>

      {/* Access Checkboxes */}
      <div className="space-y-2">
        <Label>Access & Utilities</Label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.waterAccess}
              onChange={(e) => setFormData({ ...formData, waterAccess: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Water Access</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.electricityAccess}
              onChange={(e) => setFormData({ ...formData, electricityAccess: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Electricity Access</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.roadAccess}
              onChange={(e) => setFormData({ ...formData, roadAccess: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Road Access</span>
          </label>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <Label>Features</Label>
        <div className="flex gap-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Add a feature"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
          />
          <Button type="button" onClick={addFeature}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.features?.map((feature, index) => (
            <Badge key={index} className="bg-blue-500 text-white flex items-center gap-1">
              {feature}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFeature(index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>Images (URLs)</Label>
        <div className="flex gap-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Add image URL"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
          />
          <Button type="button" onClick={addImage}>Add</Button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {formData.images?.map((image, index) => (
            <div key={index} className="relative group">
              <img 
                src={image} 
                alt={`Land ${index + 1}`} 
                className="w-full h-24 object-cover rounded"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation 
        onLogout={onLogout} 
        onNavigate={onNavigate} 
        currentView="landManagement"
        currentUser={currentUser}
      />

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Land Management</h1>
          <p className="text-neutral-600">Manage your land listings for sale</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <Input
                  placeholder="Search by title, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="farm">Farm Land</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="vacant">Vacant Land</SelectItem>
                  <SelectItem value="mixed-use">Mixed Use</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-brand-navy text-white hover:bg-brand-navy-deep" onClick={() => resetForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Land Listing
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Add New Land Listing</DialogTitle>
                    <DialogDescription>
                      Enter the details of the land you want to list for sale
                    </DialogDescription>
                  </DialogHeader>
                  <LandForm />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddListing} className="bg-brand-navy text-white hover:bg-brand-navy-deep">
                      Add Listing
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{landListings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {landListings.filter(l => l.status === "available").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {landListings.filter(l => l.status === "pending").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${landListings.reduce((sum, land) => sum + land.price, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Listings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Land Listings ({filteredListings.length})</CardTitle>
            <CardDescription>View and manage all your land listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-neutral-500">
                        No land listings found. Add your first listing to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredListings.map((land) => (
                      <TableRow key={land.id}>
                        <TableCell>
                          <div className="w-16 h-16 rounded overflow-hidden bg-neutral-200">
                            {land.images.length > 0 ? (
                              <img 
                                src={land.images[0]} 
                                alt={land.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-neutral-400" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{land.title}</p>
                            <p className="text-sm text-neutral-500 line-clamp-1">
                              {land.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getLandTypeBadgeColor(land.landType)} text-white`}>
                            {land.landType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Ruler className="h-4 w-4 text-neutral-400" />
                            <span>{land.size} {land.sizeUnit}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-neutral-400" />
                            <span className="font-semibold">{land.price.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-neutral-400" />
                            <span className="text-sm">{land.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusBadgeColor(land.status)} text-white`}>
                            {land.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-neutral-600">
                            <Calendar className="h-4 w-4" />
                            {land.uploadedDate}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(land)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteListing(land.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Land Listing</DialogTitle>
              <DialogDescription>
                Update the details of your land listing
              </DialogDescription>
            </DialogHeader>
            <LandForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditListing} className="bg-brand-navy text-white hover:bg-brand-navy-deep">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
