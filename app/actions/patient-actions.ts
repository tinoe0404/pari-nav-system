// app/actions/patient-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export interface PatientActionResponse {
    success: boolean
    error?: string
    message?: string
}

/**
 * Mark consultation as completed by patient
 * Transitions patient status from INTAKE_COMPLETED to CONSULTATION_COMPLETED
 */
export async function markConsultationComplete(): Promise<PatientActionResponse> {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return { success: false, error: 'Authentication required' }
        }

        // Get patient record
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('id, current_status, full_name')
            .eq('user_id', user.id)
            .single()

        if (patientError || !patient) {
            return { success: false, error: 'Patient record not found' }
        }

        // Validate current status
        if (patient.current_status !== 'INTAKE_COMPLETED') {
            const statusMessages: Record<string, string> = {
                REGISTERED: 'Please complete your intake form first',
                CONSULTATION_COMPLETED: 'You have already completed the consultation',
                SCANNED: 'Consultation already completed',
                PLANNING: 'Consultation already completed',
                PLAN_READY: 'Consultation already completed',
                TREATING: 'Consultation already completed',
            }

            const message = statusMessages[patient.current_status] ||
                'Cannot mark consultation as complete at this time'

            return { success: false, error: message }
        }

        // Update patient status
        const { error: updateError } = await supabase
            .from('patients')
            .update({
                current_status: 'CONSULTATION_COMPLETED',
                updated_at: new Date().toISOString(),
            })
            .eq('id', patient.id)

        if (updateError) {
            console.error('Error updating patient status:', updateError)
            return {
                success: false,
                error: 'Failed to update status. Please try again or contact support.'
            }
        }

        // Revalidate dashboard
        revalidatePath('/dashboard')

        return {
            success: true,
            message: 'Consultation marked as complete! Your scan will be scheduled by our team.'
        }
    } catch (error) {
        console.error('markConsultationComplete error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
        }
    }
}
