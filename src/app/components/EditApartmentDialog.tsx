import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Apartment } from "./ApartmentCard";
import { toast } from "sonner";
import { Upload, Image as ImageIcon } from "lucide-react";

interface EditApartmentDialogProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Apartment>) => void | Promise<void>;
}

export function EditApartmentDialog({ apartment, isOpen, onClose, onSave }: EditApartmentDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<Apartment> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (apartment) {
      setName(apartment.name);
      setDescription(apartment.description);
      setPreviewImage(apartment.imageUrl);
      setConfirmSaveOpen(false);
      setPendingUpdates(null);
    }
  }, [apartment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apartment) return;

    setPendingUpdates({
      name: name.trim(),
      description: description.trim(),
      imageUrl: previewImage || apartment.imageUrl,
    });
    setConfirmSaveOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!apartment || !pendingUpdates) return;
    setSaving(true);
    try {
      await onSave(apartment.id, pendingUpdates);
      toast.success("Apartment updated", {
        description: "Your changes have been saved.",
      });
      setConfirmSaveOpen(false);
      setPendingUpdates(null);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
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
    setConfirmSaveOpen(false);
    setPendingUpdates(null);
    onClose();
  };

  if (!apartment) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Apartment</DialogTitle>
            <DialogDescription>
              Update the apartment details below. You will confirm before changes are saved.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label>Property Image *</Label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x300?text=Invalid+Image";
                      }}
                    />
                  ) : (
                    <div className="p-4 text-center">
                      <ImageIcon className="mx-auto mb-2 size-12 text-neutral-400" />
                      <p className="text-neutral-500">Image preview</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center space-y-3">
                  <Label htmlFor="edit-file-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 p-4 transition-colors hover:border-brand-cyan hover:bg-brand-cyan-soft">
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
                  <p className="text-center text-xs text-muted-foreground">
                    JPG, PNG, or WEBP
                  </p>
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
              <Button type="submit" className="bg-brand-navy text-white hover:bg-brand-navy-deep">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm save changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to update <strong>{apartment.name}</strong>
              {pendingUpdates?.name && pendingUpdates.name !== apartment.name
                ? ` (renamed to “${pendingUpdates.name}”)`
                : ""}
              . Make sure the name, description, and image look correct before saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmSave();
              }}
              disabled={saving}
              className="bg-brand-navy text-white hover:bg-brand-navy-deep"
            >
              {saving ? "Saving…" : "Yes, save changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
