// utils/supabase-realtime.ts
'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to listen for real-time patient table updates
 * Automatically refreshes the page when patient data changes
 */
export function usePatientRealtime(userId?: string) {
    const router = useRouter()

    useEffect(() => {
        if (!userId) return

        const supabase = createClient()
        let channel: RealtimeChannel | null = null

        const subscribe = async () => {
            // cleanup previous channel if exists
            if (channel) {
                await supabase.removeChannel(channel)
                channel = null
            }

            // Verify session before subscribing (RLS protection)
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            channel = supabase
                .channel(`patient-changes-${userId}`)
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
                        router.refresh()
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ Subscribed to patient updates')
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('❌ Failed to subscribe to patient updates (check RLS/Auth)')
                    }
                })
        }

        // Listen for auth changes to ensure we have a valid session
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                subscribe()
            }
        })

        // Initial subscription attempt
        subscribe()

        return () => {
            if (channel) {
                console.log('🔌 Unsubscribing from patient updates')
                supabase.removeChannel(channel)
            }
            subscription.unsubscribe()
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
        let channel: RealtimeChannel | null = null

        const subscribe = async () => {
            if (channel) {
                await supabase.removeChannel(channel)
                channel = null
            }

            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            channel = supabase
                .channel(`treatment-plan-changes-${patientId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'treatment_plans',
                        filter: `patient_id=eq.${patientId}`,
                    },
                    (payload) => {
                        console.log('📡 Real-time treatment plan update received:', payload)
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
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                subscribe()
            }
        })

        subscribe()

        return () => {
            if (channel) {
                console.log('🔌 Unsubscribing from treatment plan updates')
                supabase.removeChannel(channel)
            }
            subscription.unsubscribe()
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
        let channel: RealtimeChannel | null = null

        const subscribe = async () => {
            if (channel) {
                await supabase.removeChannel(channel)
                channel = null
            }

            // CRITICAL: Check session first. Realtime RLS policies fail if anon.
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                console.log('⏳ Waiting for admin session before subscribing to realtime...')
                return
            }

            console.log('🔍 [DEBUG] Subscribing with User ID:', session.user.id)
            // Fetch profile role to confirm admin status explicitly
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single()
            console.log('🔍 [DEBUG] User Role from DB:', profile?.role)


            channel = supabase
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
                        console.error('❌ Failed to subscribe to all patient updates. Verify Admin RLS.')
                    }
                })
        }

        // Re-subscribe on auth events (e.g. page reload restoring session)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                subscribe()
            }
        })

        subscribe()

        return () => {
            if (channel) {
                console.log('🔌 Admin unsubscribing from all patient updates')
                supabase.removeChannel(channel)
            }
            subscription.unsubscribe()
        }
    }, [router])
}
