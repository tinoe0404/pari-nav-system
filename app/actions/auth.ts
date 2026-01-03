// app/actions/auth.ts (FIXED WITH DEBUGGING)
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Get user role to determine redirect
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    revalidatePath('/', 'layout')
    
    if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
      redirect('/admin/dashboard')
    } else {
      redirect('/dashboard')
    }
  }

  redirect('/login?error=Login+failed')
}

export async function loginAdmin(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  console.log('=== ADMIN LOGIN DEBUG ===')
  console.log('Attempting admin login for:', data.email)

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Auth error:', error)
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`)
  }

  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    console.log('User authenticated:', user.id)
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile lookup error:', profileError)
      await supabase.auth.signOut()
      redirect(`/admin/login?error=${encodeURIComponent('Database error querying schema')}`)
    }

    console.log('Profile found:', profile)

    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
      console.log('User role check failed. Role:', profile?.role)
      await supabase.auth.signOut()
      redirect('/admin/login?error=Unauthorized%3A+Admin+access+required')
    }

    console.log('Admin access granted!')
    revalidatePath('/', 'layout')
    redirect('/admin/dashboard')
  }

  redirect('/admin/login?error=Login+failed')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const fullName = formData.get('full_name') as string
  const dob = formData.get('dob') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('=== SIGNUP DEBUG START ===')
  console.log('Attempting signup for:', email)

  // Step 1: Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        dob: dob,
      }
    }
  })

  if (authError) {
    console.error('Auth signup error:', authError)
    redirect(`/register?error=${encodeURIComponent(authError.message)}`)
  }

  if (!authData.user) {
    console.error('No user returned from signup')
    redirect(`/register?error=${encodeURIComponent('Signup failed - no user created')}`)
  }

  console.log('Auth user created:', authData.user.id)

  // Step 2: Wait a moment for the database trigger to create the profile
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Step 3: Generate MRN
  console.log('Generating MRN...')
  const { data: mrnData, error: mrnError } = await supabase.rpc('generate_mrn')
  
  if (mrnError) {
    console.error('MRN generation error:', mrnError)
    redirect(`/register?error=${encodeURIComponent('Failed to generate patient ID')}`)
  }

  console.log('MRN generated:', mrnData)

  // Step 4: Create patient record
  console.log('Creating patient record...')
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .insert({
      user_id: authData.user.id,
      mrn: mrnData,
      full_name: fullName,
      dob: dob,
      current_status: 'REGISTERED',
      onboarding_completed: false,
      medical_history: null,
    })
    .select()
    .single()

  if (patientError) {
    console.error('Patient creation error:', patientError)
    console.error('Attempted to insert:', {
      user_id: authData.user.id,
      mrn: mrnData,
      full_name: fullName,
      dob: dob,
    })
    redirect(`/register?error=${encodeURIComponent('Failed to create patient record: ' + patientError.message)}`)
  }

  console.log('Patient record created:', patientData)
  console.log('=== SIGNUP DEBUG END ===')

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}