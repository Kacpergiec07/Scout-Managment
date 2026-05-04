import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrate() {
  console.log('🚀 Migrating jobs table...')

  const sql = `
    ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_elite BOOLEAN DEFAULT FALSE;
    ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_priority_check;
    ALTER TABLE jobs ADD CONSTRAINT jobs_priority_check CHECK (priority IN ('high', 'medium', 'low', 'elite'));
  `;

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  for (const statement of statements) {
    console.log(`Executing: ${statement}`)
    const { error } = await supabase.rpc('exec_sql', { sql: statement })
    if (error) {
      console.error('Error:', error)
    } else {
      console.log('Success')
    }
  }
}

migrate()
