// types/patient.ts (UPDATE)
import type { MedicalHistoryData } from './intake'

export type PatientStatus =
  | 'REGISTERED'
  | 'INTAKE_COMPLETED'
  | 'CONSULTATION_COMPLETED'
  | 'SCANNED'
  | 'PLANNING'
  | 'PLAN_READY'
  | 'TREATING'
  | 'TREATMENT_COMPLETED'
  | 'REVIEW_1_PENDING'
  | 'REVIEW_2_PENDING'
  | 'REVIEW_3_PENDING'
  | 'REVIEWS_COMPLETED'
  | 'JOURNEY_COMPLETE'

export interface PatientData {
  id: string
  user_id: string
  email: string  // Patient email for notifications
  mrn: string
  legacy_mrn: string | null
  full_name: string
  dob: string
  consultant_name: string | null
  admission_date: string
  current_status: PatientStatus
  risk_flags: string[]
  onboarding_completed: boolean  // NEW
  medical_history: MedicalHistoryData | null  // NEW
  created_at: string
  updated_at: string
}

export interface TreatmentPlan {
  id: string
  patient_id: string
  treatment_type: string
  num_sessions: number
  start_date: string
  prep_instructions: string | null
  side_effects: string[]
  is_published: boolean
  is_successful: boolean | null
  outcome_notes: string | null
  outcome_decided_at: string | null
  outcome_decided_by: string | null
  created_at: string
  updated_at: string
}

export interface RoadmapStep {
  id: number
  label: string
  status: 'completed' | 'active' | 'locked'
  description?: string
  room?: string
  icon: 'check' | 'user' | 'scan' | 'clock' | 'heart'
  controlledBy: 'patient' | 'admin' | 'auto'
  actionRequired: boolean
  actionLabel?: string
}

export interface TreatmentReview {
  id: string
  patient_id: string
  treatment_plan_id: string
  review_number: 1 | 2 | 3
  review_date: string // ISO date
  office_location: string
  is_completed: boolean
  completed_at: string | null
  completed_by: string | null
  review_notes: string | null
  created_at: string
  updated_at: string
}