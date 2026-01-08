// app/dashboard/page.tsx (MOBILE-OPTIMIZED + REALTIME)
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/actions/auth'
import Roadmap from '@/components/Roadmap'
import PatientInfoCard from '@/components/PatientInfoCard'
import Phase1HeroCard from '@/components/Phase1HeroCard'
import Phase2HeroCard from '@/components/Phase2HeroCard'
import TreatmentTicket from '@/components/TreatmentTicket'
import MobileNav from '@/components/MobileNav'
import RealtimeListener from '@/components/RealtimeListener'
import type { PatientData, TreatmentPlan } from '@/types/patient'

export default async function PatientDashboard({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>
}) {
  const { onboarding } = await searchParams

  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch patient data
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // ============================================
  // CRITICAL FIX: Check for patient existence first
  // ============================================
  if (patientError || !patient) {
    // PGRST116 is expected when no patient record exists (not a real error)
    const isNoRecordError = patientError?.code === 'PGRST116'

    if (!isNoRecordError && patientError) {
      // Only log actual errors, not "no record found" cases
      console.error('Patient lookup error:', {
        code: patientError.code,
        message: patientError.message,
        details: patientError.details,
        hint: patientError.hint,
      })
      console.error('User ID:', user?.id)
      console.error('User email:', user?.email)
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Patient Record Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your patient record. This may happen if you haven't completed registration yet.
            Please contact the registration desk or try registering again.
          </p>
          <div className="flex flex-col gap-3">
            <form action={logout}>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Return to Login
              </button>
            </form>
            <a
              href="/register"
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
            >
              Register Again
            </a>
          </div>
        </div>
      </div>
    )
  }

  const typedPatient = patient as PatientData

  // ============================================
  // THE GATE: Blocking redirect if medical_history is empty/null
  // ============================================
  // Check medical_history directly (the source of truth)
  const hasMedicalHistory = typedPatient.medical_history &&
    Object.keys(typedPatient.medical_history).length > 0

  if (!hasMedicalHistory) {
    console.log('Blocking redirect: medical_history is empty/null')
    redirect('/onboarding')
  }

  // Fetch treatment plan if exists
  const { data: treatmentPlan } = await supabase
    .from('treatment_plans')
    .select('*')
    .eq('patient_id', typedPatient.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const typedPlan = treatmentPlan as TreatmentPlan | null

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #c7d2fe 0%, #e0e7ff 50%, #f8fafc 100%)', minHeight: '100vh' }}>
      {/* Header - Mobile Optimized */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4  sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Mobile Nav + Logo */}
            <div className="flex items-center gap-3">
              <MobileNav isPatient onLogout={logout} />
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                  Parirenyatwa Navigation
                </h1>
              </div>
            </div>
            {/* Desktop Logout Button - Hidden on mobile */}
            <form action={logout} className="hidden md:block">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                style={{ minHeight: '44px' }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden lg:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {onboarding === 'complete' && (
          <div className="mb-8 bg-green-50 border-2 border-green-200 rounded-2xl p-6 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-1">
                  Intake Form Completed!
                </h3>
                <p className="text-sm text-green-700">
                  Thank you for completing your medical intake. Our team has received your information and will use it to provide you with the best possible care.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Message - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {typedPatient.full_name.split(' ')[0]}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Track your treatment journey and get real-time updates.
          </p>
        </div>

        {/* Patient Info Card */}
        <div className="mb-8">
          <PatientInfoCard patient={typedPatient} />
        </div>

        {/* ============================================ */}
        {/* STATE-BASED HERO CARDS */}
        {/* ============================================ */}
        {/* Show consultation hero card for INTAKE_COMPLETED status */}
        {typedPatient.current_status === 'INTAKE_COMPLETED' && (
          <Phase1HeroCard
            consultantRoom={typedPatient.consultant_name ? 'Room 104' : 'Room 104'}
          />
        )}

        {/* Show planning hero card when scanned or consultation completed */}
        {(typedPatient.current_status === 'SCANNED' ||
          typedPatient.current_status === 'CONSULTATION_COMPLETED') && (
            <Phase2HeroCard />
          )}

        {/* Treatment Journey Section - Show for all statuses but less prominent for early stages */}
        <div className={`bg-white rounded-2xl shadow-lg p-6 mb-8 ${typedPatient.current_status === 'REGISTERED' ||
          typedPatient.current_status === 'INTAKE_COMPLETED' ||
          typedPatient.current_status === 'CONSULTATION_COMPLETED' ||
          typedPatient.current_status === 'SCANNED'
          ? 'opacity-75'
          : ''
          }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Your Journey</h3>
          </div>

          <Roadmap
            currentStatus={typedPatient.current_status}
            consultantRoom={typedPatient.consultant_name ? 'Room 104' : undefined}
            scanRoom="Room S234"
            hasPlan={!!typedPlan}
          />
        </div>

        {/* ============================================ */}
        {/* PHASE 3: THE TICKET (PLAN_READY/TREATING) */}
        {/* ============================================ */}
        {typedPlan &&
          (typedPatient.current_status === 'PLAN_READY' || typedPatient.current_status === 'TREATING') && (
            <TreatmentTicket
              plan={typedPlan}
              patientName={typedPatient.full_name}
            />
          )}

        {/* Legacy Treatment Plan Card - Show only if not PLAN_READY/TREATING */}
        {typedPlan &&
          typedPatient.current_status !== 'PLAN_READY' &&
          typedPatient.current_status !== 'TREATING' && (
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Your Treatment Plan</h3>
                  <p className="text-purple-100 text-sm">Ready to begin</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-purple-200 text-sm mb-1">Treatment Type</p>
                  <p className="text-xl font-bold">{typedPlan.treatment_type}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-purple-200 text-sm mb-1">Sessions</p>
                    <p className="text-2xl font-bold">{typedPlan.num_sessions}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-purple-200 text-sm mb-1">Start Date</p>
                    <p className="text-lg font-bold">
                      {new Date(typedPlan.start_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {typedPlan.prep_instructions && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-purple-200 text-sm mb-2 font-semibold">
                      Preparation Instructions
                    </p>
                    <p className="text-sm leading-relaxed">
                      {typedPlan.prep_instructions}
                    </p>
                  </div>
                )}

                {typedPlan.side_effects && typedPlan.side_effects.length > 0 && (
                  <div className="bg-amber-500/20 backdrop-blur-sm rounded-xl p-4 border border-amber-400/30">
                    <p className="text-amber-100 text-sm mb-2 font-semibold">
                      Possible Side Effects
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {typedPlan.side_effects.map((effect, index) => (
                        <span
                          key={index}
                          className="inline-block text-xs bg-white/20 px-3 py-1 rounded-full"
                        >
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Help Card */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold text-blue-900 mb-2">
                Need Assistance?
              </h4>
              <p className="text-blue-700 text-sm mb-4">
                If you have any questions or need help finding your way, our staff is here to help.
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="tel:+2634123456"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                  style={{ minHeight: '44px' }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Call Reception
                </a>
                <button
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-700 border-2 border-blue-300 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
                  style={{ minHeight: '44px' }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Live Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}