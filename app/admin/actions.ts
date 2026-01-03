// app/admin/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/utils/auth-helpers'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ScanLogInput {
  patientId: string
  machineRoom: string
  notes: string
}

export interface TreatmentPlanInput {
  patientId: string
  treatmentType: string
  numSessions: number
  startDate: string
  prepInstructions?: string
  sideEffects?: string[]
}

export interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// 1. LOG PATIENT SCAN
// ============================================

export async function logPatientScan(
  input: ScanLogInput
): Promise<ActionResponse<{ scanLogId: string }>> {
  try {
    // Verify admin access
    const admin = await requireAdmin()
    
    const { patientId, machineRoom, notes } = input

    // Validate inputs
    if (!patientId || !machineRoom || !notes) {
      return {
        success: false,
        error: 'Missing required fields: patientId, machineRoom, or notes',
      }
    }

    const supabase = await createClient()

    // Step 1: Verify patient exists and is in REGISTERED status
    const { data: patient, error: patientCheckError } = await supabase
      .from('patients')
      .select('id, mrn, full_name, current_status')
      .eq('id', patientId)
      .single()

    if (patientCheckError || !patient) {
      return {
        success: false,
        error: 'Patient not found',
      }
    }

    if (patient.current_status !== 'REGISTERED') {
      return {
        success: false,
        error: `Patient is already in ${patient.current_status} status. Cannot log scan.`,
      }
    }

    // Step 2: Insert scan log
    const { data: scanLog, error: scanError } = await supabase
      .from('scan_logs')
      .insert({
        patient_id: patientId,
        machine_room: machineRoom,
        scan_notes: notes,
        performed_by: admin.id,
        scan_date: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (scanError || !scanLog) {
      console.error('Scan log insertion error:', scanError)
      return {
        success: false,
        error: `Failed to create scan log: ${scanError?.message || 'Unknown error'}`,
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
      return {
        success: false,
        error: `Scan logged but failed to update patient status: ${statusUpdateError.message}`,
      }
    }

    // Step 4: Revalidate admin pages
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
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

// ============================================
// 2. PUBLISH TREATMENT PLAN
// ============================================

export async function publishTreatmentPlan(
  input: TreatmentPlanInput
): Promise<ActionResponse<{ planId: string }>> {
  try {
    // Verify admin access
    const admin = await requireAdmin()

    const {
      patientId,
      treatmentType,
      numSessions,
      startDate,
      prepInstructions,
      sideEffects,
    } = input

    // Validate inputs
    if (!patientId || !treatmentType || !numSessions || !startDate) {
      return {
        success: false,
        error: 'Missing required fields: patientId, treatmentType, numSessions, or startDate',
      }
    }

    if (numSessions < 1 || numSessions > 50) {
      return {
        success: false,
        error: 'Number of sessions must be between 1 and 50',
      }
    }

    // Validate date is not in the past
    const startDateObj = new Date(startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDateObj < today) {
      return {
        success: false,
        error: 'Start date cannot be in the past',
      }
    }

    const supabase = await createClient()

    // Step 1: Verify patient exists and is in SCANNED or PLANNING status
    const { data: patient, error: patientCheckError } = await supabase
      .from('patients')
      .select('id, mrn, full_name, current_status')
      .eq('id', patientId)
      .single()

    if (patientCheckError || !patient) {
      return {
        success: false,
        error: 'Patient not found',
      }
    }

    if (patient.current_status !== 'SCANNED' && patient.current_status !== 'PLANNING') {
      return {
        success: false,
        error: `Patient must be in SCANNED or PLANNING status. Current status: ${patient.current_status}`,
      }
    }

    // Step 2: Check if patient already has a published plan
    const { data: existingPlan } = await supabase
      .from('treatment_plans')
      .select('id')
      .eq('patient_id', patientId)
      .eq('is_published', true)
      .single()

    if (existingPlan) {
      return {
        success: false,
        error: 'Patient already has a published treatment plan. Please unpublish the existing plan first.',
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
        prep_instructions: prepInstructions || null,
        side_effects: sideEffects || [],
        is_published: true,
        created_by: admin.id,
      })
      .select('id')
      .single()

    if (planError || !plan) {
      console.error('Treatment plan insertion error:', planError)
      return {
        success: false,
        error: `Failed to create treatment plan: ${planError?.message || 'Unknown error'}`,
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
        error: `Plan created but failed to update patient status: ${statusUpdateError.message}`,
      }
    }

    // Step 5: Revalidate admin and patient dashboard pages
    revalidatePath('/admin')
    revalidatePath('/admin/dashboard')
    revalidatePath(`/admin/patient/${patientId}`)
    revalidatePath('/dashboard') // Patient dashboard

    return {
      success: true,
      data: { planId: plan.id },
    }
  } catch (error) {
    console.error('publishTreatmentPlan error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

// ============================================
// 3. HELPER: GET PATIENT SCAN LOGS
// ============================================

export async function getPatientScanLogs(patientId: string) {
  try {
    await requireAdmin()

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
// 4. HELPER: GET PATIENT TREATMENT PLANS
// ============================================

export async function getPatientTreatmentPlans(patientId: string) {
  try {
    await requireAdmin()

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