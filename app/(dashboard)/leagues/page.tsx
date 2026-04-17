import { LeagueCenter } from "@/components/scout/league-center";
import { Metadata } from 'next';
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: 'League Center | ScoutPro',
  description: 'Top 5 European Leagues standings, fixtures, and squad analytics.',
};

export default function LeaguesPage() {
  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
          <p className="text-zinc-400 font-medium">Synchronizing Global League Data...</p>
        </div>
      }>
        <LeagueCenter />
      </Suspense>
    </div>
  );
}
