'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'User not authenticated' }
  }

  const profileData = {
    full_name: formData.get('fullName') as string,
    bio: formData.get('bio') as string,
    role: formData.get('role') as string,
    region: formData.get('region') as string,
    avatar_url: formData.get('avatar_url') as string | null,
  }

  // Remove undefined values
  Object.keys(profileData).forEach(key => {
    if (profileData[key as keyof typeof profileData] === undefined) {
      delete profileData[key as keyof typeof profileData]
    }
  })

  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile', 'layout')
  revalidatePath('/settings', 'layout')
  return { success: true, data: { ...profileData, email: user.email } }
}

export async function updateNotificationPreferences(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'User not authenticated' }
  }

  const preferences = {
    email_alerts: formData.get('emailAlerts') === 'true',
    push_notifications: formData.get('pushNotifications') === 'true',
    player_updates: formData.get('playerUpdates') === 'true',
    transfer_alerts: formData.get('transferAlerts') === 'true',
    weekly_reports: formData.get('weeklyReports') === 'true',
  }

  const { error } = await supabase
    .from('profiles')
    .update({ notification_preferences: preferences as any })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings', 'layout')
  return { success: true, preferences }
}

export async function getProfileData() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profileError) {
    // If profile doesn't exist, create it
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        full_name: user.email,
        notification_preferences: {
          email_alerts: true,
          push_notifications: false,
          player_updates: true,
          transfer_alerts: true,
          weekly_reports: false
        } as any
      })
      .select()
      .single()

    if (createError) {
      return null
    }

    return {
      ...newProfile,
      email: user.email,
      id: user.id
    }
  }

  return {
    ...profile,
    email: user.email,
    id: user.id
  }
}