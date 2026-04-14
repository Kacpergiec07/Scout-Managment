'use server'

import { getStatoriumClient } from '@/lib/statorium/client';

export async function searchPlayersAction(query: string) {
  if (!query || query.length < 3) return [];
  
  try {
    const client = getStatoriumClient();
    const players = await client.searchPlayers(query);
    return players;
  } catch (error) {
    console.error('Search Players Action Error:', error);
    return [];
  }
}

export async function getPlayerDetailsAction(id: string) {
  try {
    const client = getStatoriumClient();
    const player = await client.getPlayerDetails(id);
    return player;
  } catch (error) {
    console.error('Get Player Details Action Error:', error);
    return null;
  }
}
