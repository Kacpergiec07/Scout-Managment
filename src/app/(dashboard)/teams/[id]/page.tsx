import { getClubProfileDataAction } from "@/app/actions/statorium";
import ClubDetailsClient from "./club-details-client";
import { notFound } from "next/navigation";

export default async function TeamPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ seasonId?: string }>
}) {
  const { id } = await params;
  const { seasonId } = await searchParams;

  const data = await getClubProfileDataAction(id, seasonId);

  if (!data) {
    return notFound();
  }

  return (
    <ClubDetailsClient 
      teamDetails={data.teamDetails}
      leagueInfo={data.leagueInfo}
      standing={data.standing}
      seasonId={data.seasonId}
    />
  );
}
