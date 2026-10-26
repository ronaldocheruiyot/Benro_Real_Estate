import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { Copy, CheckCircle, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Tenant } from "./TenantsPage";

interface CreateTenantAccountDialogProps {
  tenant: Tenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTenant?: (updatedTenant: Tenant) => void;
}

export function CreateTenantAccountDialog({
  tenant,
  open,
  onOpenChange,
  onUpdateTenant,
}: CreateTenantAccountDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  // Generate username from tenant name
  const generateUsername = () => {
    const nameParts = tenant.name.toLowerCase().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const randomNum = Math.floor(Math.random() * 999);
    return `${firstName}.${lastName}${randomNum}`;
  };

  // Generate secure random password
  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one of each type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
    
    // Fill the rest
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Auto-generate on first open
  useState(() => {
    if (open && !username && !password) {
      setUsername(generateUsername());
      setPassword(generatePassword());
    }
  });

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(username);
    setCopiedUsername(true);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleRegeneratePassword = () => {
    setPassword(generatePassword());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please generate username and password");
      return;
    }

    // Update tenant with account credentials
    if (onUpdateTenant) {
      onUpdateTenant({
        ...tenant,
        hasAccount: true,
        username,
        password,
      });
    }
    
    setAccountCreated(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setAccountCreated(false);
      setUsername("");
      setPassword("");
      setShowPassword(false);
      onOpenChange(false);
    }, 3000);
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setAccountCreated(false);
    onOpenChange(false);
  };

  // Initialize username and password when dialog opens
  if (open && !username && !password && !accountCreated) {
    setUsername(generateUsername());
    setPassword(generatePassword());
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Tenant Login Account</DialogTitle>
          <DialogDescription>
            Generate login credentials for {tenant.name}
          </DialogDescription>
        </DialogHeader>

        {accountCreated ? (
          <div className="py-8 text-center">
            <CheckCircle className="size-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-green-600 mb-2">Account Created Successfully!</h3>
            <p className="text-muted-foreground">
              Login credentials have been generated for {tenant.name}.
              Make sure to share these credentials securely.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tenant Info */}
            <div className="p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Creating account for:</p>
              <p>{tenant.name}</p>
              <p className="text-sm text-muted-foreground">{tenant.email}</p>
              <p className="text-sm text-muted-foreground">Unit: {tenant.unit}</p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex gap-2">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Generated username"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUsername}
                  title="Copy username"
                >
                  {copiedUsername ? (
                    <CheckCircle className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Default Password</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Generated password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRegeneratePassword}
                  title="Regenerate password"
                >
                  <RefreshCw className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPassword}
                  title="Copy password"
                >
                  {copiedPassword ? (
                    <CheckCircle className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertDescription>
                <strong>Important:</strong> The tenant will be able to change this password after their first login.
                Make sure to share these credentials securely via email or in person.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Create Account
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}