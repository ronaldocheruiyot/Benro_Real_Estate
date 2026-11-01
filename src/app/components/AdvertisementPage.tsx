import { useState } from "react";
import { Navigation } from "./Navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Plus, Eye, Edit, Trash2, Share2, Image as ImageIcon } from "lucide-react";
import { CreateAdvertDialog } from "./CreateAdvertDialog";
import { PreviewAdvertDialog } from "./PreviewAdvertDialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect } from "react";
import { toast } from "sonner";
import { UserRole } from "./UserManagementPage";
import { advertisementsApi } from "../api/services";

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  propertyType: "apartment" | "house" | "studio" | "commercial";
  bedrooms?: number;
  bathrooms?: number;
  price: number;
  priceType: "monthly" | "yearly" | "sale";
  location: string;
  amenities: string[];
  images: string[];
  status: "draft" | "published" | "archived";
  createdDate: string;
  publishedDate?: string;
  views: number;
  inquiries: number;
}

interface AdvertisementPageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser?: UserRole;
}

function mapFromApi(raw: any): Advertisement {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || "",
    propertyType: (raw.unitType?.includes("studio") ? "studio" : "apartment") as Advertisement["propertyType"],
    price: raw.rentAmount || raw.price || 0,
    priceType: "monthly",
    location: raw.propertyName || raw.location || "",
    amenities: raw.amenities || [],
    images: raw.images || [],
    status: raw.published || raw.status === "published" ? "published" : raw.status === "archived" ? "archived" : "draft",
    createdDate: raw.createdAt ? String(raw.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
    publishedDate: raw.publishedDate,
    views: raw.views || 0,
    inquiries: raw.inquiries || 0,
  };
}

export function AdvertisementPage({ onLogout, onNavigate, currentUser }: AdvertisementPageProps) {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);
  const [filterStatus, setFilterStatus] = useState<Advertisement["status"] | "all">("all");

  const reload = async () => {
    try {
      const rows = await advertisementsApi.list();
      setAdvertisements(rows.map(mapFromApi));
    } catch (err: any) {
      toast.error(err.message || "Failed to load advertisements");
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleCreateAd = async (ad: Omit<Advertisement, "id" | "createdDate" | "views" | "inquiries">) => {
    try {
      await advertisementsApi.create({
        title: ad.title,
        description: ad.description,
        propertyName: ad.location,
        unitType: ad.propertyType,
        rentAmount: ad.price,
        images: ad.images,
        status: ad.status === "published" ? "published" : "draft",
        published: ad.status === "published",
        contactEmail: currentUser?.email || "",
      });
      await reload();
      setIsCreateDialogOpen(false);
      toast.success("Advertisement saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to create advertisement");
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;
    try {
      await advertisementsApi.remove(id);
      await reload();
      toast.success("Advertisement deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handlePublishToggle = async (id: string) => {
    const ad = advertisements.find(a => a.id === id);
    const newStatus = ad?.status === "published" ? "draft" : "published";
    try {
      await advertisementsApi.update(id, {
        status: newStatus === "published" ? "published" : "draft",
        published: newStatus === "published",
      });
      await reload();
      if (newStatus === "published") {
        toast.success("Advertisement published!", {
          description: "Your listing is now visible to potential tenants"
        });
      } else {
        toast.info("Advertisement unpublished", {
          description: "Listing is now hidden from public view"
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    }
  };

  const handleShare = (ad: Advertisement) => {
    const shareText = `Check out: ${ad.title}\n${ad.description}\nPrice: ${ad.price}/${ad.priceType}\nLocation: ${ad.location}`;
    
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: shareText,
      }).then(() => {
        toast.success("Shared successfully!");
      }).catch(() => {
        copyToClipboard(shareText);
      });
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("📋 Copied to clipboard!", {
      description: "Advertisement details ready to share"
    });
  };

  const filteredAds = filterStatus === "all" 
    ? advertisements 
    : advertisements.filter(ad => ad.status === filterStatus);

  const stats = {
    total: advertisements.length,
    published: advertisements.filter(ad => ad.status === "published").length,
    draft: advertisements.filter(ad => ad.status === "draft").length,
    totalViews: advertisements.reduce((sum, ad) => sum + ad.views, 0),
    totalInquiries: advertisements.reduce((sum, ad) => sum + ad.inquiries, 0),
  };

  const getStatusBadge = (status: Advertisement["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-700">Published</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>;
      case "archived":
        return <Badge className="bg-red-100 text-red-700">Archived</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="advertisements" currentUser={currentUser} />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-neutral-900 mb-2">Property Advertisements</h1>
              <p className="text-neutral-600">
                Create and manage property listings for marketing
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Advertisement
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-neutral-600 mb-1">Total Ads</p>
                <p className="text-neutral-900">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-neutral-600 mb-1">Published</p>
                <p className="text-green-600">{stats.published}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-neutral-600 mb-1">Drafts</p>
                <p className="text-gray-600">{stats.draft}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-neutral-600 mb-1">Total Views</p>
                <p className="text-brand-cyan">{stats.totalViews}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-neutral-600 mb-1">Inquiries</p>
                <p className="text-purple-600">{stats.totalInquiries}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
            >
              All ({advertisements.length})
            </Button>
            <Button
              variant={filterStatus === "published" ? "default" : "outline"}
              onClick={() => setFilterStatus("published")}
            >
              Published ({stats.published})
            </Button>
            <Button
              variant={filterStatus === "draft" ? "default" : "outline"}
              onClick={() => setFilterStatus("draft")}
            >
              Drafts ({stats.draft})
            </Button>
          </div>
        </div>

        {/* Advertisements Grid */}
        {filteredAds.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-neutral-900 mb-2">No advertisements found</h3>
              <p className="text-neutral-600 mb-4">
                {filterStatus === "all" 
                  ? "Create your first property advertisement to get started"
                  : `No ${filterStatus} advertisements`}
              </p>
              {filterStatus === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Advertisement
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <Card key={ad.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative aspect-video bg-neutral-100">
                  {ad.images.length > 0 ? (
                    <ImageWithFallback
                      src={ad.images[0]}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-neutral-400" />
                    </div>
                  )}
                  {ad.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      +{ad.images.length - 1} more
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(ad.status)}
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="text-neutral-900 mb-1 line-clamp-1">{ad.title}</h3>
                    <p className="text-neutral-600 line-clamp-2">{ad.description}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Type:</span>
                      <span className="text-neutral-900 capitalize">{ad.propertyType}</span>
                    </div>
                    {ad.bedrooms && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Beds/Baths:</span>
                        <span className="text-neutral-900">{ad.bedrooms} / {ad.bathrooms}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Location:</span>
                      <span className="text-neutral-900">{ad.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Price:</span>
                      <span className="text-green-600">${ad.price}/{ad.priceType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-xs text-neutral-600">
                    <span>👁 {ad.views} views</span>
                    <span>•</span>
                    <span>💬 {ad.inquiries} inquiries</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setPreviewAd(ad)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(ad)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePublishToggle(ad.id)}
                    >
                      {ad.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAd(ad.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateAdvertDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateAd}
      />

      {previewAd && (
        <PreviewAdvertDialog
          open={!!previewAd}
          onOpenChange={(open) => !open && setPreviewAd(null)}
          advertisement={previewAd}
        />
      )}
    </div>
  );
}
