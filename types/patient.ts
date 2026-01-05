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

export interface PatientData {
  id: string
  user_id: string
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