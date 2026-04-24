import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { TransferWarRoom } from "@/components/scout/transfer-war-room";

export default function TransfersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin shadow-[0_0_20px_rgba(0,255,136,0.2)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground font-bold tracking-[0.2em] uppercase text-[10px] mt-8">
            Synchronizing Market Intelligence...
          </p>
        </div>
      }
    >
      <TransferWarRoom />
    </Suspense>
  );
}
