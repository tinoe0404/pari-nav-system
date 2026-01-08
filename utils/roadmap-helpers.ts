// utils/roadmap-helpers.ts
import type { PatientStatus, RoadmapStep } from '@/types/patient'

export function getStatusLabel(status: PatientStatus): string {
  const labels: Record<PatientStatus, string> = {
    REGISTERED: 'Registration Complete',
    INTAKE_COMPLETED: 'Intake Complete',
    CONSULTATION_COMPLETED: 'Consultation Complete',
    SCANNED: 'Planning In Progress',
    PLANNING: 'Treatment Plan Ready',
    PLAN_READY: 'Ready to Begin Treatment',
    TREATING: 'Receiving Treatment',
    TREATMENT_COMPLETED: 'Treatment Completed',
    REVIEW_1_PENDING: 'Review 1 Pending',
    REVIEW_2_PENDING: 'Review 2 Pending',
    REVIEW_3_PENDING: 'Review 3 Pending',
    REVIEWS_COMPLETED: 'Awaiting Final Decision',
    JOURNEY_COMPLETE: 'Journey Complete ✓',
  }
  return labels[status]
}

export function getStatusColor(status: PatientStatus): string {
  const colors: Record<PatientStatus, string> = {
    REGISTERED: 'bg-gray-500',
    INTAKE_COMPLETED: 'bg-green-500',
    CONSULTATION_COMPLETED: 'bg-blue-500',
    SCANNED: 'bg-orange-500',
    PLANNING: 'bg-yellow-500',
    PLAN_READY: 'bg-purple-500',
    TREATING: 'bg-indigo-500',
    TREATMENT_COMPLETED: 'bg-teal-600',
    REVIEW_1_PENDING: 'bg-orange-600',
    REVIEW_2_PENDING: 'bg-orange-600',
    REVIEW_3_PENDING: 'bg-orange-600',
    REVIEWS_COMPLETED: 'bg-purple-600',
    JOURNEY_COMPLETE: 'bg-emerald-600',
  }
  return colors[status]
}

