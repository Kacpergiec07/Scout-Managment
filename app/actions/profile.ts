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
    console.error('UpdateProfile: User not authenticated')
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

  console.log('UpdateProfile: Attempting to update profile:', profileData)

  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('UpdateProfile: Database error:', error)
    return { error: error.message }
  }

  console.log('UpdateProfile: Profile updated successfully')
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
    console.error('UpdateNotificationPreferences: User not authenticated')
    return { error: 'User not authenticated' }
  }

  const preferences = {
    email_alerts: formData.get('emailAlerts') === 'true',
    push_notifications: formData.get('pushNotifications') === 'true',
    player_updates: formData.get('playerUpdates') === 'true',
    transfer_alerts: formData.get('transferAlerts') === 'true',
    weekly_reports: formData.get('weeklyReports') === 'true',
  }

  console.log('UpdateNotificationPreferences: Attempting to update preferences:', preferences)

  const { error } = await supabase
    .from('profiles')
    .update({ notification_preferences: preferences as any })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('UpdateNotificationPreferences: Database error:', error)
    return { error: error.message }
  }

  console.log('UpdateNotificationPreferences: Preferences updated successfully')
  revalidatePath('/settings', 'layout')
  return { success: true, preferences }
}

export async function getProfileData() {
  console.log('getProfileData: Starting profile data fetch...')

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      console.error('getProfileData: Auth error:', userError)
      return null
    }

    if (!user) {
      console.error('getProfileData: No user found')
      return null
    }

    console.log('getProfileData: User authenticated, fetching profile...', user.id)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('getProfileData: Database error:', profileError)
      // If profile doesn't exist, create it
      console.log('getProfileData: Profile not found, attempting to create...')

      try {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
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
          console.error('getProfileData: Profile creation error:', createError)
          return null
        }

        console.log('getProfileData: Profile created successfully:', newProfile)
        return {
          ...newProfile,
          email: user.email,
          id: user.id
        }
      } catch (error) {
        console.error('getProfileData: Profile creation failed:', error)
        return null
      }
    }

    if (!profile) {
      console.warn('getProfileData: No profile data returned')
      return null
    }

    console.log('getProfileData: Profile data fetched successfully:', profile)
    return {
      ...profile,
      email: user.email,
      id: user.id
    }
  } catch (error) {
    console.error('getProfileData: Unexpected error:', error)
    return null
  }
}