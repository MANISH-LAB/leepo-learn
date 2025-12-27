import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { User, Settings, LogOut, LayoutDashboard, Shield } from "lucide-react";

interface HeaderProfileProps {
  user: {
      name: string;
      email: string;
      avatar?: string;
      role?: "student" | "admin";
  };
  onLogout: () => void;
  onStudentDashboard: () => void;
  onAdminDashboard: () => void;
  onProfileSettings: () => void;
}

export function HeaderProfile({ user, onLogout, onStudentDashboard, onAdminDashboard, onProfileSettings }: HeaderProfileProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {user.email === 'manishkalyan141@gmail.com' && (
            <DropdownMenuItem onClick={onAdminDashboard} className="bg-red-50 text-red-700 focus:bg-red-100 focus:text-red-800">
               <Shield className="mr-2 h-4 w-4" />
               <span>Admin Panel</span>
            </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onStudentDashboard}>
           <LayoutDashboard className="mr-2 h-4 w-4" />
           <span>Student Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onProfileSettings}>
           <User className="mr-2 h-4 w-4" />
           <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
