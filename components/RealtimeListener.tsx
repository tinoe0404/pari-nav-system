// components/RealtimeListener.tsx
'use client'

import { usePatientRealtime, useTreatmentPlanRealtime } from '@/utils/supabase-realtime'

interface RealtimeListenerProps {
    userId?: string
    patientId?: string
    enablePatientUpdates?: boolean
    enableTreatmentPlanUpdates?: boolean
}

/**
 * Client component that listens for Supabase realtime updates
 * Wrap your pages with this to get automatic refresh on data changes
 */
export default function RealtimeListener({
    userId,
    patientId,
    enablePatientUpdates = true,
    enableTreatmentPlanUpdates = true,
}: RealtimeListenerProps) {
    // Listen for patient updates (status changes, etc.)
    if (enablePatientUpdates) {
        usePatientRealtime(userId)
    }

    // Listen for treatment plan updates (new plans, modifications)
    if (enableTreatmentPlanUpdates) {
        useTreatmentPlanRealtime(patientId)
    }

    // This component doesn't render anything - it just sets up listeners
    return null
}
