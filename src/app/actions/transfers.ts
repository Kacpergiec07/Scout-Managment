'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface TransferRecord {
  id?: string
  player_id: string
  player_name: string
  from_team_id: string
  from_team_name: string
  from_team_logo: string
  to_team_id: string
  to_team_name: string
  to_team_logo: string
  fee: string
  market_value: string
  photo_url: string
  position: string
  nationality: string
}

export async function addTransferAction(transfer: TransferRecord) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('transfers')
    .insert([{
      ...transfer,
      user_id: user.id
    }])
    .select()

  if (error) {
    console.error('Error adding transfer:', error)
    return { error: error.message }
  }

  revalidatePath('/scout/transfers')
  return { success: true, data }
}

export async function getTransfersAction() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transfers:', error)
    return []
  }

  return data
}

export async function deleteTransferAction(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('transfers')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting transfer:', error)
    return { error: error.message }
  }

  revalidatePath('/scout/transfers')
  return { success: true }
}
