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

  const profileData: any = {
    full_name: formData.get('fullName') as string,
    bio: formData.get('bio') as string,
    role: formData.get('role') as string,
    assigned_region: formData.get('assigned_region') as string,
    avatar_url: formData.get('avatar_url') as string | null,
  }

  // Only add statistics fields if they have values
  const yearsExperience = formData.get('yearsExperience')
  if (yearsExperience) {
    profileData.years_experience = parseInt(yearsExperience as string)
  }

  console.log('UpdateProfile: Profile data to update:', profileData)

  console.log('UpdateProfile: Attempting to update profile:', profileData)

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('UpdateProfile: Database error:', error)
      console.error('UpdateProfile: Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return { error: error.message }
    }

    console.log('UpdateProfile: Profile updated successfully:', data)
    revalidatePath('/profile', 'layout')
    revalidatePath('/settings', 'layout')
    return {
      success: true,
      data: {
        ...profileData,
        email: user.email
      }
    }
  } catch (error) {
    console.error('UpdateProfile: Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
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

    // Fetch profile data
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
            } as any,
            years_experience: 0,
            players_watched_count: 0,
            active_scouting_count: 0,
            reports_created_count: 0
          })
          .select()
          .single()

        if (createError) {
          console.error('getProfileData: Profile creation error:', createError)
          return null
        }

        console.log('getProfileData: Profile created successfully:', newProfile)
        profile = newProfile
      } catch (error) {
        console.error('getProfileData: Profile creation failed:', error)
        return null
      }
    }

    if (!profile) {
      console.warn('getProfileData: No profile data returned')
      return null
    }

    // Fetch real counts from database
    console.log('getProfileData: Fetching real statistics...')

    // Count players on watchlist - use auth.uid() for current user
    console.log('getProfileData: Using user.id:', user.id)

    const { count: totalWatched } = await supabase
      .from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    console.log('getProfileData: Total players watched:', totalWatched)

    // Count active scouting (players with 'following', 'priority', or 'analyzing' status)
    const { count: activeScouting } = await supabase
      .from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['following', 'priority', 'analyzing'])

    console.log('getProfileData: Active scouting count:', activeScouting)

    // Count analysis history (reports)
    const { count: totalReports } = await supabase
      .from('analysis_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    console.log('getProfileData: Total reports created:', totalReports)

    console.log('getProfileData: Profile data fetched successfully:', profile)
    return {
      ...profile,
      email: user.email,
      players_watched_count: totalWatched || 0,
      active_scouting_count: activeScouting || 0,
      reports_created_count: totalReports || 0
    }
  } catch (error) {
    console.error('getProfileData: Unexpected error:', error)
    return null
  }
}