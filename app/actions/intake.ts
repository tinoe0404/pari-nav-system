// app/actions/intake.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import type { IntakeFormData, MedicalHistoryData } from '@/types/intake'

export async function submitIntakeForm(formData: FormData) {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?error=Authentication required')
  }

  // Get patient record
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (patientError || !patient) {
    redirect('/login?error=Patient record not found')
  }

  // Parse form data
  const conditions = formData.getAll('conditions') as string[]
  const allergyDetails = formData.get('allergyDetails') as string
  const currentSymptoms = formData.get('currentSymptoms') as string
  const mobilityStatus = formData.get('mobilityStatus') as string
  const nextOfKinName = formData.get('nextOfKinName') as string
  const nextOfKinRelationship = formData.get('nextOfKinRelationship') as string
  const nextOfKinPhone = formData.get('nextOfKinPhone') as string
  const additionalNotes = formData.get('additionalNotes') as string
  const consentGiven = formData.get('consentGiven') === 'true'

  // Validate required fields
  if (!currentSymptoms || !mobilityStatus || !nextOfKinName || !nextOfKinPhone) {
    redirect('/onboarding?error=Please fill in all required fields')
  }

  if (!consentGiven) {
    redirect('/onboarding?error=You must provide consent to continue')
  }

  // Build medical history object
  const medicalHistory: MedicalHistoryData = {
    conditions: {
      pacemaker: conditions.includes('pacemaker'),
      previousRadiation: conditions.includes('previousRadiation'),
      claustrophobia: conditions.includes('claustrophobia'),
      metalImplants: conditions.includes('metalImplants'),
      diabetes: conditions.includes('diabetes'),
      heartDisease: conditions.includes('heartDisease'),
      kidneyDisease: conditions.includes('kidneyDisease'),
      pregnant: conditions.includes('pregnant'),
      allergies: conditions.includes('allergies'),
    },
    allergyDetails: conditions.includes('allergies') ? allergyDetails : undefined,
    currentSymptoms,
    mobilityStatus: mobilityStatus as MedicalHistoryData['mobilityStatus'],
    nextOfKin: {
      name: nextOfKinName,
      relationship: nextOfKinRelationship,
      phone: nextOfKinPhone,
    },
    additionalNotes: additionalNotes || undefined,
    consentGiven,
    consentDate: new Date().toISOString(),
  }

  // Update risk_flags based on conditions
  const riskFlags: string[] = []
  if (medicalHistory.conditions.pacemaker) riskFlags.push('Pacemaker')
  if (medicalHistory.conditions.metalImplants) riskFlags.push('Metal Implants')
  if (medicalHistory.conditions.claustrophobia) riskFlags.push('Claustrophobia')
  if (medicalHistory.conditions.pregnant) riskFlags.push('Pregnant')
  if (medicalHistory.conditions.allergies) riskFlags.push('Allergies')

  // Update patient record
  const { error: updateError } = await supabase
    .from('patients')
    .update({
      medical_history: medicalHistory,
      onboarding_completed: true,
      risk_flags: riskFlags,
    })
    .eq('id', patient.id)

  if (updateError) {
    console.error('Error updating patient:', updateError)
    redirect('/onboarding?error=Failed to save form. Please try again.')
  }

  // Success - redirect to dashboard
  revalidatePath('/dashboard')
  redirect('/dashboard?onboarding=complete')
}