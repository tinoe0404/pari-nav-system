// app/admin/review-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/utils/auth-helpers'
import {
    sendReviewScheduleEmail,
    sendTreatmentSuccessEmail,
    sendTreatmentRestartEmail,
    sendReviewCompletionEmail
} from '@/lib/email-reviews'
import { sendTreatmentCompletionEmail } from '@/lib/email'
import type { EmailNotificationResult } from '@/lib/email'
import type { ActionResponse, ScheduleReviewsInput } from './actions'
import { scheduleReviewsSchema } from '@/lib/validations/admin'

// ============================================
// MARK TREATMENT COMPLETE (NEW STEP 1)
// ============================================

/**
 * Marks the treatment phase as complete and notifies the patient.
 * This unlocks the review scheduling phase.
 */
export async function markTreatmentComplete(patientId: string): Promise<ActionResponse> {
    try {
        await requireAdmin()

        if (!patientId?.trim()) {
            return { success: false, error: 'Patient ID is required' }
        }

        const supabase = await createClient()

        // Update patient status to TREATMENT_COMPLETED
        const { error: updateError } = await supabase
            .from('patients')
            .update({
                current_status: 'TREATMENT_COMPLETED',
                updated_at: new Date().toISOString()
            })
            .eq('id', patientId)

        if (updateError) {
            console.error('Error updating patient status:', updateError)
            return { success: false, error: `Failed to update status: ${updateError.message}` }
        }

        // Send email notification (non-blocking)
        const { data: patient } = await supabase
            .from('patients')
            .select('email, full_name')
            .eq('id', patientId)
            .single()

        if (patient && patient.email) {
            sendTreatmentCompletionEmail(patient.email, patient.full_name)
                .then(result => {
                    if (!result.emailSent) {
                        console.error(`❌ Failed to send treatment completion email: ${result.emailError}`)
                    }
                })
                .catch(err => console.error('❌ Unexpected email error:', err))
        }

        // Revalidate paths
        revalidatePath('/admin')
        revalidatePath('/admin/dashboard')
        revalidatePath(`/admin/patient/${patientId}`)
        revalidatePath('/dashboard')

        return { success: true }

    } catch (error) {
        console.error('markTreatmentComplete error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
    }
}

// ============================================
// 1. SCHEDULE POST-TREATMENT REVIEWS
// ============================================

/**
 * Schedules 3 post-treatment review appointments for a patient
 * and sends email notification with all review dates
 */
export async function schedulePostTreatmentReviews(
    input: ScheduleReviewsInput
): Promise<ActionResponse<{ reviewIds: string[]; emailNotification: EmailNotificationResult }>> {
    try {
        const admin = await requireAdmin()

        // Validate Input
        const validation = scheduleReviewsSchema.safeParse(input)
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message }
        }

        const { patientId, treatmentPlanId, reviews } = validation.data

        // Note: Date sequential validation is already handled by Zod refine
        const sortedReviews = [...reviews].sort((a, b) => a.reviewNumber - b.reviewNumber)

        const supabase = await createClient()

        // Fetch patient
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('id, full_name, current_status, email')
            .eq('id', patientId)
            .single()

        if (patientError || !patient) {
            return { success: false, error: 'Patient not found' }
        }

        // Validate patient status (must be TREATING or PLAN_READY or TREATMENT_COMPLETED)
        if (!['TREATING', 'PLAN_READY', 'TREATMENT_COMPLETED'].includes(patient.current_status)) {
            return {
                success: false,
                error: `Cannot schedule reviews - patient is in '${patient.current_status}' status. Patient must be in treatment or have completed treatment.`
            }
        }

        // Check if reviews already exist for this patient/plan
        const { data: existingReviews } = await supabase
            .from('treatment_reviews')
            .select('id')
            .eq('patient_id', patientId)
            .eq('treatment_plan_id', treatmentPlanId)

        if (existingReviews && existingReviews.length > 0) {
            return {
                success: false,
                error: 'Reviews have already been scheduled for this patient. Please update existing reviews instead.'
            }
        }

        // Insert all 3 review records
        const reviewInserts = reviews.map(review => ({
            patient_id: patientId,
            treatment_plan_id: treatmentPlanId,
            review_number: review.reviewNumber,
            review_date: review.reviewDate,
            office_location: review.officeLocation.trim(),
            is_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }))

        const { data: insertedReviews, error: reviewError } = await supabase
            .from('treatment_reviews')
            .insert(reviewInserts)
            .select('id')

        if (reviewError || !insertedReviews) {
            console.error('Review insertion error:', reviewError)
            return {
                success: false,
                error: `Failed to schedule reviews: ${reviewError?.message || 'Unknown error'}`
            }
        }

        // Update patient status to REVIEW_1_PENDING
        const { error: statusError } = await supabase
            .from('patients')
            .update({
                current_status: 'REVIEW_1_PENDING',
                updated_at: new Date().toISOString()
            })
            .eq('id', patientId)

        if (statusError) {
            console.error('Status update error:', statusError)
            return {
                success: false,
                error: `Reviews created but status update failed: ${statusError.message}`
            }
        }

        // Send email notification
        let emailNotification: EmailNotificationResult = {
            emailSent: false,
            emailError: 'Email address not found'
        }

        if (!patient.email || patient.email.trim() === '') {
            console.warn(`⚠️  Patient ${patient.full_name} does not have an email address`)
            emailNotification.emailError = 'Patient email address not found'
        } else {
            try {
                const reviewsForEmail = sortedReviews.map(r => ({
                    reviewNumber: r.reviewNumber,
                    date: r.reviewDate,
                    location: r.officeLocation
                }))

                emailNotification = await sendReviewScheduleEmail(
                    patient.email,
                    patient.full_name,
                    reviewsForEmail
                )

                if (!emailNotification.emailSent) {
                    console.error(`❌ Failed to send review schedule email:`, emailNotification.emailError)
                }
            } catch (emailError) {
                console.error('❌ Unexpected error sending review schedule email:', emailError)
                emailNotification = {
                    emailSent: false,
                    emailError: emailError instanceof Error ? emailError.message : 'Unexpected email error'
                }
            }
        }

        // Revalidate paths
        revalidatePath('/admin')
        revalidatePath('/admin/dashboard')
        revalidatePath(`/admin/patient/${patientId}`)
        revalidatePath('/dashboard')

        const response: ActionResponse<{ reviewIds: string[]; emailNotification: EmailNotificationResult }> = {
            success: true,
            data: {
                reviewIds: insertedReviews.map(r => r.id),
                emailNotification
            }
        }

        if (!emailNotification.emailSent) {
            response.warning = `Reviews scheduled successfully, but email notification failed: ${emailNotification.emailError}`
        }

        return response

    } catch (error) {
        console.error('schedulePostTreatmentReviews error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
    }
}

