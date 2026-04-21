import { NextRequest, NextResponse } from 'next/server';
import { getMarketValue } from '@/lib/transfermarkt';
import { unstable_cache } from 'next/cache';

// Cache the scraper results for 24 hours
const getCachedMarketValue = (playerName: string) => 
  unstable_cache(
    async (name: string) => getMarketValue(name),
    [`market-value-${playerName}`],
    {
      revalidate: 86400, // 24 hours in seconds
      tags: ['market-value']
    }
  )(playerName);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playerName: string }> }
) {
  try {
    // Await params if using Next.js 15+
    const { playerName } = await params;
    
    if (!playerName) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    const decodedName = decodeURIComponent(playerName);
    const data = await getCachedMarketValue(decodedName);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error fetching market value:', error);
    return NextResponse.json(
      { value: null, formatted: 'N/A' },
      { status: 500 }
    );
  }
}
