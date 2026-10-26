import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Trash2, Edit, AlertCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface Apartment {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  hasUnitsConfigured?: boolean; // Track if units have been added to this apartment
}

interface ApartmentCardProps {
  apartment: Apartment;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewTenants: (apartment: Apartment) => void;
  onEdit?: (apartment: Apartment) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function ApartmentCard({ 
  apartment, 
  onDelete, 
  isSelected, 
  onSelect, 
  onViewTenants,
  onEdit,
  canEdit = true,
  canDelete = true
}: ApartmentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 ${
        isSelected ? "ring-4 ring-blue-500 shadow-xl" : "hover:shadow-xl"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(apartment.id)}
    >
      {/* Square Image Container */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <ImageWithFallback
          src={apartment.imageUrl}
          alt={apartment.name}
          className="size-full object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* Action Buttons - Shows on hover */}
        <div className={`absolute top-3 right-3 flex gap-2 transition-all duration-200 ${
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}>
          {canEdit && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(apartment);
              }}
              className="size-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"
              title="Edit apartment"
            >
              <Edit className="size-5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(apartment.id);
              }}
              className="size-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
              title="Delete apartment"
            >
              <Trash2 className="size-5" />
            </button>
          )}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-3 left-3 size-6 bg-blue-500 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
            <svg
              className="size-4 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="flex-1">{apartment.name}</h3>
          {apartment.hasUnitsConfigured === false && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 flex items-center gap-1">
              <AlertCircle className="size-3" />
              No Units
            </Badge>
          )}
        </div>
        <p className="text-neutral-600 mb-4 line-clamp-2">{apartment.description}</p>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewTenants(apartment);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          View Tenants
        </Button>
      </div>
    </div>
  );
}