export function generateRoadmap(
  currentStatus: PatientStatus,
  consultantRoom?: string,
  scanRoom?: string,
  hasPlan?: boolean
): RoadmapStep[] {
  // Helper function to determine if a status is >= another status
  const statusOrder: PatientStatus[] = [
    'REGISTERED',
    'INTAKE_COMPLETED',
    'CONSULTATION_COMPLETED',
    'SCANNED',
    'PLANNING',
    'PLAN_READY',
    'TREATING',
    'TREATMENT_COMPLETED',
    'REVIEW_1_PENDING',
    'REVIEW_2_PENDING',
    'REVIEW_3_PENDING',
    'REVIEWS_COMPLETED',
    'JOURNEY_COMPLETE',
  ]

  const isStatusAtLeast = (
    current: PatientStatus,
    required: PatientStatus
  ): boolean => {
    const currentIndex = statusOrder.indexOf(current)
    const requiredIndex = statusOrder.indexOf(required)
    return currentIndex >= requiredIndex
  }

  const steps: RoadmapStep[] = [
    // Step 1: Intake Form
    {
      id: 1,
      label: 'Intake Form',
      status: isStatusAtLeast(currentStatus, 'INTAKE_COMPLETED')
        ? 'completed'
        : currentStatus === 'REGISTERED'
          ? 'active'
          : 'locked',
      description: isStatusAtLeast(currentStatus, 'INTAKE_COMPLETED')
        ? 'Medical intake completed'
        : 'Complete your medical history form',
      icon: 'check',
      controlledBy: 'patient',
      actionRequired: currentStatus === 'REGISTERED',
      actionLabel: currentStatus === 'REGISTERED' ? 'Complete Intake Form' : undefined,
    },

    // Step 2: Consultation
    {
      id: 2,
      label: 'Consultation',
      status: isStatusAtLeast(currentStatus, 'CONSULTATION_COMPLETED')
        ? 'completed'
        : currentStatus === 'INTAKE_COMPLETED'
          ? 'active'
          : 'locked',
      description: isStatusAtLeast(currentStatus, 'CONSULTATION_COMPLETED')
        ? 'Consultation completed'
        : currentStatus === 'INTAKE_COMPLETED'
          ? `Please proceed to ${consultantRoom || 'Room 104'}`
          : 'Complete intake form first',
      room: currentStatus === 'INTAKE_COMPLETED' ? consultantRoom : undefined,
      icon: 'user',
      controlledBy: 'patient',
      actionRequired: currentStatus === 'INTAKE_COMPLETED',
      actionLabel: currentStatus === 'INTAKE_COMPLETED'
        ? 'Mark Consultation as Completed'
        : undefined,
    },

    // Step 3: CT Scan
    {
      id: 3,
      label: 'CT Scan',
      status: isStatusAtLeast(currentStatus, 'SCANNED')
        ? 'completed'
        : currentStatus === 'CONSULTATION_COMPLETED'
          ? 'active'
          : 'locked',
      description: isStatusAtLeast(currentStatus, 'SCANNED')
        ? 'Scan completed'
        : currentStatus === 'CONSULTATION_COMPLETED'
          ? 'Our staff will schedule and perform your scan'
          : 'Complete consultation first',
      room: currentStatus === 'CONSULTATION_COMPLETED' ? scanRoom : undefined,
      icon: 'scan',
      controlledBy: 'admin',
      actionRequired: false,
    },

    // Step 4: Treatment Planning
    {
      id: 4,
      label: 'Treatment Planning',
      status: isStatusAtLeast(currentStatus, 'PLAN_READY')
        ? 'completed'
        : currentStatus === 'SCANNED' || currentStatus === 'PLANNING'
          ? 'active'
          : 'locked',
      description:
        currentStatus === 'SCANNED' || currentStatus === 'PLANNING'
          ? 'Our team is creating your personalized treatment plan'
          : isStatusAtLeast(currentStatus, 'PLAN_READY')
            ? 'Treatment plan ready'
            : 'Waiting for scan completion',
      icon: 'clock',
      controlledBy: 'admin',
      actionRequired: false,
    },

    // Step 5: Treatment
    {
      id: 5,
      label: 'Treatment',
      status: isStatusAtLeast(currentStatus, 'TREATMENT_COMPLETED')
        ? 'completed'
        : isStatusAtLeast(currentStatus, 'PLAN_READY')
          ? 'active'
          : 'locked',
      description:
        isStatusAtLeast(currentStatus, 'TREATMENT_COMPLETED')
          ? 'Treatment successfully completed'
          : currentStatus === 'PLAN_READY'
            ? 'View your treatment schedule below'
            : currentStatus === 'TREATING'
              ? 'Treatment in progress'
              : 'Complete all previous steps first',
      icon: 'heart',
      controlledBy: 'auto',
      actionRequired: false,
    },

    // Step 6: Follow-Up Reviews (only show if in review status)
    ...(['REVIEW_1_PENDING', 'REVIEW_2_PENDING', 'REVIEW_3_PENDING', 'REVIEWS_COMPLETED', 'JOURNEY_COMPLETE'].includes(currentStatus)
      ? [
        {
          id: 6,
          label: 'Follow-Up Reviews',
          status: currentStatus === 'JOURNEY_COMPLETE'
            ? 'completed' as const
            : ['REVIEW_1_PENDING', 'REVIEW_2_PENDING', 'REVIEW_3_PENDING', 'REVIEWS_COMPLETED'].includes(currentStatus)
              ? 'active' as const
              : 'locked' as const,
          description:
            currentStatus === 'JOURNEY_COMPLETE'
              ? 'All reviews completed successfully'
              : currentStatus === 'REVIEWS_COMPLETED'
                ? 'Reviews complete - awaiting final decision'
                : 'Attend your scheduled review appointments',
          icon: 'check' as const,
          controlledBy: 'admin' as const,
          actionRequired: false,
        },
      ]
      : []),
  ]

  return steps
}