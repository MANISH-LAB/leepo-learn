import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Smartphone } from "lucide-react";

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileAppModal({ isOpen, onClose }: MobileAppModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white p-8 gap-0">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              <Smartphone className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Coming Soon!
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              Mobile app will be available soon.
            </p>
            <p className="text-sm text-gray-500">
              Stay tuned for updates!
            </p>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold h-12 text-base"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
