// app/dashboard/page.tsx (UPDATED WITH TREATMENT PLAN REVEAL)
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/actions/auth'
import Roadmap from '@/components/Roadmap'
import PatientInfoCard from '@/components/PatientInfoCard'
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

  if (patientError || !patient) {
    console.error('Patient lookup error:', patientError)
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
            We couldn't find your patient record. Please contact the registration desk.
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  const typedPatient = patient as PatientData

  // ONBOARDING GATE
  if (!typedPatient.onboarding_completed) {
    redirect('/patient/intake')
  }

  // Fetch treatment plan if status is PLAN_READY or TREATING
  let typedPlan: TreatmentPlan | null = null
  if (typedPatient.current_status === 'PLAN_READY' || typedPatient.current_status === 'TREATING') {
    const { data: treatmentPlan } = await supabase
      .from('treatment_plans')
      .select('*')
      .eq('patient_id', typedPatient.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    typedPlan = treatmentPlan as TreatmentPlan | null
  }

  // Helper function to format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' })
    const day = date.toLocaleDateString('en-GB', { day: 'numeric' })
    const month = date.toLocaleDateString('en-GB', { month: 'long' })
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
    return { dayName, day, month, time, fullDate: `${dayName}, ${day} ${month}` }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Parirenyatwa Navigation
              </h1>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Onboarding Complete Banner */}
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

        {/* TREATMENT TICKET - Shows when status is PLAN_READY */}
        {typedPlan && typedPatient.current_status === 'PLAN_READY' && (
          <div className="mb-8 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-bold">Treatment Confirmed</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Your Treatment is Ready</h2>
                  <p className="text-green-100 text-sm">Please arrive 15 minutes early</p>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Date & Time Display */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-4 border border-white/20">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-green-100 text-xs font-medium mb-2">APPOINTMENT DATE</p>
                    <p className="text-3xl font-bold">
                      {formatDateTime(typedPlan.start_date).fullDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-100 text-xs font-medium mb-2">TIME</p>
                    <p className="text-3xl font-bold">
                      {formatDateTime(typedPlan.start_date).time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location & Treatment Type */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-green-100 text-xs font-medium mb-1">LOCATION</p>
                  <p className="text-lg font-bold">
                    {typedPlan.prep_instructions?.includes('Room 1') && 'Room 1 (Linear Accelerator)'}
                    {typedPlan.prep_instructions?.includes('Room 2') && 'Room 2 (Brachytherapy Suite)'}
                    {typedPlan.prep_instructions?.includes('Room 3') && 'Room 3 (CT Simulator)'}
                    {!typedPlan.prep_instructions?.includes('Room') && 'Treatment Center'}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-green-100 text-xs font-medium mb-1">TREATMENT TYPE</p>
                  <p className="text-lg font-bold">{typedPlan.treatment_type}</p>
                </div>
              </div>

              {/* Preparation Instructions - HIGH VISIBILITY */}
              {typedPlan.prep_instructions && (
                <div className="bg-amber-500 rounded-xl p-4 border-2 border-amber-300 mb-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-amber-900 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-bold text-amber-900 mb-1">⚠️ IMPORTANT PREPARATION</p>
                      <p className="text-sm text-amber-900 font-medium">{typedPlan.prep_instructions}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sessions Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs font-medium mb-1">TOTAL SESSIONS</p>
                    <p className="text-2xl font-bold">{typedPlan.num_sessions} Sessions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-xs font-medium mb-1">SESSION 1 OF {typedPlan.num_sessions}</p>
                    <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-1/12 h-full bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Effects Section */}
            {typedPlan.side_effects && typedPlan.side_effects.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 p-6">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  What to Expect - Possible Side Effects
                </h3>
                <div className="flex flex-wrap gap-2">
                  {typedPlan.side_effects.map((effect, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 text-xs bg-white/10 text-white px-3 py-1.5 rounded-full border border-white/20"
                    >
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      {effect}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-green-100 mt-3">
                  Not everyone experiences these effects. Contact your care team if you have concerns.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {typedPatient.full_name.split(' ')[0]}
          </h2>
          <p className="text-gray-600">
            Track your treatment journey and get real-time updates.
          </p>
        </div>

        {/* Patient Info Card */}
        <div className="mb-8">
          <PatientInfoCard patient={typedPatient} />
        </div>

        {/* Treatment Journey Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
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
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:+2634123456"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
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
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 border-2 border-blue-300 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm">
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