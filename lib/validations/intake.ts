// lib/validations/intake.ts
import { z } from 'zod'

/**
 * Validation schema for patient intake form
 */
export const intakeFormSchema = z.object({
    // Demographics
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'other'], {
        message: 'Please select a valid marital status',
    }),
    nationalId: z
        .string()
        .min(1, 'National ID is required')
        .max(50, 'National ID is too long')
        .trim(),
    residentialAddress: z
        .string()
        .min(5, 'Address must be at least 5 characters')
        .max(500, 'Address is too long')
        .trim(),
    occupation: z
        .string()
        .min(2, 'Occupation is required')
        .max(100, 'Occupation is too long')
        .trim(),

    // Employer
    employerName: z
        .string()
        .min(1, 'Employer name is required')
        .max(200, 'Employer name is too long')
        .trim(),
    employerAddress: z
        .string()
        .max(500, 'Employer address is too long')
        .trim()
        .optional(),

    // Medical
    diagnosis: z
        .string()
        .min(3, 'Diagnosis must be at least 3 characters')
        .max(500, 'Diagnosis is too long')
        .trim(),
    referringPhysician: z
        .string()
        .max(200, 'Physician name is too long')
        .trim()
        .optional(),
    currentSymptoms: z
        .string()
        .max(2000, 'Symptoms description is too long')
        .trim(),
    mobilityStatus: z.enum(['walking', 'assistance_needed', 'wheelchair', 'stretcher'], {
        message: 'Please select a valid mobility status',
    }),
    admissionDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?.*$/, 'Date must be in YYYY-MM-DD or YYYY-MM-DDThh:mm format'),

    // Next of Kin
    nextOfKinName: z
        .string()
        .min(2, 'Next of kin name is required')
        .max(100, 'Name is too long')
        .trim(),
    nextOfKinRelationship: z
        .string()
        .max(50, 'Relationship is too long')
        .trim()
        .optional(),
    nextOfKinPhone: z
        .string()
        .min(10, 'Phone number must be at least 10 digits')
        .max(20, 'Phone number is too long')
        .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
    nextOfKinAddress: z
        .string()
        .max(500, 'Address is too long')
        .trim()
        .optional(),

    // Additional
    additionalNotes: z
        .string()
        .max(5000, 'Notes are too long')
        .trim()
        .optional(),
    consentGiven: z.boolean().refine((val) => val === true, {
        message: 'You must provide consent to continue',
    }),
})

export type IntakeFormInput = z.infer<typeof intakeFormSchema>
