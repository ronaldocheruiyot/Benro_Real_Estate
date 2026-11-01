import { useEffect, useRef, useState } from "react";
import { Navigation } from "./Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Save,
  X,
} from "lucide-react";
import { UserRole } from "./UserManagementPage";
import { useAppData } from "../context/AppDataContext";
import { uploadsApi } from "../api/services";
import { assetUrl } from "../api/client";
import { toast } from "sonner";

interface ProfilePageProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentUser?: UserRole;
}

function formatJoinDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ProfilePage({ onLogout, onNavigate, currentUser }: ProfilePageProps) {
  const { apartments, tenants, updateProfile } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name || "");
    setEmail(currentUser.email || "");
    setPhone(currentUser.phone || "");
    setAddress(currentUser.address || "");
    setAvatar(currentUser.avatar || "");
  }, [currentUser]);

  const roleLabel = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : "—";

  const avatarSrc =
    assetUrl(avatar) ||
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80";

  const initials = (name || currentUser?.name || "?").charAt(0).toUpperCase();

  const stats = [
    { label: "Total Properties", value: String(apartments.length) },
    {
      label: "Active Tenants",
      value: String(tenants.filter((t) => t.status === "active").length),
    },
    {
      label: "Vacant / Left",
      value: String(tenants.filter((t) => t.status !== "active").length),
    },
    {
      label: "Assigned Properties",
      value: String(currentUser?.assignedProperties?.length || apartments.length),
    },
  ];

  const startEditing = () => {
    if (!currentUser) return;
    setName(currentUser.name || "");
    setEmail(currentUser.email || "");
    setPhone(currentUser.phone || "");
    setAddress(currentUser.address || "");
    setAvatar(currentUser.avatar || "");
    setEditing(true);
  };

  const cancelEditing = () => {
    if (!currentUser) return;
    setName(currentUser.name || "");
    setEmail(currentUser.email || "");
    setPhone(currentUser.phone || "");
    setAddress(currentUser.address || "");
    setAvatar(currentUser.avatar || "");
    setEditing(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        avatar,
      });
      toast.success("Profile updated");
      setEditing(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    setUploadingPhoto(true);
    try {
      const uploaded = await uploadsApi.file("avatars", file);
      const nextAvatar = uploaded.url;
      setAvatar(nextAvatar);
      if (!editing) {
        await updateProfile({ avatar: nextAvatar });
        toast.success("Photo updated");
      } else {
        toast.success("Photo ready — save profile to keep it");
      }
    } catch (err: any) {
      // Fallback: local preview if upload endpoint fails
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setAvatar(dataUrl);
        if (!editing) {
          try {
            await updateProfile({ avatar: dataUrl });
            toast.success("Photo updated");
          } catch (saveErr: any) {
            toast.error(saveErr?.message || "Failed to save photo");
          }
        }
      };
      reader.readAsDataURL(file);
      if (err?.message) toast.message("Using local photo preview");
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="size-full flex flex-col bg-neutral-50">
      <Navigation onLogout={onLogout} onNavigate={onNavigate} currentView="profile" currentUser={currentUser} />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl">My Profile</h1>
            <p className="mt-1 text-sm text-neutral-600 sm:text-base">
              Manage your account information and preferences
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Profile Information</CardTitle>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      <X className="size-4" />
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="gap-2 bg-brand-navy text-white hover:bg-brand-navy-deep"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <Save className="size-4" />
                      {saving ? "Saving…" : "Save Changes"}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="gap-2" onClick={startEditing}>
                    <Edit className="size-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="size-32">
                    <AvatarImage src={avatarSrc} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={uploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingPhoto ? "Uploading…" : "Change Photo"}
                  </Button>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      readOnly={!editing}
                      className={!editing ? "bg-muted/40" : undefined}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={roleLabel} readOnly className="bg-muted/40" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 shrink-0 text-neutral-400" />
                      <Input
                        id="profile-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        readOnly={!editing}
                        className={`flex-1 ${!editing ? "bg-muted/40" : ""}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 shrink-0 text-neutral-400" />
                      <Input
                        id="profile-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        readOnly={!editing}
                        placeholder={editing ? "e.g. +1 (555) 123-4567" : undefined}
                        className={`flex-1 ${!editing ? "bg-muted/40" : ""}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="profile-address">Address</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0 text-neutral-400" />
                      <Input
                        id="profile-address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        readOnly={!editing}
                        placeholder={editing ? "Street, city, postal code" : undefined}
                        className={`flex-1 ${!editing ? "bg-muted/40" : ""}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 shrink-0 text-neutral-400" />
                      <Input
                        value={formatJoinDate(currentUser?.createdDate)}
                        readOnly
                        className="flex-1 bg-muted/40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="mb-2 text-muted-foreground">{stat.label}</p>
                    <p className="text-brand-cyan">{stat.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer border-2 border-blue-100 transition-shadow hover:shadow-lg">
            <CardContent className="pt-6">
              <button
                onClick={() => onNavigate("financialReports")}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-neutral-900">Financial Reports & Analytics</h3>
                    <p className="text-neutral-600">
                      View detailed income reports, payment history, and analytics from all properties
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Revenue Tracking
                      </span>
                      <span>• Advanced Filters</span>
                      <span>• Export Reports</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 shrink-0 text-brand-cyan" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
