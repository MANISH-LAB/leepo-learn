import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Loader2, User, Mail, Building2, GraduationCap, Calendar } from "lucide-react";

interface ProfileSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onProfileUpdate: (userData: any) => void;
}

export function ProfileSettings({ open, onOpenChange, user, onProfileUpdate }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    degree: "",
    year: "",
    passingYear: "",
  });

  // Load user data when dialog opens
  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        college: user.college || "",
        degree: user.degree || "",
        year: user.year || "",
        passingYear: user.passingYear || "",
      });
    }
  }, [open, user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        toast.error("User not found");
        return;
      }

      console.log('📝 Updating profile settings:', {
        userId: user.id,
        ...formData
      });

      const { data: updateResult, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.name,
          college: formData.college,
          degree: formData.degree,
          current_year: formData.year,
          passing_year: formData.passingYear,
        })
        .eq('id', user.id)
        .select();

      console.log('✅ Profile update result:', updateResult);

      if (error) {
        console.error('❌ Profile update error:', error);
        throw error;
      }

      // Fetch updated profile
      const { data: updatedProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id);

      const updatedProfile = updatedProfiles && updatedProfiles.length > 0 ? updatedProfiles[0] : null;

      if (updatedProfile) {
        // Update parent component with new user data
        onProfileUpdate({
          id: updatedProfile.id,
          name: updatedProfile.full_name,
          email: updatedProfile.email,
          avatar: updatedProfile.avatar_url,
          college: updatedProfile.college,
          degree: updatedProfile.degree,
          year: updatedProfile.current_year,
          passingYear: updatedProfile.passing_year,
          role: updatedProfile.role,
        });

        toast.success("Profile updated successfully!");
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("❌ Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-bold text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              className="border-2 border-black focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="border-2 border-black bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* College */}
          <div className="space-y-2">
            <Label htmlFor="college" className="font-bold text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              College/University
            </Label>
            <Input
              id="college"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              placeholder="Enter your college name"
              className="border-2 border-black focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Degree */}
          <div className="space-y-2">
            <Label htmlFor="degree" className="font-bold text-sm flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Degree
            </Label>
            <Select value={formData.degree} onValueChange={(value) => setFormData({ ...formData, degree: value })}>
              <SelectTrigger className="border-2 border-black">
                <SelectValue placeholder="Select degree" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B.Tech CSE">B.Tech CSE</SelectItem>
                <SelectItem value="B.Tech IT">B.Tech IT</SelectItem>
                <SelectItem value="B.Tech ECE">B.Tech ECE</SelectItem>
                <SelectItem value="MCA">MCA</SelectItem>
                <SelectItem value="BCA">BCA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Year */}
          <div className="space-y-2">
            <Label htmlFor="year" className="font-bold text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Current Year
            </Label>
            <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
              <SelectTrigger className="border-2 border-black">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st Year</SelectItem>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
                <SelectItem value="4">4th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Passing Year */}
          <div className="space-y-2">
            <Label htmlFor="passingYear" className="font-bold text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expected Passing Year
            </Label>
            <Select value={formData.passingYear} onValueChange={(value) => setFormData({ ...formData, passingYear: value })}>
              <SelectTrigger className="border-2 border-black">
                <SelectValue placeholder="Select passing year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
                <SelectItem value="2028">2028</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-2 border-black font-bold hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-yellow-300 transition-all font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
