import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Apartment } from "./ApartmentCard";

interface AddApartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (apartment: Omit<Apartment, "id">) => void;
}

export function AddApartmentDialog({ open, onOpenChange, onAdd }: AddApartmentDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [units, setUnits] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description) {
      alert("Please fill in all required fields");
      return;
    }

    const newApartment: Omit<Apartment, "id"> = {
      name,
      description,
      imageUrl: previewImage || "https://images.unsplash.com/photo-1515263487990-61b07816b324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjAzNjMxMTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    };

    onAdd(newApartment);
    
    // Reset form
    setName("");
    setDescription("");
    setAddress("");
    setUnits("");
    setPreviewImage("");
    onOpenChange(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Apartment</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new apartment property to your portfolio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label>Property Image *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Preview */}
                <div className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="size-12 mx-auto text-neutral-400 mb-2" />
                      <p className="text-neutral-500">Image preview</p>
                    </div>
                  )}
                </div>

                {/* Upload */}
                <div className="flex flex-col justify-center space-y-3">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 p-4 transition-colors hover:border-brand-cyan hover:bg-brand-cyan-soft">
                      <Upload className="size-5" />
                      <span>Upload Image</span>
                    </div>
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-center text-xs text-muted-foreground">
                    JPG, PNG, or WEBP
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sunset Apartments"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="units">Number of Units</Label>
                <Input
                  id="units"
                  type="number"
                  placeholder="e.g., 24"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="e.g., 123 Main Street, City, State 12345"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the property, amenities, features, location benefits, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-brand-navy text-white hover:bg-brand-navy-deep">
              Add Apartment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
