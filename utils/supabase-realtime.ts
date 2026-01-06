// utils/supabase-realtime.ts
'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

/**
 * Hook to listen for real-time patient table updates
 * Automatically refreshes the page when patient data changes
 */
export function usePatientRealtime(userId?: string) {
    const router = useRouter()

    useEffect(() => {
        if (!userId) return

        const supabase = createClient()

        // Subscribe to patient table changes for this specific user
        const channel = supabase
            .channel('patient-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'patients',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('📡 Real-time patient update received:', payload)
                    // Refresh the current route to get fresh data
                    router.refresh()
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Subscribed to patient updates')
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Failed to subscribe to patient updates')
                }
            })

        // Cleanup subscription on unmount
        return () => {
            console.log('🔌 Unsubscribing from patient updates')
            supabase.removeChannel(channel)
        }
    }, [userId, router])
}

/**
 * Hook to listen for real-time treatment plan updates
 * Automatically refreshes the page when treatment plans change
 */
export function useTreatmentPlanRealtime(patientId?: string) {
    const router = useRouter()

    useEffect(() => {
        if (!patientId) return

        const supabase = createClient()

        // Subscribe to treatment_plans table changes for this specific patient
        const channel = supabase
            .channel('treatment-plan-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'treatment_plans',
                    filter: `patient_id=eq.${patientId}`,
                },
                (payload) => {
                    console.log('📡 Real-time treatment plan update received:', payload)
                    // Refresh the current route
                    router.refresh()
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Subscribed to treatment plan updates')
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Failed to subscribe to treatment plan updates')
                }
            })

        // Cleanup subscription on unmount
        return () => {
            console.log('🔌 Unsubscribing from treatment plan updates')
            supabase.removeChannel(channel)
        }
    }, [patientId, router])
}

/**
 * Hook for admin to listen to ALL patient updates
 * Useful for admin dashboard to show live updates
 */
export function useAllPatientsRealtime() {
    const router = useRouter()

    useEffect(() => {
        const supabase = createClient()

        // Subscribe to all patient table changes
        const channel = supabase
            .channel('all-patients-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'patients',
                },
                (payload) => {
                    console.log('📡 Real-time patient update (admin):', payload)
                    router.refresh()
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Admin subscribed to all patient updates')
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Failed to subscribe to all patient updates')
                }
            })

        return () => {
            console.log('🔌 Admin unsubscribing from all patient updates')
            supabase.removeChannel(channel)
        }
    }, [router])
}
