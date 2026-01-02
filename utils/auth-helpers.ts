// utils/auth-helpers.ts
import { createClient } from '@/utils/supabase/server'
import type { UserRole } from '@/types/auth'

/**
 * Get the current user's profile with role information
 * Use this in Server Components and Server Actions
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    profile,
  }
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser()
  
  if (!user) return false
  
  return allowedRoles.includes(user.role)
}

/**
 * Check if current user is an admin (ADMIN or SUPER_ADMIN)
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(['ADMIN', 'SUPER_ADMIN'])
}

/**
 * Check if current user is a super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return hasRole(['SUPER_ADMIN'])
}

/**
 * Require authentication - throw error if not authenticated
 * Use this at the top of Server Actions that require auth
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized: Authentication required')
  }
  
  return user
}

/**
 * Require admin role - throw error if not admin
 */
export async function requireAdmin() {
  const user = await requireAuth()
  
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }
  
  return user
}

/**
 * Require super admin role - throw error if not super admin
 */
export async function requireSuperAdmin() {
  const user = await requireAuth()
  
  if (user.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden: Super Admin access required')
  }
  
  return user
}