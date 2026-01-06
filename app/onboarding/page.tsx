// app/onboarding/page.tsx (SERVER COMPONENT WITH READ-ONLY MODE)
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import IntakeFormClient from './IntakeFormClient'
import IntakeSummaryView from './IntakeSummaryView'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error

  // Get authenticated user
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?error=Authentication required')
  }

  // Get patient record to check if onboarding is completed
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (patientError || !patient) {
    redirect('/login?error=Patient record not found')
  }

  // If onboarding is already completed, show read-only summary
  if (patient.onboarding_completed && patient.medical_history) {
    return <IntakeSummaryView patient={patient} />
  }

  // Otherwise, show the editable form
  return <IntakeFormClient error={error} />
}
