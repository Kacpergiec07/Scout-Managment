import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LeagueTacticalHub } from "@/components/scout/league-tactical-hub";

export default function LeaguesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-secondary animate-spin shadow-[0_0_20px_hsl(var(--secondary) / 0.2)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-secondary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground font-bold tracking-[0.2em] uppercase text-[10px] mt-8">
            Initializing Tactical Matrix...
          </p>
        </div>
      }
    >
      <LeagueTacticalHub />
    </Suspense>
  );
}
