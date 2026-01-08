// app/admin/dashboard/page.tsx (MOBILE-OPTIMIZED + REALTIME)
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/utils/auth-helpers'
import { logout } from '@/app/actions/auth'
import MobileNav from '@/components/MobileNav'
import PatientCard from '@/components/PatientCard'
import RealtimeAdminListener from '@/components/RealtimeAdminListener'
import QRCode from '@/components/QRCode'
import type { PatientData } from '@/types/patient'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    status?: string
    success?: string
    error?: string
  }>
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  // ============================================
  // FIX: Await searchParams (Next.js 15+)
  // ============================================
  const params = await searchParams
  const { status: statusFilter, success, error } = params

  // Verify admin access
  try {
    await requireAdmin()
  } catch (error) {
    redirect('/admin/login?error=Unauthorized')
  }

  const supabase = await createClient()

  // Fetch patients with optional status filter
  let query = supabase
    .from('patients')
    .select('*')
    .order('admission_date', { ascending: false })

  if (statusFilter && statusFilter !== 'ALL') {
    if (statusFilter === 'IN_REVIEWS') {
      query = query.in('current_status', ['REVIEW_1_PENDING', 'REVIEW_2_PENDING', 'REVIEW_3_PENDING', 'REVIEWS_COMPLETED'])
    } else if (statusFilter === 'DISCHARGED_GROUP') {
      query = query.in('current_status', ['TREATMENT_COMPLETED', 'JOURNEY_COMPLETE'])
    } else {
      query = query.eq('current_status', statusFilter)
    }
  }

  const { data: patients, error: fetchError } = await query

  if (fetchError) {
    console.error('Error fetching patients:', {
      message: fetchError.message,
      details: fetchError.details,
      hint: fetchError.hint,
      code: fetchError.code
    })
  }

  const typedPatients = (patients || []) as PatientData[]

  // Helper function to check for HIGH-RISK conditions
  const hasHighRiskCondition = (patient: PatientData): boolean => {
    if (!patient.medical_history) return false
    const conditions = patient.medical_history.conditions
    return !!(
      conditions?.pacemaker ||
      conditions?.metalImplants ||
      conditions?.pregnant ||
      conditions?.claustrophobia
    )
  }

  // Count patients by status
  const statusCounts = {
    ALL: typedPatients.length,
    AWAITING_SCAN: typedPatients.filter(p => p.current_status === 'CONSULTATION_COMPLETED').length,
    PLANNING_QUEUE: typedPatients.filter(p => p.current_status === 'SCANNED' || p.current_status === 'PLANNING').length,
    PLAN_READY: typedPatients.filter(p => p.current_status === 'PLAN_READY').length,
    IN_REVIEWS: typedPatients.filter(p => ['REVIEW_1_PENDING', 'REVIEW_2_PENDING', 'REVIEW_3_PENDING', 'REVIEWS_COMPLETED'].includes(p.current_status)).length,
    COMPLETED: typedPatients.filter(p => ['TREATMENT_COMPLETED', 'JOURNEY_COMPLETE'].includes(p.current_status)).length,
  }

  const highRiskCount = typedPatients.filter(hasHighRiskCondition).length

  const getStatusBadgeColor = (status: string) => {
    if (status.startsWith('REVIEW_') || status === 'REVIEWS_COMPLETED') {
      return 'bg-amber-100 text-amber-800 border-amber-300'
    }
    switch (status) {
      case 'REGISTERED':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'INTAKE_COMPLETED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'CONSULTATION_COMPLETED':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'SCANNED':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'PLANNING':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'PLAN_READY':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'TREATING':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300'
      case 'TREATMENT_COMPLETED':
        return 'bg-teal-100 text-teal-800 border-teal-300'
      case 'JOURNEY_COMPLETE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'REGISTERED':
        return 'Registered'
      case 'INTAKE_COMPLETED':
        return 'Intake Done'
      case 'CONSULTATION_COMPLETED':
        return 'Awaiting Scan'
      case 'SCANNED':
        return 'Scan Complete'
      case 'PLANNING':
        return 'In Planning'
      case 'PLAN_READY':
        return 'Plan Ready'
      case 'TREATING':
        return 'Treating'
      case 'REVIEW_1_PENDING':
        return 'Review 1 Pending'
      case 'REVIEW_2_PENDING':
        return 'Review 2 Pending'
      case 'REVIEW_3_PENDING':
        return 'Review 3 Pending'
      case 'REVIEWS_COMPLETED':
        return 'Reviews Done'
      case 'TREATMENT_COMPLETED':
        return 'Discharged'
      case 'JOURNEY_COMPLETE':
        return 'Journey Complete'
      default:
        return status
    }
  }

  const activeFilter = statusFilter || 'ALL'

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #dce3ed 0%, #f1f5f9 100%)', minHeight: '100vh' }}>
      {/* Header - Mobile Optimized */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Mobile Nav + Title */}
            <div className="flex items-center gap-3">
              <MobileNav isAdmin onLogout={logout} adminStatusCounts={statusCounts} />
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Admin Console</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">Parirenyatwa Radiotherapy Department</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {highRiskCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-2 border-red-300 rounded-lg">
                  <svg className="w-5 h-5 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-red-900">{highRiskCount} High Risk</span>
                </div>
              )}

              <form action={logout} className="hidden md:block">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  style={{ minHeight: '44px' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-green-900">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* Filter Tabs - Mobile Optimized with Horizontal Scroll */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden hidden md:block">
          <div className="border-b border-gray-200">
            {/* Scrollable container on mobile */}
            <div className="overflow-x-auto scrollbar-hide">
              <nav className="flex -mb-px min-w-max md:min-w-0">
                <Link
                  href="/admin/dashboard"
                  className={`flex-shrink-0 md:flex-1 py-3 px-4 sm:px-6 text-center text-xs sm:text-sm font-semibold border-b-2 transition-all min-h-[60px] flex items-center justify-center ${activeFilter === 'ALL'
                    ? 'border-purple-400 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <span className="whitespace-nowrap">All Patients</span>
                    <span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[24px] h-5 sm:h-6 px-1.5 sm:px-2 text-xs font-bold rounded-full bg-purple-100 text-purple-700">
                      {statusCounts.ALL}
                    </span>
                  </div>
                </Link>
                <Link
                  href="/admin/dashboard?status=CONSULTATION_COMPLETED"
                  className={`flex-shrink-0 md:flex-1 py-3 px-4 sm:px-6 text-center text-xs sm:text-sm font-semibold border-b-2 transition-all min-h-[60px] flex items-center justify-center ${activeFilter === 'CONSULTATION_COMPLETED'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <span className="whitespace-nowrap">Awaiting Scan</span>
                    <span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[24px] h-5 sm:h-6 px-1.5 sm:px-2 text-xs font-bold rounded-full bg-orange-100 text-orange-700">
                      {statusCounts.AWAITING_SCAN}
                    </span>
                  </div>
                </Link>
                <Link
                  href="/admin/dashboard?status=SCANNED"
                  className={`flex-shrink-0 md:flex-1 py-3 px-4 sm:px-6 text-center text-xs sm:text-sm font-semibold border-b-2 transition-all min-h-[60px] flex items-center justify-center ${activeFilter === 'SCANNED' || activeFilter === 'PLANNING'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <span className="whitespace-nowrap">Planning Queue</span>
                    <span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[24px] h-5 sm:h-6 px-1.5 sm:px-2 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                      {statusCounts.PLANNING_QUEUE}
                    </span>
                  </div>
                </Link>
                <Link
                  href="/admin/dashboard?status=PLAN_READY"
                  className={`flex-shrink-0 md:flex-1 py-3 px-4 sm:px-6 text-center text-xs sm:text-sm font-semibold border-b-2 transition-all min-h-[60px] flex items-center justify-center ${activeFilter === 'PLAN_READY'
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <span className="whitespace-nowrap text-center">Ready for<br className="sm:hidden" /> Treatment</span>
                    <span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[24px] h-5 sm:h-6 px-1.5 sm:px-2 text-xs font-bold rounded-full bg-green-100 text-green-700">
                      {statusCounts.PLAN_READY}
                    </span>
                  </div>
                </Link>
                <Link
                  href="/admin/dashboard?status=IN_REVIEWS"
                  className={`flex-shrink-0 md:flex-1 py-3 px-4 sm:px-6 text-center text-xs sm:text-sm font-semibold border-b-2 transition-all min-h-[60px] flex items-center justify-center ${activeFilter === 'IN_REVIEWS'
                    ? 'border-amber-500 text-amber-600 bg-amber-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <span className="whitespace-nowrap text-center">In Reviews</span>
                    <span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[24px] h-5 sm:h-6 px-1.5 sm:px-2 text-xs font-bold rounded-full bg-amber-100 text-amber-700">
                      {statusCounts.IN_REVIEWS}
                    </span>
                  </div>
                </Link>
                <Link
                  href="/admin/dashboard?status=DISCHARGED_GROUP"
                  className={`flex-shrink-0 md:flex-1 py-3 px-4 sm:px-6 text-center text-xs sm:text-sm font-semibold border-b-2 transition-all min-h-[60px] flex items-center justify-center ${activeFilter === 'DISCHARGED_GROUP' || activeFilter === 'TREATMENT_COMPLETED'
                    ? 'border-teal-500 text-teal-600 bg-teal-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <span className="whitespace-nowrap text-center">Discharged</span>
                    <span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[24px] h-5 sm:h-6 px-1.5 sm:px-2 text-xs font-bold rounded-full bg-teal-100 text-teal-700">
                      {statusCounts.COMPLETED}
                    </span>
                  </div>
                </Link>
              </nav>
            </div>
          </div >
        </div >

        {/* Patient Table */}
        < div className="bg-white rounded-xl shadow-md overflow-hidden" >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {activeFilter === 'ALL' && 'All Patients'}
                  {activeFilter === 'CONSULTATION_COMPLETED' && 'Patients Awaiting Scan'}
                  {activeFilter === 'SCANNED' && 'Patients in Planning Queue'}
                  {activeFilter === 'PLANNING' && 'Patients in Planning'}
                  {activeFilter === 'PLAN_READY' && 'Patients Ready for Treatment'}
                  {activeFilter === 'IN_REVIEWS' && 'Patients in Follow-Up Reviews'}
                  {(activeFilter === 'DISCHARGED_GROUP' || activeFilter === 'TREATMENT_COMPLETED') && 'Discharged & Completed Patients'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {typedPatients.length === 0 ? 'No patients found' : `${typedPatients.length} patient${typedPatients.length !== 1 ? 's' : ''}`}
                </p>
                <RealtimeAdminListener />
              </div>

              {typedPatients.length > 0 && typedPatients.filter(hasHighRiskCondition).length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">High Risk</p>
                    <p className="text-lg font-bold text-red-600">{typedPatients.filter(hasHighRiskCondition).length}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {
            typedPatients.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No patients in this category</p>
                <p className="text-sm text-gray-500 mt-1">Patients will appear here once they complete registration</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on mobile */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          MRN
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Admission Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Risk Level
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {typedPatients.map((patient) => {
                        const isHighRisk = hasHighRiskCondition(patient)

                        return (
                          <tr
                            key={patient.id}
                            className={`hover:bg-gray-50 transition-colors ${isHighRisk ? 'bg-red-50/30' : ''}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isHighRisk ? 'bg-red-100 ring-2 ring-red-300' : 'bg-purple-100'
                                  }`}>
                                  <span className={`font-bold text-sm ${isHighRisk ? 'text-red-700' : 'text-purple-700'}`}>
                                    {patient.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {patient.full_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    DOB: {new Date(patient.dob).toLocaleDateString('en-GB')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-mono font-bold text-purple-700">
                                {patient.mrn}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">
                                {new Date(patient.admission_date).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(patient.current_status)}`}>
                                {getStatusLabel(patient.current_status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center">
                                {isHighRisk ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-400 animate-pulse">
                                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <span className="text-xs font-bold text-red-800 uppercase">High</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-300">
                                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                    <span className="text-xs font-medium text-green-800">Standard</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Link
                                href={`/admin/patient/${patient.id}`}
                                className={`inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md ${isHighRisk
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-purple-500 hover:bg-purple-600'
                                  }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                {isHighRisk ? 'Review (⚠️ Risk)' : 'Manage'}
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - Visible only on mobile */}
                <div className="md:hidden space-y-4 p-4">
                  {typedPatients.map((patient) => {
                    const isHighRisk = hasHighRiskCondition(patient)
                    return (
                      <PatientCard
                        key={patient.id}
                        patient={patient}
                        isHighRisk={isHighRisk}
                        statusBadgeColor={getStatusBadgeColor(patient.current_status)}
                        statusLabel={getStatusLabel(patient.current_status)}
                      />
                    )
                  })}
                </div>
              </>
            )
          }
        </div >

        {/* Stats Cards */}
        < div className="grid md:grid-cols-5 gap-4 mt-8" >
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statusCounts.ALL}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Awaiting Scan</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{statusCounts.AWAITING_SCAN}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Planning</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{statusCounts.PLANNING_QUEUE}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Treat</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{statusCounts.PLAN_READY}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Discharged</p>
                <p className="text-3xl font-bold text-teal-600 mt-2">{statusCounts.COMPLETED}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div >

        {/* QR Code Pamphlet Section */}
        < div className="bg-white rounded-xl shadow-md overflow-hidden mt-8" >
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Patient Portal QR Code</h2>
                <p className="text-sm text-gray-600 mt-1">Download for pamphlets and print materials</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* QR Code Preview */}
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border-2 border-dashed border-gray-300">
                <QRCode
                  value="https://pari-nav-system.vercel.app/"
                  size={256}
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                  level="H"
                  showDownload={true}
                  downloadFilename="parirenyatwa-navigation-pamphlet"
                  title="Scan to Navigate Parirenyatwa Hospital"
                />
              </div>

              {/* Download Options */}
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-blue-900">Usage Instructions</h3>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                        <li>Download the QR code image below</li>
                        <li>Include it in pamphlets, posters, or signage</li>
                        <li>Patients scan to access the patient portal</li>
                        <li>Suitable for both print and digital materials</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Additional Info - Download button now in QR component */}
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-green-900">High Quality QR Code</h3>
                      <ul className="text-sm text-green-800 mt-2 space-y-1 list-disc list-inside">
                        <li>Production-ready for printing</li>
                        <li>High error correction for reliability</li>
                        <li>Optimized for scanning at any size</li>
                        <li>Click "Download PNG" above to save</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">Format</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">PNG Image</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">Print Ready</p>
                    <p className="text-sm font-bold text-green-700 mt-1">✓ High Quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div >
      </main >
    </div >
  )
}