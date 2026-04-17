import { LeagueCenter } from "@/components/scout/league-center";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'League Center | ScoutPro',
  description: 'Top 5 European Leagues standings, fixtures, and squad analytics.',
};

export default function LeaguesPage() {
  return (
    <div className="container mx-auto p-6">
      <LeagueCenter />
    </div>
  );
}
