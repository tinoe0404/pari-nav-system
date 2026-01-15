// app/admin/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/utils/auth-helpers'
import {
  sendPlanReadyEmail,
  sendTreatmentCompletionEmail,
  type EmailNotificationResult
} from '@/lib/email'
import { scanLogSchema, treatmentPlanSchema, scheduleReviewsSchema } from '@/lib/validations/admin'
import type { ScanLogInput, TreatmentPlanInput, ScheduleReviewsInput } from '@/lib/validations/admin'



export interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
  warning?: string
}

// ============================================
// 1. LOG PATIENT SCAN (VALIDATED)
// ============================================

export async function logPatientScan(
  input: ScanLogInput
): Promise<ActionResponse<{ scanLogId: string }>> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    // Validate Input
    const validation = scanLogSchema.safeParse(input)
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message }
    }

    const { patientId, machineRoom, notes, scanDetails } = validation.data

    // Construct formatted notes if details are provided
    let finalNotes = notes.trim()

    if (scanDetails) {
      const formattedDetails = `
[CT SCAN SETUP DETAILS]
- Position: ${scanDetails.position}
- Immobilization: ${scanDetails.immobilization.join(', ') || 'None'}
- Bladder Protocol: ${scanDetails.bladderProtocol}
- Metal Implants: ${scanDetails.metalImplants ? 'YES' : 'NO'}
- Headshell: ${scanDetails.headshell ? 'YES' : 'NO'}
`.trim()

      finalNotes = finalNotes ? `${finalNotes}\n\n${formattedDetails}` : formattedDetails
    }

    const supabase = await createClient()

    // Step 1: Fetch patient with medical history for safety validation
    const { data: patient, error: patientCheckError } = await supabase
      .from('patients')
      .select('id, mrn, full_name, current_status, medical_history')
      .eq('id', patientId)
      .single()

    if (patientCheckError || !patient) {
      return { success: false, error: 'Patient not found in system' }
    }

    // Safety Check: Patient must mark consultation as complete before scan
    if (patient.current_status !== 'CONSULTATION_COMPLETED') {
      const statusMap: Record<string, string> = {
        'REGISTERED': 'patient has not completed intake yet',
        'INTAKE_COMPLETED': 'patient has not marked consultation as complete',
        'SCANNED': 'already scanned',
        'PLANNING': 'in planning phase',
        'PLAN_READY': 'awaiting treatment',
        'TREATING': 'currently in treatment'
      }

      const statusDesc = statusMap[patient.current_status] || patient.current_status.toLowerCase()
      return {
        success: false,
        error: `Cannot log scan - ${statusDesc}. Patient must mark consultation as complete first.`,
      }
    }

    // Safety Check: Warn if high-risk conditions present (logged but not blocking)
    const medHistory = patient.medical_history as any
    if (medHistory?.conditions) {
      const highRisk = []
      if (medHistory.conditions.pacemaker) highRisk.push('pacemaker')
      if (medHistory.conditions.metalImplants) highRisk.push('metal implants')
      if (medHistory.conditions.pregnant) highRisk.push('pregnancy')
      if (medHistory.conditions.claustrophobia) highRisk.push('claustrophobia')

      if (highRisk.length > 0) {
        console.warn(`⚠️  HIGH RISK SCAN: Patient ${patient.mrn} has ${highRisk.join(', ')}`)
      }
    }

    // Step 2: Insert scan log with timestamp
    const { data: scanLog, error: scanError } = await supabase
      .from('scan_logs')
      .insert({
        patient_id: patientId,
        machine_room: machineRoom.trim(),
        scan_notes: finalNotes,
        performed_by: admin.id,
        scan_date: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (scanError || !scanLog) {
      console.error('Scan log insertion error:', scanError)
      return {
        success: false,
        error: `Database error: Failed to record scan log. ${scanError?.message || ''}`,
      }
    }

    // Step 3: Update patient status to SCANNED
    const { error: statusUpdateError } = await supabase
      .from('patients')
      .update({
        current_status: 'SCANNED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', patientId)

    if (statusUpdateError) {
      console.error('Patient status update error:', statusUpdateError)
      // Critical: Scan was logged but status didn't update - needs manual intervention
      return {
        success: false,
        error: `CRITICAL: Scan recorded but status update failed. Contact system administrator immediately. Error: ${statusUpdateError.message}`,
      }
    }

    // Step 4: Revalidate all relevant admin pages
    revalidatePath('/admin')
    revalidatePath('/admin/dashboard')
    revalidatePath(`/admin/patient/${patientId}`)

    return {
      success: true,
      data: { scanLogId: scanLog.id },
    }
  } catch (error) {
    console.error('logPatientScan error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected system error occurred',
    }
  }
}

// ============================================
// 2. PUBLISH TREATMENT PLAN (WITH EMAIL NOTIFICATION)
// ============================================

export async function publishTreatmentPlan(
  input: TreatmentPlanInput
): Promise<ActionResponse<{ planId: string; emailNotification: EmailNotificationResult }>> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    // Validate Input
    const validation = treatmentPlanSchema.safeParse(input)
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message }
    }

    const {
      patientId,
      treatmentType,
      numSessions,
      startDate,
      prepInstructions,
      nutritionalInterventions,
      skinCareDos,
      skinCareDonts,
      immobilizationDevice,
      setupConsiderations,
      prescriptionComponents,
      legacySideEffects,
    } = validation.data

    const supabase = await createClient()

    // Step 1: Verify patient exists and is in correct status
    const { data: patient, error: patientCheckError } = await supabase
      .from('patients')
      .select('id, mrn, full_name, current_status, user_id, email')
      .eq('id', patientId)
      .single()

    if (patientCheckError || !patient) {
      return { success: false, error: 'Patient not found in system' }
    }

    // Status validation: Must be SCANNED or PLANNING
    if (patient.current_status !== 'SCANNED' && patient.current_status !== 'PLANNING') {
      const statusMap: Record<string, string> = {
        'REGISTERED': 'has not been scanned yet',
        'PLAN_READY': 'already has a published plan',
        'TREATING': 'is currently in active treatment'
      }

      const statusDesc = statusMap[patient.current_status] || `in ${patient.current_status} status`
      return {
        success: false,
        error: `Cannot publish plan - patient ${statusDesc}. Patient must be scanned first.`,
      }
    }

    // Step 2: Check for existing published plans
    const { data: existingPlan } = await supabase
      .from('treatment_plans')
      .select('id, created_at')
      .eq('patient_id', patientId)
      .eq('is_published', true)
      .single()

    if (existingPlan) {
      return {
        success: false,
        error: 'Patient already has an active treatment plan. Please archive or unpublish the existing plan before creating a new one.',
      }
    }

    // Step 3: Insert treatment plan
    const { data: plan, error: planError } = await supabase
      .from('treatment_plans')
      .insert({
        patient_id: patientId,
        treatment_type: treatmentType,
        num_sessions: numSessions,
        start_date: startDate,
        prep_instructions: prepInstructions?.trim() || null,

        // Nutritional Interventions
        nutritional_interventions: nutritionalInterventions || null,

        // Skin Care Management
        skin_care_dos: skinCareDos && skinCareDos.length > 0 ? skinCareDos : null,
        skin_care_donts: skinCareDonts && skinCareDonts.length > 0 ? skinCareDonts : null,

        // Immobilization Device & Setup
        immobilization_device: immobilizationDevice?.trim() || null,
        setup_considerations: setupConsiderations?.trim() || null,

        // Prescription Components
        patient_demographics: prescriptionComponents?.patientDemographics?.trim() || null,
        primary_diagnosis: prescriptionComponents?.primaryDiagnosis?.trim() || null,
        treatment_intent: prescriptionComponents?.treatmentIntent?.trim() || null,
        anatomical_target: prescriptionComponents?.anatomicalTarget?.trim() || null,
        energy_modality: prescriptionComponents?.energyModality?.trim() || null,
        absorbed_dose: prescriptionComponents?.absorbedDose?.trim() || null,
        fractionation_schedule: prescriptionComponents?.fractionationSchedule?.trim() || null,
        volume_definitions: prescriptionComponents?.volumeDefinitions?.trim() || null,
        technique: prescriptionComponents?.technique?.trim() || null,
        image_guidance: prescriptionComponents?.imageGuidance?.trim() || null,

        // Legacy field for backward compatibility
        legacy_side_effects: legacySideEffects && legacySideEffects.length > 0 ? legacySideEffects : null,

        is_published: true,
        created_by: admin.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (planError || !plan) {
      console.error('Treatment plan insertion error:', planError)
      return {
        success: false,
        error: `Failed to create treatment plan in database. ${planError?.message || ''}`,
      }
    }

    // Step 4: Update patient status to PLAN_READY
    const { error: statusUpdateError } = await supabase
      .from('patients')
      .update({
        current_status: 'PLAN_READY',
        updated_at: new Date().toISOString(),
      })
      .eq('id', patientId)

    if (statusUpdateError) {
      console.error('Patient status update error:', statusUpdateError)
      return {
        success: false,
        error: `CRITICAL: Plan created but status update failed. Contact administrator. Error: ${statusUpdateError.message}`,
      }
    }

    // Step 5: Send email notification using stored email address
    let emailNotification: EmailNotificationResult = {
      emailSent: false,
      emailError: 'Email address not found'
    }

    // Step 6: Send email notification (non-blocking with error handling)
    if (!patient.email || patient.email.trim() === '') {
      console.warn(`⚠️  Patient ${patient.mrn} does not have an email address stored`)
      emailNotification.emailError = 'Patient email address not found in system'
    } else {
      try {

        emailNotification = await sendPlanReadyEmail(patient.email, patient.full_name)

        if (emailNotification.emailSent) {

        } else {
          console.error(`❌ Failed to send email to ${patient.email}:`, emailNotification.emailError)
        }
      } catch (emailError) {
        // Catch any unexpected errors from email sending
        console.error('❌ Unexpected error during email sending:', emailError)
        emailNotification = {
          emailSent: false,
          emailError: emailError instanceof Error
            ? emailError.message
            : 'Unexpected email service error'
        }
      }
    }

    // Step 7: Revalidate all relevant pages (admin + patient)
    revalidatePath('/admin')
    revalidatePath('/admin/dashboard')
    revalidatePath(`/admin/patient/${patientId}`)
    revalidatePath('/dashboard') // Patient dashboard

    // Return success with email status
    const response: ActionResponse<{ planId: string; emailNotification: EmailNotificationResult }> = {
      success: true,
      data: {
        planId: plan.id,
        emailNotification
      },
    }

    // Add warning if email failed but plan published successfully
    if (!emailNotification.emailSent) {
      response.warning = `Treatment plan published successfully, but email notification failed: ${emailNotification.emailError}. Please inform the patient manually.`
    }

    return response

  } catch (error) {
    console.error('publishTreatmentPlan error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected system error occurred',
    }
  }
}

