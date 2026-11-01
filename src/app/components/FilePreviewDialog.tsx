import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { ExternalLink, FileText, Image as ImageIcon } from "lucide-react";

export function isImagePath(nameOrUrl?: string, mimeType?: string): boolean {
  if (mimeType?.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|bmp|heic)$/i.test(nameOrUrl || "");
}

export function isPdfPath(nameOrUrl?: string, mimeType?: string): boolean {
  if (mimeType === "application/pdf") return true;
  return /\.pdf$/i.test(nameOrUrl || "");
}

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fileUrl: string;
  mimeType?: string;
}

export function FilePreviewDialog({
  open,
  onOpenChange,
  title,
  fileUrl,
  mimeType,
}: FilePreviewDialogProps) {
  const image = isImagePath(title || fileUrl, mimeType);
  const pdf = isPdfPath(title || fileUrl, mimeType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col gap-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 truncate pr-6">
            {image ? (
              <ImageIcon className="size-5 shrink-0 text-brand-cyan" />
            ) : (
              <FileText className="size-5 shrink-0 text-brand-cyan" />
            )}
            <span className="truncate">{title}</span>
          </DialogTitle>
          <DialogDescription>
            {image ? "Image preview" : pdf ? "Document preview" : "File preview"}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-neutral-50">
          {image ? (
            <img
              src={fileUrl}
              alt={title}
              className="mx-auto max-h-[70vh] w-auto max-w-full object-contain p-2"
            />
          ) : pdf ? (
            <iframe
              title={title}
              src={fileUrl}
              className="h-[70vh] w-full border-0 bg-white"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-muted-foreground">
              <FileText className="size-10" />
              <p>Preview is not available for this file type.</p>
              <p className="text-sm">Open it in a new tab to view or download.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" className="gap-2" asChild>
            <a href={fileUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Open in new tab
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
