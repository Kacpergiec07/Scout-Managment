import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LeagueGalaxy } from "@/components/scout/league-galaxy";

export const metadata = {
  title: "League Galaxy | ScoutPro",
  description: "Explore world football leagues in a dynamic galaxy visualization.",
};

export default function LeaguesPage() {
  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-black text-white">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
            <p className="text-zinc-400 font-medium tracking-widest uppercase text-xs">
              Aligning Galactic Coordinates...
            </p>
          </div>
        }
      >
        <LeagueGalaxy />
      </Suspense>
    </div>
  );
}
