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
    return { error: error.message }
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

  return { error: 'Login failed' }
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
    return { error: authError.message }
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
      return { error: 'Failed to create patient record: ' + patientError.message }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}