import { Flame, Trophy } from "lucide-react";
import { Button } from "../ui/button";

interface StudentStatsProps {
  streak?: number;
  xp?: number;
  onUpgrade?: () => void;
}

export function StudentStats({ streak = 0, xp = 0, onUpgrade }: StudentStatsProps) {
  const formatXP = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="flex items-center gap-1 md:gap-4 mr-0 md:mr-2">
      {/* Streak */}
      <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-full hover:bg-muted/50 transition-colors cursor-help" title={`${streak} Day Streak`}>
        <Flame className="h-4 w-4 md:h-5 md:w-5 text-orange-500 fill-orange-500" />
        <span className="font-bold text-xs md:text-sm text-foreground">{streak}</span>
      </div>

      {/* Coins/XP */}
      <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-full hover:bg-muted/50 transition-colors cursor-help" title={`${xp} Total XP`}>
        <Trophy className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
        <span className="font-bold text-xs md:text-sm text-foreground">{formatXP(xp)}</span>
      </div>

      {/* Upgrade Button - Visible on larger screens */}
      <Button
        size="sm"
        onClick={onUpgrade}
        className="hidden lg:flex bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md h-8 text-xs font-bold px-4 rounded-full"
      >
        Upgrade
      </Button>
    </div>
  );
}