// ============================================
// 2. MARK REVIEW AS COMPLETE
// ============================================

/**
 * Marks a specific review as complete and progresses patient to next review stage
 */
export async function markReviewComplete(
    reviewId: string,
    notes?: string
): Promise<ActionResponse> {
    try {
        const admin = await requireAdmin()

        if (!reviewId?.trim()) {
            return { success: false, error: 'Review ID is required' }
        }

        const supabase = await createClient()

        // Fetch review with patient info
        const { data: review, error: reviewError } = await supabase
            .from('treatment_reviews')
            .select('id, patient_id, review_number, is_completed')
            .eq('id', reviewId)
            .single()

        if (reviewError || !review) {
            return { success: false, error: 'Review not found' }
        }

        if (review.is_completed) {
            return { success: false, error: 'This review has already been marked as complete' }
        }

        // Mark review as completed
        const { error: updateError } = await supabase
            .from('treatment_reviews')
            .update({
                is_completed: true,
                completed_at: new Date().toISOString(),
                completed_by: admin.id,
                review_notes: notes || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', reviewId)

        if (updateError) {
            console.error('Review update error:', updateError)
            return { success: false, error: `Failed to mark review as complete: ${updateError.message}` }
        }

        // Determine next status based on review number
        let nextStatus: string
        switch (review.review_number) {
            case 1:
                nextStatus = 'REVIEW_2_PENDING'
                break
            case 2:
                nextStatus = 'REVIEW_3_PENDING'
                break
            case 3:
                nextStatus = 'REVIEWS_COMPLETED'
                break
            default:
                return { success: false, error: `Invalid review number: ${review.review_number}` }
        }

        // Update patient status
        const { error: statusError } = await supabase
            .from('patients')
            .update({
                current_status: nextStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', review.patient_id)

        if (statusError) {
            console.error('Patient status update error:', statusError)
            return {
                success: false,
                error: `Review marked complete but status update failed: ${statusError.message}`
            }
        }

        // Send review completion email (non-blocking)
        const { data: patient } = await supabase
            .from('patients')
            .select('email, full_name')
            .eq('id', review.patient_id)
            .single()

        if (patient && patient.email) {
            // Need to import sendReviewCompletionEmail at the top
            sendReviewCompletionEmail(patient.email, patient.full_name, review.review_number, notes)
                .then(result => {
                    if (!result.emailSent) {
                        console.error(`❌ Failed to send review completion email: ${result.emailError}`)
                    }
                })
                .catch(err => console.error('❌ Unexpected email error:', err))
        }

        // Revalidate paths
        revalidatePath('/admin')
        revalidatePath('/admin/dashboard')
        revalidatePath(`/admin/patient/${review.patient_id}`)
        revalidatePath('/dashboard')

        return { success: true }

    } catch (error) {
        console.error('markReviewComplete error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
    }
}

// ============================================
// 3. FINALIZE TREATMENT (SUCCESS)
// ============================================

/**
 * Marks treatment as successful after all reviews are complete
 */
export async function finalizeTreatmentSuccess(
    patientId: string,
    outcomeNotes?: string
): Promise<ActionResponse> {
    try {
        const admin = await requireAdmin()

        if (!patientId?.trim()) {
            return { success: false, error: 'Patient ID is required' }
        }

        const supabase = await createClient()

        // Fetch patient with treatment plan
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('id, full_name, current_status, email')
            .eq('id', patientId)
            .single()

        if (patientError || !patient) {
            return { success: false, error: 'Patient not found' }
        }

        // Validate status
        if (patient.current_status !== 'REVIEWS_COMPLETED') {
            return {
                success: false,
                error: `Cannot finalize treatment - patient is in '${patient.current_status}' status. All reviews must be completed first.`
            }
        }

        // Get active treatment plan
        const { data: treatmentPlan, error: planError } = await supabase
            .from('treatment_plans')
            .select('id')
            .eq('patient_id', patientId)
            .eq('is_published', true)
            .single()

        if (planError || !treatmentPlan) {
            return { success: false, error: 'No active treatment plan found for this patient' }
        }

        // Update treatment plan outcome
        const { error: planUpdateError } = await supabase
            .from('treatment_plans')
            .update({
                is_successful: true,
                outcome_notes: outcomeNotes || null,
                outcome_decided_at: new Date().toISOString(),
                outcome_decided_by: admin.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', treatmentPlan.id)

        if (planUpdateError) {
            console.error('Treatment plan update error:', planUpdateError)
            return { success: false, error: `Failed to update treatment plan: ${planUpdateError.message}` }
        }

        // Update patient status to JOURNEY_COMPLETE
        const { error: statusError } = await supabase
            .from('patients')
            .update({
                current_status: 'JOURNEY_COMPLETE',
                updated_at: new Date().toISOString()
            })
            .eq('id', patientId)

        if (statusError) {
            console.error('Patient status update error:', statusError)
            return {
                success: false,
                error: `Treatment marked successful but status update failed: ${statusError.message}`
            }
        }

        // Send success email (non-blocking)
        if (patient.email) {
            sendTreatmentSuccessEmail(patient.email, patient.full_name)
                .then((result: EmailNotificationResult) => {
                    if (!result.emailSent) {
                        console.error(`❌ Failed to send success email: ${result.emailError}`)
                    }
                })
                .catch((err: unknown) => console.error('❌ Unexpected email error:', err))
        } else {
            console.warn(`⚠️ No email found for patient ${patient.full_name}`)
        }

        // Revalidate paths
        revalidatePath('/admin')
        revalidatePath('/admin/dashboard')
        revalidatePath(`/admin/patient/${patientId}`)
        revalidatePath('/dashboard')

        return { success: true }

    } catch (error) {
        console.error('finalizeTreatmentSuccess error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
    }
}

// ============================================
// 4. RESTART TREATMENT (FAILURE)
// ============================================

/**
 * Restarts treatment process when reviews show treatment was not successful
 */
export async function restartTreatment(
    patientId: string,
    reason: string
): Promise<ActionResponse> {
    try {
        const admin = await requireAdmin()

        if (!patientId?.trim()) {
            return { success: false, error: 'Patient ID is required' }
        }

        if (!reason?.trim()) {
            return { success: false, error: 'Reason for restart is required' }
        }

        const supabase = await createClient()

        // Fetch patient
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('id, full_name, current_status, email')
            .eq('id', patientId)
            .single()

        if (patientError || !patient) {
            return { success: false, error: 'Patient not found' }
        }

        // Validate status
        if (patient.current_status !== 'REVIEWS_COMPLETED') {
            return {
                success: false,
                error: `Cannot restart treatment - patient is in '${patient.current_status}' status. All reviews must be completed first.`
            }
        }

        // Get active treatment plan
        const { data: treatmentPlan, error: planError } = await supabase
            .from('treatment_plans')
            .select('id')
            .eq('patient_id', patientId)
            .eq('is_published', true)
            .single()

        if (planError || !treatmentPlan) {
            return { success: false, error: 'No active treatment plan found for this patient' }
        }

        // Update treatment plan - mark as unsuccessful and unpublish
        const { error: planUpdateError } = await supabase
            .from('treatment_plans')
            .update({
                is_successful: false,
                is_published: false,
                outcome_notes: reason,
                outcome_decided_at: new Date().toISOString(),
                outcome_decided_by: admin.id,
                updated_at: new Date().toISOString()
            })
            .eq('id', treatmentPlan.id)

        if (planUpdateError) {
            console.error('Treatment plan update error:', planUpdateError)
            return { success: false, error: `Failed to update treatment plan: ${planUpdateError.message}` }
        }

        // Reset patient status to CONSULTATION_COMPLETED (restart from scan)
        const { error: statusError } = await supabase
            .from('patients')
            .update({
                current_status: 'CONSULTATION_COMPLETED',
                updated_at: new Date().toISOString()
            })
            .eq('id', patientId)

        if (statusError) {
            console.error('Patient status update error:', statusError)
            return {
                success: false,
                error: `Treatment unpublished but status update failed: ${statusError.message}`
            }
        }

        // Send restart email (non-blocking)
        if (patient.email) {
            sendTreatmentRestartEmail(patient.email, patient.full_name, reason)
                .then((result: EmailNotificationResult) => {
                    if (!result.emailSent) {
                        console.error(`❌ Failed to send restart email: ${result.emailError}`)
                    }
                })
                .catch((err: unknown) => console.error('❌ Unexpected email error:', err))
        } else {
            console.warn(`⚠️ No email found for patient ${patient.full_name}`)
        }

        // Revalidate paths
        revalidatePath('/admin')
        revalidatePath('/admin/dashboard')
        revalidatePath(`/admin/patient/${patientId}`)
        revalidatePath('/dashboard')

        return { success: true }

    } catch (error) {
        console.error('restartTreatment error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
    }
}

// ============================================
// 5. GET PATIENT REVIEWS (HELPER)
// ============================================

/**
 * Fetches all reviews for a specific patient
 */
export async function getPatientReviews(patientId: string) {
    try {
        await requireAdmin()

        if (!patientId?.trim()) {
            return { success: false, error: 'Patient ID is required' }
        }

        const supabase = await createClient()

        const { data, error } = await supabase
            .from('treatment_reviews')
            .select('*')
            .eq('patient_id', patientId)
            .order('review_number', { ascending: true })

        if (error) {
            console.error('Error fetching reviews:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data || [] }
    } catch (error) {
        console.error('getPatientReviews error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
    }
}
