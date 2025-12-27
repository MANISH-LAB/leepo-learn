import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Menu, Zap, Gem, Shield, GraduationCap, LayoutDashboard, User, Settings, LogOut } from "lucide-react";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface MobileNavProps {
  user: any;
  currentView: "student" | "admin";
  setCurrentView: (view: "student" | "admin") => void;
  onLogout: () => void;
  onUpgrade?: () => void;
}

export function MobileNav({ user, currentView, setCurrentView, onLogout, onUpgrade }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left flex items-center gap-2">
            {currentView === "admin" ? (
              <Shield className="h-6 w-6 text-red-600" />
            ) : (
              <GraduationCap className="h-6 w-6 text-blue-600" />
            )}
            Leepo Learn
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-6 py-6 h-full">
          {/* User Profile Section if logged in */}
          {user ? (
            <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          ) : (
             <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-blue-800 mb-2">Join Leepo Learn today!</p>
             </div>
          )}

          {/* Stats for Mobile */}
          {user && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-yellow-50/50 border border-yellow-100">
                 <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500 mb-1" />
                 <span className="text-sm font-bold">3 Day Streak</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                 <Gem className="h-5 w-5 text-blue-500 fill-blue-500 mb-1" />
                 <span className="text-sm font-bold">1,250 XP</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Navigation Links - Only show admin option for manishkalyan141@gmail.com */}
          {user && user.email === 'manishkalyan141@gmail.com' && (
            <nav className="flex flex-col gap-2">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">Switch View</h4>
              <Button
                  variant={currentView === "student" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setCurrentView("student")}
              >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Student Dashboard
              </Button>
              <Button
                  variant={currentView === "admin" ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => setCurrentView("admin")}
              >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
              </Button>
            </nav>
          )}

          <Separator />

          {/* Account Links */}
          {user && (
             <nav className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-2 px-2">Account</h4>
                <Button variant="ghost" className="justify-start">
                    <User className="mr-2 h-4 w-4" /> Profile
                </Button>
                <Button variant="ghost" className="justify-start">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
                <Button variant="ghost" className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                </Button>
             </nav>
          )}

          {/* Upgrade CTA */}
          <div className="mt-auto">
             <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-4 text-white shadow-lg">
                <h4 className="font-bold mb-1 flex items-center gap-2">
                    <Gem className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                    Go Premium
                </h4>
                <p className="text-xs text-indigo-100 mb-3">Unlock all courses and advanced analytics.</p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onUpgrade}
                  className="w-full text-indigo-700 font-bold hover:bg-white"
                >
                    Upgrade Now
                </Button>
             </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
