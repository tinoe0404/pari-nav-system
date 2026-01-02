// app/actions/admin.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { requireSuperAdmin } from '@/utils/auth-helpers'

export async function inviteAdmin(email: string) {
  try {
    // Only SUPER_ADMIN can invite admins
    await requireSuperAdmin()

    const supabase = await createClient()

    // Create the invite link (user will set password on first login)
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        role: 'ADMIN',
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/set-password`,
    })

    if (error) {
      return { 
        success: false, 
        error: error.message 
      }
    }

    // Update the profile to set role to ADMIN
    // Note: The profile is auto-created via database trigger when auth user is created
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'ADMIN' })
        .eq('id', data.user.id)

      if (profileError) {
        return { 
          success: false, 
          error: `User created but role assignment failed: ${profileError.message}` 
        }
      }
    }

    return { 
      success: true, 
      message: `Invitation sent to ${email}. They will receive an email to set their password.`,
      userId: data.user?.id 
    }

  } catch (error) {
    if (error instanceof Error) {
      return { 
        success: false, 
        error: error.message 
      }
    }
    return { 
      success: false, 
      error: 'An unexpected error occurred' 
    }
  }
}

export async function listAdmins() {
  try {
    await requireSuperAdmin()

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .in('role', ['ADMIN', 'SUPER_ADMIN'])
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }

  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function removeAdmin(userId: string) {
  try {
    await requireSuperAdmin()

    const supabase = await createClient()

    // Don't allow removing SUPER_ADMIN
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profile?.role === 'SUPER_ADMIN') {
      return { 
        success: false, 
        error: 'Cannot remove SUPER_ADMIN role' 
      }
    }

    // Change role back to PATIENT
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'PATIENT' })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { 
      success: true, 
      message: 'Admin access revoked successfully' 
    }

  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}