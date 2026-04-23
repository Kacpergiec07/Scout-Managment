'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Helper function to create a profile for a user
async function createProfile(userId: string, email: string) {
  const supabase = await createClient()

  try {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: email.split('@')[0], // Use email prefix as default name
        email: email,
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
        reports_created_count: 0,
        assigned_region: 'Global',
        role: 'Scout',
        bio: null,
        avatar_url: null
      })
      .select()
      .single()

    if (createError) {
      console.error('createProfile: Profile creation error:', createError)
      return { error: createError.message }
    }

    console.log('createProfile: Profile created successfully:', newProfile)
    return { success: true, data: newProfile }
  } catch (error) {
    console.error('createProfile: Unexpected error:', error)
    return { error: 'An unexpected error occurred while creating profile' }
  }
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // Check if profile exists, if not create one
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      console.log('login: Profile not found, creating one...')
      await createProfile(user.id, user.email || '')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('signup: Starting signup process for:', email)

  // Step 1: Create the user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })

  if (error) {
    console.error('signup: Auth error:', error)
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  console.log('signup: Auth signup successful')
  console.log('signup: User created:', data.user?.id)
  console.log('signup: Session available:', data.session ? 'Yes' : 'No')
  console.log('signup: Email confirmation required:', !data.session)

  // Step 2: If user was created, handle profile creation
  if (data.user) {
    // Create profile immediately
    const profileResult = await createProfile(data.user.id, email)
    if (profileResult.error) {
      console.error('signup: Profile creation failed:', profileResult.error)
      // Continue anyway - profile will be created on login if needed
    }

    // Step 3: If session is available (email not confirmed or confirmation disabled), log them in
    if (data.session) {
      console.log('signup: User already has session, redirecting to dashboard')
      revalidatePath('/', 'layout')
      redirect('/dashboard')
    }
  }

  // Step 4: If no session, email confirmation is required
  revalidatePath('/', 'layout')
  redirect('/login?message=Account created! Please check your email to confirm your account.')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}