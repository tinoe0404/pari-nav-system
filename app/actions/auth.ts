// app/actions/auth.ts (FIXED WITH DEBUGGING)
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validations/auth'


export async function login(formData: FormData) {
  const supabase = await createClient()

  // Validate input data
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validation = loginSchema.safeParse(rawData)
  if (!validation.success) {
    const firstError = validation.error.issues[0]
    redirect(`/login?error=${encodeURIComponent(firstError.message)}`)
  }

  const data = validation.data

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (!authData.user) {
    redirect('/login?error=Login+failed+no+user+returned')
  }

  // Refresh the session to ensure cookies are set
  const { data: { user }, error: getUserError } = await supabase.auth.getUser()

  if (getUserError || !user) {
    console.error('Failed to get user after login:', getUserError)
    redirect('/login?error=Session+establishment+failed')
  }

  // Get user role to determine access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // SECURITY: Prevent admin accounts from logging in via patient portal
  if (profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN') {
    // Sign out the admin user
    await supabase.auth.signOut()
    // Redirect to patient login with error message
    redirect('/login?error=Admin+accounts+must+use+the+admin+login+page')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// app/actions/auth.ts - TEMPORARY DEBUG VERSION
export async function loginAdmin(formData: FormData) {
  const supabase = await createClient()

  // Validate input data
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validation = loginSchema.safeParse(rawData)
  if (!validation.success) {
    const firstError = validation.error.issues[0]
    redirect(`/admin/login?error=${encodeURIComponent(firstError.message)}`)
  }

  const data = validation.data



  try {
    // Try to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword(data)

    if (authError) {
      console.error('Auth error details:', {
        message: authError.message,
        status: authError.status,
        code: authError.code,
      })
      redirect(`/admin/login?error=${encodeURIComponent(authError.message)}`)
    }

    if (!authData.user) {
      redirect('/admin/login?error=No+user+returned')
    }



    // Use service role to check profile (bypasses RLS completely)
    const supabaseAdmin = await createClient()

    // Try with the service role key if available
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createServiceClient } = await import('@supabase/supabase-js')
      const adminClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.error('Profile lookup error:', profileError)
        await supabase.auth.signOut()
        redirect(`/admin/login?error=${encodeURIComponent('Profile lookup failed: ' + profileError.message)}`)
      }



      if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) {

        await supabase.auth.signOut()
        redirect('/admin/login?error=Unauthorized%3A+Admin+access+required')
      }


      revalidatePath('/', 'layout')
      redirect('/admin/dashboard')
    } else {
      console.error('SUPABASE_SERVICE_ROLE_KEY not found')
      redirect('/admin/login?error=Server+configuration+error')
    }
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error
    console.error('Unexpected error during admin login:', error)
    redirect('/admin/login?error=Unexpected+error')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Validate input data
  const rawData = {
    full_name: formData.get('full_name') as string,
    dob: formData.get('dob') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validation = signupSchema.safeParse(rawData)
  if (!validation.success) {
    const firstError = validation.error.issues[0]
    redirect(`/register?error=${encodeURIComponent(firstError.message)}`)
  }

  const { full_name: fullName, dob, email, password } = validation.data



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



  // Step 2: Wait a moment for the database trigger to create the profile
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Step 3: Generate MRN with retry logic for duplicates


  // Use service role key to bypass RLS for patient creation
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not found')
    redirect(`/register?error=${encodeURIComponent('Server configuration error. Please contact support.')}`)
  }

  const { createClient: createServiceClient } = await import('@supabase/supabase-js')
  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Retry logic for MRN generation (max 5 attempts)
  let mrnData: string | null = null
  let mrnError: any = null
  const maxRetries = 5

  for (let attempt = 1; attempt <= maxRetries; attempt++) {


    const { data: generatedMrn, error: genError } = await adminClient.rpc('generate_mrn')

    if (genError) {
      console.error(`MRN generation error (attempt ${attempt}):`, genError)
      mrnError = genError
      break
    }

    // Check if MRN already exists
    const { data: existingPatient } = await adminClient
      .from('patients')
      .select('mrn')
      .eq('mrn', generatedMrn)
      .single()

    if (!existingPatient) {
      // MRN is available, use it
      mrnData = generatedMrn

      break
    } else {

      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  if (mrnError || !mrnData) {
    console.error('Failed to generate unique MRN after retries')
    redirect(`/register?error=${encodeURIComponent('Failed to generate unique patient ID. Please try again.')}`)
  }

  // Step 4: Create patient record using service role to bypass RLS


  const { data: patientData, error: patientError } = await adminClient
    .from('patients')
    .insert({
      user_id: authData.user.id,
      email: email,  // Store email for notifications
      mrn: mrnData,
      full_name: fullName,
      dob: dob,
      current_status: 'REGISTERED',
      onboarding_completed: false,
      medical_history: null,
      admission_date: new Date().toISOString(),
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

    // If it's still a duplicate error, something went wrong with our check
    if (patientError.code === '23505') {
      redirect(`/register?error=${encodeURIComponent('Patient ID conflict. Please try registering again.')}`)
    } else {
      redirect(`/register?error=${encodeURIComponent('Failed to create patient record: ' + patientError.message)}`)
    }
  }



  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  revalidatePath('/admin', 'layout')
  revalidatePath('/dashboard', 'layout')

  redirect('/login')
}
