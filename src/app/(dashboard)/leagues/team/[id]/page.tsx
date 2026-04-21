import { getTeamDetailsAction } from "@/app/actions/statorium";
import { notFound } from "next/navigation";
import { TeamContent } from "./team-content";

export default async function TeamPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ seasonId?: string }>
}) {
  const { id } = await params;
  const { seasonId } = await searchParams;
  const team = await getTeamDetailsAction(id, seasonId);

  if (!team) {
    notFound();
  }

  return <TeamContent team={team} />;
}
