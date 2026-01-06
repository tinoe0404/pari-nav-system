// app/admin/patient/[id]/page.tsx (MOBILE-OPTIMIZED)
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/utils/auth-helpers'
import { logPatientScan } from '@/app/admin/actions'
import MobileNav from '@/components/MobileNav'
import { logout } from '@/app/actions/auth'
import type { PatientData } from '@/types/patient'
import type { MedicalHistoryData } from '@/types/intake'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string; error?: string }>
}

export default async function AdminPatientDetailPage({ params, searchParams }: PageProps) {
  // Verify admin access
  try {
    await requireAdmin()
  } catch (error) {
    redirect('/admin/login?error=Unauthorized')
  }

  const { id } = await params
  const { success, error } = await searchParams

  const supabase = await createClient()

  // Fetch patient data
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (patientError || !patient) {
    notFound()
  }

  const typedPatient = patient as PatientData
  const medicalHistory = typedPatient.medical_history as MedicalHistoryData | null

  // Fetch scan logs
  const { data: scanLogs } = await supabase
    .from('scan_logs')
    .select('*')
    .eq('patient_id', id)
    .order('scan_date', { ascending: false })

  // Fetch published treatment plan (if exists)
  const { data: treatmentPlan } = await supabase
    .from('treatment_plans')
    .select('*')
    .eq('patient_id', id)
    .eq('is_published', true)
    .single()

  // Server Action for scan form submission
  async function handleScanSubmit(formData: FormData) {
    'use server'

    const machineRoom = formData.get('machineRoom') as string
    const notes = formData.get('notes') as string

    const result = await logPatientScan({
      patientId: id,
      machineRoom,
      notes,
    })

    if (result.success) {
      redirect(`/admin/patient/${id}?success=Scan logged successfully. Patient status updated to SCANNED.`)
    } else {
      redirect(`/admin/patient/${id}?error=${encodeURIComponent(result.error || 'Failed to log scan')}`)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'REGISTERED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'SCANNED':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'PLANNING':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'PLAN_READY':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'TREATING':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'REGISTERED':
        return 'Intake Complete'
      case 'SCANNED':
        return 'Scanned'
      case 'PLANNING':
        return 'Planning'
      case 'PLAN_READY':
        return 'Plan Ready'
      case 'TREATING':
        return 'Treating'
      default:
        return status
    }
  }

  const hasHighRiskCondition = (condition: keyof MedicalHistoryData['conditions']) => {
    return medicalHistory?.conditions?.[condition] || false
  }

  // Check if ANY high-risk condition exists
  const isHighRiskPatient = medicalHistory?.conditions && (
    medicalHistory.conditions.pacemaker ||
    medicalHistory.conditions.metalImplants ||
    medicalHistory.conditions.pregnant ||
    medicalHistory.conditions.claustrophobia
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #dce3ed 0%, #f1f5f9 100%)', minHeight: '100vh' }}>
      {/* Header - Mobile Optimized */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link
                href="/admin/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">Patient Management</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{typedPatient.full_name} • {typedPatient.mrn}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* High Risk Banner */}
              {isHighRiskPatient && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-100 border-2 border-red-400 rounded-lg animate-pulse">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-red-900">HIGH RISK PATIENT</span>
                </div>
              )}
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeColor(typedPatient.current_status)}`}>
                {getStatusLabel(typedPatient.current_status)}
              </span>
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

        {/* Two-Column Grid - Mobile: Stack vertically */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT COLUMN: Patient Context */}
          <div className="space-y-6">
            {/* Patient Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Patient Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Full Name</p>
                  <p className="text-sm font-semibold text-gray-900">{typedPatient.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Date of Birth</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(typedPatient.dob).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Medical Record Number</p>
                  <p className="text-sm font-mono font-bold text-purple-700">{typedPatient.mrn}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Admission Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(typedPatient.admission_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Medical History Card */}
            {medicalHistory && (
              <div className={`bg-white rounded-xl shadow-md p-6 ${isHighRiskPatient ? 'ring-4 ring-red-300' : ''}`}>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Medical History
                  {isHighRiskPatient && (
                    <span className="ml-auto text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">REVIEW REQUIRED</span>
                  )}
                </h2>

                {/* High-Risk Warning Banner */}
                {isHighRiskPatient && (
                  <div className="mb-5 bg-gradient-to-r from-red-100 to-red-50 border-2 border-red-400 rounded-xl p-5 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-red-900 mb-2">⚠️ HIGH RISK PATIENT</p>
                        <p className="text-sm text-red-800 leading-relaxed">
                          This patient has conditions requiring special protocols. Review all contraindications carefully.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditions Grid */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Medical Conditions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {hasHighRiskCondition('pacemaker') && (
                      <div className="flex items-center gap-2 text-xs bg-red-100 text-red-900 px-3 py-2.5 rounded-lg border-2 border-red-400 font-semibold">
                        <span className="text-base">⚠️</span> Pacemaker
                      </div>
                    )}
                    {hasHighRiskCondition('metalImplants') && (
                      <div className="flex items-center gap-2 text-xs bg-red-100 text-red-900 px-3 py-2.5 rounded-lg border-2 border-red-400 font-semibold">
                        <span className="text-base">⚠️</span> Metal Implants
                      </div>
                    )}
                    {hasHighRiskCondition('pregnant') && (
                      <div className="flex items-center gap-2 text-xs bg-red-100 text-red-900 px-3 py-2.5 rounded-lg border-2 border-red-400 font-semibold">
                        <span className="text-base">⚠️</span> Pregnant
                      </div>
                    )}
                    {hasHighRiskCondition('claustrophobia') && (
                      <div className="flex items-center gap-2 text-xs bg-red-100 text-red-900 px-3 py-2.5 rounded-lg border-2 border-red-400 font-semibold">
                        <span className="text-base">⚠️</span> Claustrophobia
                      </div>
                    )}
                    {hasHighRiskCondition('previousRadiation') && (
                      <div className="text-xs bg-yellow-100 text-yellow-900 px-3 py-2 rounded-lg border border-yellow-300 font-medium">
                        Previous Radiation
                      </div>
                    )}
                    {hasHighRiskCondition('diabetes') && (
                      <div className="text-xs bg-yellow-100 text-yellow-900 px-3 py-2 rounded-lg border border-yellow-300 font-medium">
                        Diabetes
                      </div>
                    )}
                    {hasHighRiskCondition('heartDisease') && (
                      <div className="text-xs bg-yellow-100 text-yellow-900 px-3 py-2 rounded-lg border border-yellow-300 font-medium">
                        Heart Disease
                      </div>
                    )}
                    {hasHighRiskCondition('kidneyDisease') && (
                      <div className="text-xs bg-yellow-100 text-yellow-900 px-3 py-2 rounded-lg border border-yellow-300 font-medium">
                        Kidney Disease
                      </div>
                    )}
                    {hasHighRiskCondition('allergies') && (
                      <div className="text-xs bg-orange-100 text-orange-900 px-3 py-2 rounded-lg border border-orange-300 font-medium">
                        Allergies
                      </div>
                    )}
                  </div>
                </div>

                {/* Allergy Details */}
                {medicalHistory.allergyDetails && (
                  <div className="mb-4 bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                    <p className="text-xs font-semibold text-orange-900 mb-1">⚠️ Allergy Details:</p>
                    <p className="text-sm text-orange-900 font-medium">{medicalHistory.allergyDetails}</p>
                  </div>
                )}

                {/* Current Symptoms */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Current Symptoms:</p>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {medicalHistory.currentSymptoms}
                  </p>
                </div>

                {/* Mobility Status */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Mobility Status:</p>
                  <span className="inline-block text-sm bg-blue-100 text-blue-900 px-4 py-2 rounded-full border border-blue-300 font-semibold">
                    {medicalHistory.mobilityStatus === 'walking' && '🚶 Walking Independently'}
                    {medicalHistory.mobilityStatus === 'assistance_needed' && '🦯 Walking with Assistance'}
                    {medicalHistory.mobilityStatus === 'wheelchair' && '♿ Wheelchair'}
                    {medicalHistory.mobilityStatus === 'stretcher' && '🛏️ Stretcher/Bed'}
                  </span>
                </div>

                {/* Next of Kin */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-purple-900 mb-2">Emergency Contact:</p>
                  <div className="space-y-1 text-sm text-purple-800">
                    <p><span className="font-medium">Name:</span> {medicalHistory.nextOfKin.name}</p>
                    <p><span className="font-medium">Relationship:</span> {medicalHistory.nextOfKin.relationship}</p>
                    <p><span className="font-medium">Phone:</span> {medicalHistory.nextOfKin.phone}</p>
                  </div>
                </div>

                {/* Additional Notes */}
                {medicalHistory.additionalNotes && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Additional Notes:</p>
                    <p className="text-sm text-gray-800">{medicalHistory.additionalNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Actions & Treatment Plan */}
          <div className="space-y-6">
            {/* AWAITING SCAN: Scan Form (Accepts REGISTERED or CONSULTATION_COMPLETED) */}
            {(typedPatient.current_status === 'REGISTERED' || typedPatient.current_status === 'CONSULTATION_COMPLETED') && (
              <div className={`bg-white rounded-xl shadow-md p-6 ${isHighRiskPatient ? 'ring-4 ring-red-300' : ''}`}>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  Log Scan Results
                </h2>

                {isHighRiskPatient && (
                  <div className="mb-5 bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-sm text-amber-900 font-medium">
                        Confirm you have reviewed all high-risk conditions and verified patient eligibility for scanning.
                      </p>
                    </div>
                  </div>
                )}

                <form action={handleScanSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Machine Room <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="machineRoom"
                      required
                      placeholder="e.g., CT Room 1, Scanner A"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Specify the exact scanning equipment used</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technician Notes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="notes"
                      required
                      rows={7}
                      placeholder="Document scan details, patient cooperation, any issues encountered, contrast used, positioning notes..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 10 characters. These notes are confidential.
                      ```
                    </p>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-4 rounded-lg font-bold text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${isHighRiskPatient
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    style={{ minHeight: '44px' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isHighRiskPatient ? 'Confirm High-Risk Scan Complete' : 'Complete Scan & Update Status'}
                  </button>
                </form>
              </div>
            )}

            {/* SCANNED: Planning CTA */}
            {typedPatient.current_status === 'SCANNED' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Scan Complete</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Patient scan has been logged successfully. Proceed to treatment planning.
                  </p>
                  <Link
                    href={`/admin/patient/${id}/plan`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Proceed to Treatment Planning
                  </Link>
                </div>
              </div>
            )}

            {/* PLAN_READY/TREATING: Show Published Plan */}
            {(typedPatient.current_status === 'PLAN_READY' || typedPatient.current_status === 'TREATING') && treatmentPlan && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Published Treatment Plan
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                    PUBLISHED
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Treatment Type */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Treatment Type</p>
                    <p className="text-lg font-bold text-purple-900">{treatmentPlan.treatment_type}</p>
                  </div>

                  {/* Sessions & Schedule */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Sessions</p>
                      <p className="text-2xl font-bold text-blue-900">{treatmentPlan.num_sessions}</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Start Date</p>
                      <p className="text-sm font-bold text-orange-900">
                        {new Date(treatmentPlan.start_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        {new Date(treatmentPlan.start_date).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Prep Instructions */}
                  {treatmentPlan.prep_instructions && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Preparation Instructions</p>
                      <p className="text-sm text-amber-900">{treatmentPlan.prep_instructions}</p>
                    </div>
                  )}

                  {/* Side Effects */}
                  {treatmentPlan.side_effects && treatmentPlan.side_effects.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Monitored Side Effects</p>
                      <div className="flex flex-wrap gap-2">
                        {treatmentPlan.side_effects.map((effect: string) => (
                          <span key={effect} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-300">
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Plan Metadata */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Plan Details</p>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p><span className="font-medium">Published:</span> {new Date(treatmentPlan.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                      <p><span className="font-medium">Last Updated:</span> {new Date(treatmentPlan.updated_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-3">
                      This plan is now visible to the patient in their dashboard. They have been notified of their treatment schedule.
                    </p>
                    <Link
                      href="/admin/dashboard"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Scan Logs History */}
            {scanLogs && scanLogs.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Scan History
                </h2>
                <div className="space-y-3">
                  {scanLogs.map((log: any) => (
                    <div key={log.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded">{log.machine_room}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.scan_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{log.scan_notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}