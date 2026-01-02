// app/actions/auth.ts
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
    // Redirect back to login with error in URL
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

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`)
  }

  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {
      // Not an admin - sign them out and redirect with error
      await supabase.auth.signOut()
      redirect('/admin/login?error=Unauthorized%3A+Admin+access+required')
    }

    revalidatePath('/', 'layout')
    redirect('/admin/dashboard')
  }

  redirect('/admin/login?error=Login+failed')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
        dob: formData.get('dob') as string,
      }
    }
  }

  const { data: authData, error: authError } = await supabase.auth.signUp(data)

  if (authError) {
    redirect(`/register?error=${encodeURIComponent(authError.message)}`)
  }

  // Insert into patients table
  if (authData.user) {
    // Generate MRN
    const { data: mrnData } = await supabase.rpc('generate_mrn')
    
    const { error: patientError } = await supabase
      .from('patients')
      .insert({
        user_id: authData.user.id,
        mrn: mrnData,
        full_name: formData.get('full_name') as string,
        dob: formData.get('dob') as string,
        current_status: 'REGISTERED',
      })

    if (patientError) {
      redirect(`/register?error=${encodeURIComponent('Failed to create patient record: ' + patientError.message)}`)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard?welcome=true')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}