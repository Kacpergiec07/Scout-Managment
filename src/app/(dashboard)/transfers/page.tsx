import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { TransferWarRoom } from "@/components/scout/transfer-war-room";
import { VERIFIED_TRANSFERS } from "@/lib/statorium-data";
import { getPlayerPhotosAction, getTeamLogosAction } from "@/app/actions/statorium";

export default async function TransfersPage() {
  // Extract players for photo fetching
  const playersToFetch = VERIFIED_TRANSFERS.map(t => ({
    playerID: t.playerID,
    playerName: t.playerName
  }));
  
  // Extract unique team IDs for logo fetching
  const teamIds = new Set<string>();
  VERIFIED_TRANSFERS.forEach(t => {
    if (t.fromTeamID) teamIds.add(t.fromTeamID);
    if (t.toTeamID) teamIds.add(t.toTeamID);
  });

  // Fetch from API in parallel
  const [photos, logos] = await Promise.all([
    getPlayerPhotosAction(playersToFetch),
    getTeamLogosAction(Array.from(teamIds))
  ]);

  // Enrich transfers with API data
  const enrichedTransfers = VERIFIED_TRANSFERS.map(t => ({
    ...t,
    photoUrl: photos[t.playerID] || t.photoUrl,
    fromTeamLogo: logos[t.fromTeamID] || (t as any).fromTeamLogo || "",
    toTeamLogo: logos[t.toTeamID] || (t as any).toTeamLogo || ""
  }));

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[500px] bg-background">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-secondary/20 border-t-primary animate-spin shadow-[0_0_20px_hsl(var(--secondary) / 0.2)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-secondary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground font-bold tracking-[0.2em] uppercase text-[10px] mt-8 animate-pulse">
            Synchronizing Market Intelligence...
          </p>
        </div>
      }
    >
      <TransferWarRoom transfers={enrichedTransfers} />
    </Suspense>
  );
}
