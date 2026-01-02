// utils/roadmap-helpers.ts
import type { PatientStatus, RoadmapStep } from '@/types/patient'

export function getStatusLabel(status: PatientStatus): string {
  const labels: Record<PatientStatus, string> = {
    REGISTERED: 'Registration Complete',
    SCANNED: 'Planning In Progress',
    PLANNING: 'Treatment Plan Ready',
    PLAN_READY: 'Ready to Begin Treatment',
    TREATING: 'Receiving Treatment',
  }
  return labels[status]
}

export function getStatusColor(status: PatientStatus): string {
  const colors: Record<PatientStatus, string> = {
    REGISTERED: 'bg-green-500',
    SCANNED: 'bg-blue-500',
    PLANNING: 'bg-yellow-500',
    PLAN_READY: 'bg-purple-500',
    TREATING: 'bg-indigo-500',
  }
  return colors[status]
}

export function generateRoadmap(
  currentStatus: PatientStatus,
  consultantRoom?: string,
  scanRoom?: string,
  hasPlan?: boolean
): RoadmapStep[] {
  const steps: RoadmapStep[] = [
    {
      id: 1,
      label: 'Registration',
      status: 'completed',
      description: 'Account created successfully',
      icon: 'check',
    },
    {
      id: 2,
      label: 'Consultation',
      status: currentStatus === 'REGISTERED' ? 'active' : 'completed',
      description:
        currentStatus === 'REGISTERED'
          ? `Please proceed to ${consultantRoom || 'Room 104'}`
          : 'Consultation completed',
      room: currentStatus === 'REGISTERED' ? consultantRoom : undefined,
      icon: 'user',
    },
    {
      id: 3,
      label: 'CT Scan',
      status:
        currentStatus === 'REGISTERED'
          ? 'locked'
          : currentStatus === 'SCANNED'
          ? 'active'
          : 'completed',
      description:
        currentStatus === 'SCANNED'
          ? `Proceed to ${scanRoom || 'Room S234'}`
          : currentStatus === 'REGISTERED'
          ? 'Complete consultation first'
          : 'Scan completed',
      room: currentStatus === 'SCANNED' ? scanRoom : undefined,
      icon: 'scan',
    },
    {
      id: 4,
      label: 'Treatment Planning',
      status:
        currentStatus === 'REGISTERED'
          ? 'locked'
          : currentStatus === 'SCANNED' || currentStatus === 'PLANNING'
          ? 'active'
          : 'completed',
      description:
        currentStatus === 'SCANNED' || currentStatus === 'PLANNING'
          ? 'Our team is creating your personalized treatment plan'
          : currentStatus === 'PLAN_READY' || currentStatus === 'TREATING'
          ? 'Treatment plan ready'
          : 'Waiting for scan completion',
      icon: 'clock',
    },
    {
      id: 5,
      label: 'Treatment',
      status:
        currentStatus === 'PLAN_READY' || currentStatus === 'TREATING'
          ? 'active'
          : 'locked',
      description:
        currentStatus === 'PLAN_READY'
          ? 'View your treatment schedule below'
          : currentStatus === 'TREATING'
          ? 'Treatment in progress'
          : 'Complete all previous steps first',
      icon: 'heart',
    },
  ]

  return steps
}