import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Advertisement } from "./AdvertisementPage";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MapPin, Bed, Bath, DollarSign, Share2, Phone, Mail } from "lucide-react";
import { Badge } from "./ui/badge";

interface PreviewAdvertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advertisement: Advertisement;
}

export function PreviewAdvertDialog({ open, onOpenChange, advertisement }: PreviewAdvertDialogProps) {
  const handleShare = () => {
    const shareText = `Check out: ${advertisement.title}\n${advertisement.description}\nPrice: $${advertisement.price}/${advertisement.priceType}\nLocation: ${advertisement.location}`;
    
    if (navigator.share) {
      navigator.share({
        title: advertisement.title,
        text: shareText,
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        alert("Details copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Details copied to clipboard!");
    }
  };

  const handleContact = () => {
    alert("In a real application, this would open a contact form or show contact details.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Advertisement Preview</DialogTitle>
            <Badge 
              className={
                advertisement.status === "published" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-yellow-100 text-yellow-700"
              }
            >
              {advertisement.status}
            </Badge>
          </div>
          <DialogDescription>
            View full details of this property advertisement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Gallery */}
          {advertisement.images.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4 md:col-span-3">
                <div className="aspect-video bg-neutral-100 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={advertisement.images[0]}
                    alt={advertisement.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {advertisement.images.length > 1 && (
                <div className="col-span-4 md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-4">
                  {advertisement.images.slice(1, 4).map((img, index) => (
                    <div key={index} className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={img}
                        alt={`${advertisement.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {advertisement.images.length > 4 && (
                    <div className="aspect-square bg-neutral-900/80 rounded-lg flex items-center justify-center text-white">
                      +{advertisement.images.length - 4} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-neutral-100 rounded-lg flex items-center justify-center">
              <p className="text-neutral-500">No images available</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Title and Price */}
              <div>
                <h2 className="text-neutral-900 mb-3">{advertisement.title}</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-2xl">${advertisement.price}</span>
                    <span className="text-neutral-600">/ {advertisement.priceType}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-neutral-700">
                  <div className="flex items-center gap-2">
                    <span className="capitalize px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {advertisement.propertyType}
                    </span>
                  </div>
                  {advertisement.bedrooms && (
                    <>
                      <div className="flex items-center gap-2">
                        <Bed className="h-5 w-5 text-neutral-600" />
                        <span>{advertisement.bedrooms} Bedrooms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bath className="h-5 w-5 text-neutral-600" />
                        <span>{advertisement.bathrooms} Bathrooms</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-neutral-600" />
                    <span>{advertisement.location}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-neutral-900 mb-3">Description</h3>
                <p className="text-neutral-700 whitespace-pre-line">{advertisement.description}</p>
              </div>

              {/* Amenities */}
              {advertisement.amenities.length > 0 && (
                <div>
                  <h3 className="text-neutral-900 mb-3">Amenities & Features</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {advertisement.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-600 rounded-full" />
                        <span className="text-neutral-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg">
                <div>
                  <p className="text-neutral-600">Views</p>
                  <p className="text-neutral-900">👁 {advertisement.views}</p>
                </div>
                <div>
                  <p className="text-neutral-600">Inquiries</p>
                  <p className="text-neutral-900">💬 {advertisement.inquiries}</p>
                </div>
                <div>
                  <p className="text-neutral-600">Listed Date</p>
                  <p className="text-neutral-900">
                    {advertisement.publishedDate || advertisement.createdDate}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-600">Property ID</p>
                  <p className="text-neutral-900">#{advertisement.id}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Contact Card */}
              <div className="border rounded-lg p-6 space-y-4 bg-white sticky top-4">
                <h3 className="text-neutral-900">Interested in this property?</h3>
                <p className="text-neutral-600 text-sm">
                  Contact us for more information or to schedule a viewing.
                </p>
                
                <Button className="w-full" onClick={handleContact}>
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Agent
                </Button>
                
                <Button variant="outline" className="w-full" onClick={handleContact}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                
                <Button variant="outline" className="w-full" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Listing
                </Button>

                <div className="pt-4 border-t text-center">
                  <p className="text-xs text-neutral-600">
                    This is a preview. In a live listing, contact details and inquiry forms would be active.
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border rounded-lg p-6 bg-blue-50">
                <h4 className="text-blue-900 mb-2">💡 Viewing Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Schedule viewings in advance</li>
                  <li>• Ask about move-in dates</li>
                  <li>• Inquire about lease terms</li>
                  <li>• Check neighborhood amenities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}