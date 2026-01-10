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
  const currentSymptoms = formData.get('currentSymptoms') as string
  const mobilityStatus = formData.get('mobilityStatus') as string
  const additionalNotes = formData.get('additionalNotes') as string
  const consentGiven = formData.get('consentGiven') === 'true'

  // New fields
  const maritalStatus = formData.get('maritalStatus') as string
  const nationalId = formData.get('nationalId') as string
  const residentialAddress = formData.get('residentialAddress') as string
  const occupation = formData.get('occupation') as string
  const employerName = formData.get('employerName') as string
  const employerAddress = formData.get('employerAddress') as string
  const diagnosis = formData.get('diagnosis') as string
  const referringPhysician = formData.get('referringPhysician') as string
  const admissionDate = formData.get('admissionDate') as string

  const nextOfKinName = formData.get('nextOfKinName') as string
  const nextOfKinRelationship = formData.get('nextOfKinRelationship') as string
  const nextOfKinPhone = formData.get('nextOfKinPhone') as string
  const nextOfKinAddress = formData.get('nextOfKinAddress') as string

  // Validate required fields
  if (!nationalId || !maritalStatus || !residentialAddress || !occupation || !employerName || !diagnosis || !nextOfKinName || !nextOfKinPhone || !admissionDate) {
    redirect('/onboarding?error=Please fill in all required fields')
  }

  if (!consentGiven) {
    redirect('/onboarding?error=You must provide consent to continue')
  }

  // Build medical history object
  const medicalHistory: MedicalHistoryData = {
    // New Fields
    maritalStatus: maritalStatus as MedicalHistoryData['maritalStatus'],
    nationalId,
    residentialAddress,
    occupation,
    employer: {
      name: employerName,
      address: employerAddress
    },
    diagnosis,
    referringPhysician,
    admissionDate,

    currentSymptoms,
    mobilityStatus: mobilityStatus as MedicalHistoryData['mobilityStatus'],
    nextOfKin: {
      name: nextOfKinName,
      relationship: nextOfKinRelationship,
      phone: nextOfKinPhone,
      address: nextOfKinAddress
    },
    additionalNotes: additionalNotes || undefined,
    consentGiven,
    consentDate: new Date().toISOString(),
  }

  // Update risk_flags (Reset or remove legacy logic)
  const riskFlags: string[] = [] // Legacy risk flags removed as per strict replacement request

  // Update patient record
  const { error: updateError } = await supabase
    .from('patients')
    .update({
      medical_history: medicalHistory,
      onboarding_completed: true,
      current_status: 'INTAKE_COMPLETED',
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