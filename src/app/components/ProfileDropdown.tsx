import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { User, Settings, HelpCircle, LogOut } from "lucide-react";
import { UserRole } from "./UserManagementPage";

interface ProfileDropdownProps {
  onLogout?: () => void;
  onNavigate?: (view: string) => void;
  currentUser?: UserRole;
}

export function ProfileDropdown({ onLogout, onNavigate, currentUser }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const userInfo = {
    name: currentUser?.name || "John Doe",
    email: currentUser?.email || "john.doe@example.com",
    role: currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : "Property Manager",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NjAzOTUxMjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
  };

  const menuItems = [
    {
      icon: <User className="size-4" />,
      label: "My Profile",
      onClick: () => {
        onNavigate?.("profile");
        setIsOpen(false);
      },
    },
    {
      icon: <Settings className="size-4" />,
      label: "Settings",
      onClick: () => {
        onNavigate?.("settings");
        setIsOpen(false);
      },
    },
    {
      icon: <HelpCircle className="size-4" />,
      label: "Help & Support",
      onClick: () => {
        onNavigate?.("help");
        setIsOpen(false);
      },
    },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity p-0 h-auto"
        >
          <Avatar className="size-10 border-2 border-white">
            <AvatarImage src={userInfo.avatar} />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        {/* User Info Section */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarImage src={userInfo.avatar} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate">{userInfo.name}</p>
              <p className="text-muted-foreground truncate">{userInfo.email}</p>
            </div>
          </div>
          <div className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md inline-block">
            {userInfo.role}
          </div>
        </div>

        <Separator />

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              onClick={item.onClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-100 transition-colors text-left justify-start"
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          ))}
        </div>

        <Separator />

        {/* Logout */}
        <div className="p-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsOpen(false);
              onLogout?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 rounded-md transition-colors justify-start"
          >
            <LogOut className="size-4" />
            <span>Logout</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}