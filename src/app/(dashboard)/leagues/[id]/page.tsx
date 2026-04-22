import { getStandingsAction, getSeasonDetailsAction } from "@/app/actions/statorium";
import LeagueDetailsClient from "./league-details-client";

export default async function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch data on the server
  const [standings, leagueInfo] = await Promise.all([
    getStandingsAction(id),
    getSeasonDetailsAction(id)
  ]);

  return (
    <LeagueDetailsClient 
      id={id} 
      initialStandings={standings || []} 
      initialLeagueInfo={leagueInfo} 
    />
  );
}
