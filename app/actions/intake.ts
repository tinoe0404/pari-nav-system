// app/actions/intake.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import type { IntakeFormData, MedicalHistoryData } from '@/types/intake'
import { intakeFormSchema } from '@/lib/validations/intake'

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

  // Parse and validate form data
  const rawData = {
    maritalStatus: formData.get('maritalStatus') as string,
    nationalId: formData.get('nationalId') as string,
    residentialAddress: formData.get('residentialAddress') as string,
    occupation: formData.get('occupation') as string,
    employerName: formData.get('employerName') as string,
    employerAddress: formData.get('employerAddress') as string,
    diagnosis: formData.get('diagnosis') as string,
    referringPhysician: formData.get('referringPhysician') as string,
    currentSymptoms: formData.get('currentSymptoms') as string,
    mobilityStatus: formData.get('mobilityStatus') as string,
    admissionDate: formData.get('admissionDate') as string,
    nextOfKinName: formData.get('nextOfKinName') as string,
    nextOfKinRelationship: formData.get('nextOfKinRelationship') as string,
    nextOfKinPhone: formData.get('nextOfKinPhone') as string,
    nextOfKinAddress: formData.get('nextOfKinAddress') as string,
    additionalNotes: formData.get('additionalNotes') as string,
    consentGiven: formData.get('consentGiven') === 'true',
  }

  // Validate with Zod schema
  const validation = intakeFormSchema.safeParse(rawData)
  if (!validation.success) {
    const firstError = validation.error.issues[0]
    redirect(`/onboarding?error=${encodeURIComponent(firstError.message)}`)
  }

  const validatedData = validation.data

  // Build medical history object
  const medicalHistory: MedicalHistoryData = {
    // New Fields
    maritalStatus: validatedData.maritalStatus as MedicalHistoryData['maritalStatus'],
    nationalId: validatedData.nationalId,
    residentialAddress: validatedData.residentialAddress,
    occupation: validatedData.occupation,
    employer: {
      name: validatedData.employerName,
      address: validatedData.employerAddress || ''
    },
    diagnosis: validatedData.diagnosis,
    referringPhysician: validatedData.referringPhysician || '',
    admissionDate: validatedData.admissionDate,

    currentSymptoms: validatedData.currentSymptoms,
    mobilityStatus: validatedData.mobilityStatus as MedicalHistoryData['mobilityStatus'],
    nextOfKin: {
      name: validatedData.nextOfKinName,
      relationship: validatedData.nextOfKinRelationship || '',
      phone: validatedData.nextOfKinPhone,
      address: validatedData.nextOfKinAddress || ''
    },
    additionalNotes: validatedData.additionalNotes || undefined,
    consentGiven: validatedData.consentGiven,
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