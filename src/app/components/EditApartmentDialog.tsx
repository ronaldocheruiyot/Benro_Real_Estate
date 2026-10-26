import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Apartment } from "./ApartmentCard";
import { toast } from "sonner";
import { Upload, Image as ImageIcon } from "lucide-react";

interface EditApartmentDialogProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Apartment>) => void;
}

export function EditApartmentDialog({ apartment, isOpen, onClose, onSave }: EditApartmentDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (apartment) {
      setName(apartment.name);
      setDescription(apartment.description);
      setImageUrl(apartment.imageUrl);
      setPreviewImage(apartment.imageUrl);
    }
  }, [apartment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apartment) return;

    const updates: Partial<Apartment> = {
      name: name.trim(),
      description: description.trim(),
      imageUrl: previewImage || imageUrl.trim(),
    };

    onSave(apartment.id, updates);
    toast.success("Apartment updated", {
      description: "The apartment details have been updated successfully.",
    });
    onClose();
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    setPreviewImage(url);
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

  const handleClose = () => {
    onClose();
  };

  if (!apartment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Apartment</DialogTitle>
          <DialogDescription>
            Update the apartment details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Invalid+Image+URL";
                    }}
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="size-12 mx-auto text-neutral-400 mb-2" />
                    <p className="text-neutral-500">Image preview</p>
                  </div>
                )}
              </div>

              {/* Upload Options */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-file-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <Upload className="size-5" />
                      <span>Upload New Image</span>
                    </div>
                  </Label>
                  <input
                    id="edit-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-neutral-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-neutral-500">or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-image-url">Image URL</Label>
                  <Input
                    id="edit-image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Apartment Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sunset Apartments"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the apartment features and amenities..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
