// components/RealtimeAdminListener.tsx
'use client'

import { useAllPatientsRealtime } from '@/utils/supabase-realtime'

/**
 * Client component for admin dashboard to listen to all patient updates
 */
export default function RealtimeAdminListener() {
    useAllPatientsRealtime()

    // This component doesn't render anything - it just sets up listeners
    return null
}
