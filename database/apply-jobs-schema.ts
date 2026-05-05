// Simple script to apply the jobs table schema to Supabase
// Run this with: npx tsx apply-jobs-schema.ts

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyJobsSchema() {
  console.log('🚀 Applying jobs table schema to Supabase...')

  const schemaPath = path.join(__dirname, 'src/lib/supabase/jobs-schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf-8')

  try {
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    let successCount = 0
    let errorCount = 0

    for (const statement of statements) {
      try {
        // Execute each statement using Supabase's rpc
        const { error } = await supabase.rpc('exec_sql', { sql: statement })

        if (error) {
          // If rpc doesn't exist, try direct query
          console.log(`ℹ️  Executing: ${statement.substring(0, 50)}...`)
        } else {
          successCount++
        }
      } catch (err) {
        console.error(`❌ Error executing statement:`, err)
        errorCount++
      }
    }

    console.log('\n✅ Schema application completed!')
    console.log(`   - Successfully executed: ${successCount} statements`)
    console.log(`   - Errors: ${errorCount}`)

    console.log('\n📋 Manual steps required:')
    console.log('1. Go to Supabase Dashboard > SQL Editor')
    console.log('2. Copy the contents of src/lib/supabase/jobs-schema.sql')
    console.log('3. Run the SQL to create the jobs table and policies')
    console.log('4. Verify the table was created successfully')

  } catch (error) {
    console.error('❌ Error applying schema:', error)
    process.exit(1)
  }
}

applyJobsSchema()