// ============================================
// 3. GET PATIENT SCAN LOGS (HELPER - UNCHANGED)
// ============================================

export async function getPatientScanLogs(patientId: string) {
  try {
    await requireAdmin()

    if (!patientId?.trim()) {
      return { success: false, error: 'Patient ID is required' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('scan_logs')
      .select(`
        id,
        machine_room,
        scan_notes,
        scan_date,
        performed_by,
        created_at
      `)
      .eq('patient_id', patientId)
      .order('scan_date', { ascending: false })

    if (error) {
      console.error('Error fetching scan logs:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('getPatientScanLogs error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

// ============================================
// 4. GET PATIENT TREATMENT PLANS (HELPER - UNCHANGED)
// ============================================

export async function getPatientTreatmentPlans(patientId: string) {
  try {
    await requireAdmin()

    if (!patientId?.trim()) {
      return { success: false, error: 'Patient ID is required' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('treatment_plans')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching treatment plans:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('getPatientTreatmentPlans error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

// ============================================
// 5. COMPLETE TREATMENT (DISCHARGE)
// ============================================

export async function completeTreatment(
  patientId: string
): Promise<ActionResponse> {
  try {
    // Verify admin access
    await requireAdmin()

    if (!patientId?.trim()) {
      return { success: false, error: 'Patient ID is required' }
    }

    const supabase = await createClient()

    // Step 1: Fetch patient status and email
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, mrn, current_status, email, full_name')
      .eq('id', patientId)
      .single()

    if (patientError || !patient) {
      return { success: false, error: 'Patient not found' }
    }

    // Step 2: Validate status
    // Allow completion from TREATING (normal flow) or PLAN_READY (if they skipped active tracking)
    if (patient.current_status !== 'TREATING' && patient.current_status !== 'PLAN_READY') {
      return {
        success: false,
        error: `Cannot complete treatment. Patient is in '${patient.current_status}' status. Must be TREATING or PLAN_READY.`
      }
    }

    // Step 3: Update status
    const { error: updateError } = await supabase
      .from('patients')
      .update({
        current_status: 'TREATMENT_COMPLETED',
        updated_at: new Date().toISOString()
      })
      .eq('id', patientId)

    if (updateError) {
      console.error('Complete treatment error:', updateError)
      return { success: false, error: `Failed to update status: ${updateError.message}` }
    }

    // Step 4: Send Completion Email (Non-blocking)
    if (patient.email) {
      // We don't await this to ensure the UI updates instantly
      sendTreatmentCompletionEmail(patient.email, patient.full_name)
        .then((result: EmailNotificationResult) => {
          if (!result.emailSent) {
            console.error(`❌ Failed to send completion email: ${result.emailError}`)
          }
        })
        .catch((err: unknown) => console.error('❌ Unexpected email error:', err))
    } else {
      console.warn(`⚠️ No email found for patient ${patient.mrn}, skipping notification`)
    }

    // Step 5: Revalidate
    revalidatePath('/admin')
    revalidatePath('/admin/dashboard')
    revalidatePath(`/admin/patient/${patientId}`)
    revalidatePath('/dashboard')

    return { success: true }

  } catch (error) {
    console.error('completeTreatment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}