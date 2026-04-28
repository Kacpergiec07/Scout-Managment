import { createClient } from '../src/lib/supabase/server';

async function main() {
  const supabase = await createClient();
  const { data: cachedPlayer } = await supabase
    .from('cached_players')
    .select('*')
    .limit(1)
    .single();

  if (cachedPlayer) {
    console.log(JSON.stringify(cachedPlayer.stats[0], null, 2));
  } else {
    console.log("No players found in cache.");
  }
}

main().catch(console.error);
