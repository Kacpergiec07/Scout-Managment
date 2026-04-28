import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function listCachedPlayers() {
  const { data, error } = await supabase
    .from('cached_players')
    .select('id, player_name, league_id, team_name, stats')
    .limit(10);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log(`Found ${data.length} cached players.`);
  data.forEach(p => {
    console.log(`- ${p.player_name} (ID: ${p.id}, Team: ${p.team_name})`);
    if (p.stats) {
      console.log(`  Stats: ${JSON.stringify(p.stats).substring(0, 100)}...`);
    }
  });
}

listCachedPlayers();
