// lib/validations/admin.ts
import { z } from 'zod'

/**
 * Schema for logging a patient scan
 */
export const scanLogSchema = z.object({
    patientId: z.string().uuid('Invalid patient ID'),
    machineRoom: z.string().min(1, 'Machine room is required'),
    notes: z
        .string()
        .min(5, 'Notes must be at least 5 characters')
        .max(2000, 'Notes are too long'),
    scanDetails: z
        .object({
            position: z.string(),
            immobilization: z.array(z.string()),
            bladderProtocol: z.string(),
            metalImplants: z.boolean(),
            headshell: z.boolean(),
        })
        .optional(),
})

/**
 * Schema for publishing a treatment plan
 */
export const treatmentPlanSchema = z.object({
    patientId: z.string().uuid('Invalid patient ID'),
    treatmentType: z.string().min(1, 'Treatment type must be specified'),
    numSessions: z
        .number()
        .min(1, 'At least 1 treatment session is required')
        .max(50, 'Number of sessions exceeds maximum of 50'),
    startDate: z
        .string()
        .min(1, 'Treatment start date is required')
        .refine((date) => {
            const d = new Date(date)
            return !isNaN(d.getTime())
        }, 'Invalid date format')
        .refine((date) => {
            // Allow today or future
            const d = new Date(date)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            d.setHours(0, 0, 0, 0)
            return d >= today
        }, 'Treatment cannot be scheduled in the past')
        .refine((date) => {
            // Max 6 months in future
            const d = new Date(date)
            const maxDate = new Date()
            maxDate.setMonth(maxDate.getMonth() + 6)
            return d <= maxDate
        }, 'Treatment date is more than 6 months away'),
    prepInstructions: z.string().max(2000).optional(),

    // Optional Nested Objects
    nutritionalInterventions: z.record(z.string(), z.string().optional()).optional(),
    skinCareDos: z.array(z.string()).optional(),
    skinCareDonts: z.array(z.string()).optional(),
    immobilizationDevice: z.string().max(200).optional(),
    setupConsiderations: z.string().max(1000).optional(),

    prescriptionComponents: z.object({
        patientDemographics: z.string().optional(),
        primaryDiagnosis: z.string().optional(),
        treatmentIntent: z.string().optional(),
        anatomicalTarget: z.string().optional(),
        energyModality: z.string().optional(),
        absorbedDose: z.string().optional(),
        fractionationSchedule: z.string().optional(),
        volumeDefinitions: z.string().optional(),
        technique: z.string().optional(),
        imageGuidance: z.string().optional(),
    }).optional(),

    legacySideEffects: z.array(z.string()).optional(),
})

/**
 * Schema for scheduling post-treatment reviews
 */
export const scheduleReviewsSchema = z.object({
    patientId: z.string().uuid('Invalid patient ID'),
    treatmentPlanId: z.string().uuid('Invalid treatment plan ID'),
    reviews: z
        .array(
            z.object({
                reviewNumber: z.union([z.literal(1), z.literal(2), z.literal(3)]),
                reviewDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date'),
                officeLocation: z.string().min(1, 'Office location is required'),
            })
        )
        .length(3, 'Exactly 3 reviews must be scheduled')
        .refine((reviews) => {
            // Ensure sequential dates
            const sorted = [...reviews].sort((a, b) => a.reviewNumber - b.reviewNumber)
            const date1 = new Date(sorted[0].reviewDate)
            const date2 = new Date(sorted[1].reviewDate)
            const date3 = new Date(sorted[2].reviewDate)
            return date1 < date2 && date2 < date3
        }, 'Review dates must be in chronological order (Review 1 < Review 2 < Review 3)')
})

export type ScanLogInput = z.infer<typeof scanLogSchema>
export type TreatmentPlanInput = z.infer<typeof treatmentPlanSchema>
export type ScheduleReviewsInput = z.infer<typeof scheduleReviewsSchema>
