import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Advertisement } from "./AdvertisementPage";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { X, Plus, Eye, Upload, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateAdvertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (ad: Omit<Advertisement, "id" | "createdDate" | "views" | "inquiries">) => void;
}

const MAX_IMAGES = 5;
const MIN_IMAGES = 1;

const amenitiesList = [
  "Parking", "Gym", "Pool", "Security", "Elevator", 
  "Balcony", "Garden", "WiFi", "Furnished", "Air Conditioning",
  "Heating", "Pet Friendly", "Laundry", "Storage", "Utilities Included"
];

export function CreateAdvertDialog({ open, onOpenChange, onCreate }: CreateAdvertDialogProps) {
  const [step, setStep] = useState<"form" | "preview">("form");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState<Advertisement["propertyType"]>("apartment");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<Advertisement["priceType"]>("monthly");
  const [location, setLocation] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [status, setStatus] = useState<Advertisement["status"]>("draft");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    
    if (imageUrls.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    
    setImageUrls([...imageUrls, newImageUrl.trim()]);
    setNewImageUrl("");
    toast.success(`Image ${imageUrls.length + 1} added`);
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
    toast.success("Image removed");
  };

  const handleGenerateAIDescription = async () => {
    if (!title.trim() || !location.trim()) {
      toast.error("Please fill in Title and Location first for better AI suggestions");
      return;
    }

    setIsGeneratingAI(true);
    
    // Simulate AI generation (in real app, call OpenAI API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const propertyTypeText = propertyType.charAt(0).toUpperCase() + propertyType.slice(1);
    const bedroomText = bedrooms ? `${bedrooms}-bedroom ` : "";
    const amenitiesText = selectedAmenities.length > 0 
      ? `Features include ${selectedAmenities.slice(0, 3).join(", ")}.` 
      : "";
    
    const aiDescription = `Welcome to this beautiful ${bedroomText}${propertyTypeText.toLowerCase()} located in the heart of ${location}. This stunning property offers modern living at its finest with spacious interiors and premium finishes throughout.

${amenitiesText} Perfect for ${bedrooms && parseInt(bedrooms) >= 3 ? 'families' : bedrooms && parseInt(bedrooms) === 2 ? 'small families or roommates' : 'singles or couples'} looking for comfort and convenience.

The property is situated in a prime location with easy access to public transportation, shopping centers, restaurants, and entertainment options. ${selectedAmenities.includes("Parking") ? "Convenient parking available." : ""} ${selectedAmenities.includes("Security") ? "24/7 security ensures peace of mind." : ""}

Don't miss this opportunity to make this wonderful property your new home. Schedule a viewing today!`;

    setDescription(aiDescription);
    setIsGeneratingAI(false);
    toast.success("AI description generated! Feel free to edit it.");
  };

  const handlePreview = () => {
    if (!title.trim() || !description.trim() || !price || !location.trim()) {
      toast.error("Please fill in all required fields (Title, Description, Price, Location)");
      return;
    }
    
    if (imageUrls.length < MIN_IMAGES) {
      toast.error(`Please add at least ${MIN_IMAGES} image`);
      return;
    }
    
    setStep("preview");
  };

  const handleSubmit = () => {
    onCreate({
      title: title.trim(),
      description: description.trim(),
      propertyType,
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
      price: parseFloat(price),
      priceType,
      location: location.trim(),
      amenities: selectedAmenities,
      images: imageUrls,
      status,
      publishedDate: status === "published" ? new Date().toISOString().split('T')[0] : undefined,
    });

    // Show success message
    if (status === "published") {
      toast.success("🎉 Advertisement published successfully!", {
        description: "Your property listing is now live and visible to potential tenants.",
        duration: 5000,
      });
    } else {
      toast.success("✅ Advertisement saved as draft", {
        description: "You can edit and publish it later from the dashboard.",
        duration: 4000,
      });
    }

    // Reset form
    setTitle("");
    setDescription("");
    setPropertyType("apartment");
    setBedrooms("");
    setBathrooms("");
    setPrice("");
    setPriceType("monthly");
    setLocation("");
    setSelectedAmenities([]);
    setImageUrls([]);
    setStatus("draft");
    setStep("form");
  };

  const handleClose = () => {
    setStep("form");
    onOpenChange(false);
  };

  if (step === "preview") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Advertisement</DialogTitle>
            <DialogDescription>
              Review how your advertisement will appear to potential tenants before publishing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image Gallery */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className={index === 0 ? "col-span-2" : ""}>
                    <div className={`relative ${index === 0 ? "aspect-video" : "aspect-square"} bg-neutral-100 rounded-lg overflow-hidden`}>
                      <ImageWithFallback
                        src={url}
                        alt={`Property ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Details */}
            <div>
              <h2 className="text-neutral-900 mb-2">{title}</h2>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-green-600">${price}/{priceType}</span>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-600 capitalize">{propertyType}</span>
                {bedrooms && (
                  <>
                    <span className="text-neutral-400">•</span>
                    <span className="text-neutral-600">{bedrooms} Bed, {bathrooms} Bath</span>
                  </>
                )}
              </div>
              <p className="text-neutral-700 mb-4">{description}</p>

              {/* Location */}
              <div className="mb-4">
                <h3 className="text-neutral-900 mb-2">📍 Location</h3>
                <p className="text-neutral-700">{location}</p>
              </div>

              {/* Amenities */}
              {selectedAmenities.length > 0 && (
                <div>
                  <h3 className="text-neutral-900 mb-3">✨ Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAmenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-3 py-1 bg-brand-cyan-soft text-brand-navy rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setStep("form")}>
                Back to Edit
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {status === "published" ? "Publish" : "Save as Draft"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Advertisement</DialogTitle>
          <DialogDescription>
            Create a new property advertisement with images and details to attract potential tenants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Luxury 3-Bedroom Apartment"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAIDescription}
                  disabled={isGeneratingAI}
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI Generate
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the property, its features, and what makes it special... Or click 'AI Generate' for help!"
                rows={6}
                required
              />
              <p className="text-xs text-neutral-600">
                💡 Tip: Fill in title, location, and amenities first, then use AI to generate a professional description
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <Select value={propertyType} onValueChange={(value) => setPropertyType(value as Advertisement["propertyType"])}>
                  <SelectTrigger id="propertyType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Downtown, City Center"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="e.g., 3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  placeholder="e.g., 2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 2500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceType">Price Type *</Label>
              <Select value={priceType} onValueChange={(value) => setPriceType(value as Advertisement["priceType"])}>
                <SelectTrigger id="priceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Rent</SelectItem>
                  <SelectItem value="yearly">Yearly Rent</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Property Images *</Label>
              <span className="text-sm text-neutral-600">
                {imageUrls.length} / {MAX_IMAGES} images
              </span>
            </div>
            <p className="text-sm text-neutral-600">
              Add {MIN_IMAGES} to {MAX_IMAGES} image URLs to showcase your property
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddImage())}
                disabled={imageUrls.length >= MAX_IMAGES}
              />
              <Button 
                type="button" 
                onClick={handleAddImage} 
                variant="outline"
                disabled={imageUrls.length >= MAX_IMAGES}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            
            {imageUrls.length >= MAX_IMAGES && (
              <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                ⚠️ Maximum image limit reached. Remove an image to add a new one.
              </p>
            )}
            
            {imageUrls.length === 0 && (
              <p className="text-sm text-brand-navy bg-blue-50 p-2 rounded">
                📸 Add at least 1 image to continue. Maximum {MAX_IMAGES} images allowed.
              </p>
            )}

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden group">
                    <ImageWithFallback
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-brand-navy text-white px-2 py-1 rounded text-xs">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                  />
                  <label
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm cursor-pointer"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as Advertisement["status"])}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Save as Draft</SelectItem>
                <SelectItem value="published">Publish Immediately</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-neutral-600">
              {status === "published" 
                ? "Advertisement will be visible to potential tenants"
                : "Save and continue editing later"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handlePreview}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}