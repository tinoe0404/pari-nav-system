// app/admin/patient/[id]/page.tsx (MOBILE-OPTIMIZED)
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/utils/auth-helpers'
import { logPatientScan, completeTreatment } from '@/app/admin/actions'
import {
  schedulePostTreatmentReviews,
  markReviewComplete,
  finalizeTreatmentSuccess,
  restartTreatment,
  markTreatmentComplete
} from '@/app/admin/review-actions'
import MobileNav from '@/components/MobileNav'
import { logout } from '@/app/actions/auth'
import type { PatientData, TreatmentReview } from '@/types/patient'
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

  // Fetch reviews ONLY for the current active treatment plan
  const { data: reviews } = await supabase
    .from('treatment_reviews')
    .select('*')
    .eq('patient_id', id)
    .order('review_number', { ascending: true })

  const typedReviews = ((reviews || []) as TreatmentReview[])
    .filter(r => treatmentPlan ? r.treatment_plan_id === treatmentPlan.id : true)


  // Server Action for scan form submission
  async function handleScanSubmit(formData: FormData) {
    'use server'

    const machineRoom = formData.get('machineRoom') as string
    const notes = formData.get('notes') as string

    // New CT Scan Fields
    const position = formData.get('position') as string
    const immobilization = formData.getAll('immobilization') as string[]
    const bladderProtocol = formData.get('bladderProtocol') as string
    const metalImplants = formData.get('metalImplants') as string
    const headshell = formData.get('headshell') as string

    const result = await logPatientScan({
      patientId: id,
      machineRoom,
      notes,
      scanDetails: {
        position,
        immobilization,
        bladderProtocol,
        metalImplants: metalImplants === 'yes',
        headshell: headshell === 'yes'
      }
    })

    if (result.success) {
      redirect(`/admin/patient/${id}?success=Scan logged successfully. Patient status updated to SCANNED.`)
    } else {
      redirect(`/admin/patient/${id}?error=${encodeURIComponent(result.error || 'Failed to log scan')}`)
    }
  }

  // Server Action for scheduling reviews
  async function handleScheduleReviews(formData: FormData) {
    'use server'

    const result = await schedulePostTreatmentReviews({
      patientId: id,
      treatmentPlanId: treatmentPlan?.id || '',
      reviews: [
        {
          reviewNumber: 1,
          reviewDate: formData.get('review1Date') as string,
          officeLocation: formData.get('review1Office') as string,
        },
        {
          reviewNumber: 2,
          reviewDate: formData.get('review2Date') as string,
          officeLocation: formData.get('review2Office') as string,
        },
        {
          reviewNumber: 3,
          reviewDate: formData.get('review3Date') as string,
          officeLocation: formData.get('review3Office') as string,
        },
      ],
    })

    if (result.success) {
      const message = result.warning || 'Reviews scheduled successfully. Patient notified via email.'
      redirect(`/admin/patient/${id}?success=${encodeURIComponent(message)}`)
    } else {
      redirect(`/admin/patient/${id}?error=${encodeURIComponent(result.error || 'Failed to schedule reviews')}`)
    }
  }

  // Server Action for marking review complete
  async function handleMarkReviewComplete(reviewId: string, notes: string) {
    'use server'

    const result = await markReviewComplete(reviewId, notes)

    if (result.success) {
      redirect(`/admin/patient/${id}?success=Review marked as complete. Patient status updated.`)
    } else {
      redirect(`/admin/patient/${id}?error=${encodeURIComponent(result.error || 'Failed to mark review complete')}`)
    }
  }

  // Server Action for treatment success
  async function handleTreatmentSuccess(formData: FormData) {
    'use server'

    const outcomeNotes = formData.get('outcomeNotes') as string
    const result = await finalizeTreatmentSuccess(id, outcomeNotes)

    if (result.success) {
      redirect(`/admin/patient/${id}?success=Treatment finalized as successful! Patient journey complete.`)
    } else {
      redirect(`/admin/patient/${id}?error=${encodeURIComponent(result.error || 'Failed to finalize treatment')}`)
    }
  }

  // Server Action for treatment restart
  async function handleTreatmentRestart(formData: FormData) {
    'use server'

    const reason = formData.get('reason') as string
    const result = await restartTreatment(id, reason)

    if (result.success) {
      redirect(`/admin/patient/${id}?success=Treatment restarted. Patient returned to planning queue.`)
    } else {
      redirect(`/admin/patient/${id}?error=${encodeURIComponent(result.error || 'Failed to restart treatment')}`)
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
      case 'TREATMENT_COMPLETED':
        return 'bg-teal-100 text-teal-800 border-teal-300'
      case 'REVIEW_1_PENDING':
      case 'REVIEW_2_PENDING':
      case 'REVIEW_3_PENDING':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'REVIEWS_COMPLETED':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'JOURNEY_COMPLETE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
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
      case 'TREATMENT_COMPLETED':
        return 'Treatment Complete'
      case 'REVIEW_1_PENDING':
        return 'Review 1 Pending'
      case 'REVIEW_2_PENDING':
        return 'Review 2 Pending'
      case 'REVIEW_3_PENDING':
        return 'Review 3 Pending'
      case 'REVIEWS_COMPLETED':
        return 'Awaiting Decision'
      case 'JOURNEY_COMPLETE':
        return 'Journey Complete ✓'
      default:
        return status
    }
  }



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

              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeColor(typedPatient.current_status)}`}>
                {getStatusLabel(typedPatient.current_status)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
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
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Medical History
                </h2>



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
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  Log Scan Results
                </h2>

                <form action={handleScanSubmit} className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3">CT Scan Context</h4>

                    {/* Machine Room */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Machine Room <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="machineRoom"
                        required
                        placeholder="e.g., CT Room 1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    {/* 1. Position */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        1. Patient Position <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="position" value="Supine" required className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Supine</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="position" value="Prone" required className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Prone</span>
                        </label>
                      </div>
                    </div>

                    {/* 2. Immobilization Devices */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        2. Immobilization Devices
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Headrest B', 'Breast Board', 'Knee Support', 'Vacbag', 'Footrest'].map((device) => (
                          <label key={device} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="immobilization" value={device} className="w-4 h-4 text-blue-600 rounded" />
                            <span className="text-sm text-gray-700">{device}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 3. Bladder Protocol */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        3. Bladder Filling Protocol
                      </label>
                      <input
                        type="text"
                        name="bladderProtocol"
                        placeholder="e.g., Full bladder, Empty bladder"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    {/* 4. Metal Implants */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        4. Metal Implants present? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="metalImplants" value="yes" required className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="metalImplants" value="no" required className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">No</span>
                        </label>
                      </div>
                    </div>

                    {/* 5. Headshell */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        5. Headshell used? <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="headshell" value="yes" required className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">YES</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="headshell" value="no" required className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">NO</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Technician Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Any specific comments on patient setup or issues..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-lg font-bold text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                    style={{ minHeight: '44px' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete Scan & Update Status
                  </button>
                </form>
              </div>
            )}

            {/* SCANNED: Planning CTA */}
            {typedPatient.current_status === 'SCANNED' && (
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
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
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
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

            {/* STEP 1: MARK TREATMENT COMPLETE (New) */}
            {(typedPatient.current_status === 'TREATING' || typedPatient.current_status === 'PLAN_READY') && typedReviews.length === 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-md p-4 sm:p-6 mb-6">
                <h2 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Treatment Complete?
                </h2>

                <div className="mb-6 bg-green-100/50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-sm text-green-900 font-medium">
                    Has the patient finished their full course of radiotherapy?
                  </p>
                  <p className="text-sm text-green-800 mt-2">
                    Clicking "Confirm Completion" will:
                  </p>
                  <ul className="list-disc list-inside text-xs text-green-800 ml-2 mt-1 space-y-1">
                    <li>Mark the patient status as <strong>Treatment Completed</strong></li>
                    <li>Send a <strong>"Treatment Successful"</strong> email to the patient</li>
                    <li>Unlock the <strong>Review Scheduling</strong> form below</li>
                  </ul>
                </div>

                <form action={async () => {
                  'use server'
                  await markTreatmentComplete(id)
                }}>
                  <button
                    type="submit"
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    Confirm Treatment Completion
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: SCHEDULE REVIEWS (Only after treatment is marked complete) */}
            {typedPatient.current_status === 'TREATMENT_COMPLETED' && typedReviews.length === 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-md p-4 sm:p-6 mb-6">
                <h2 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Post-Treatment Reviews
                </h2>

                <div className="mb-6 bg-blue-100/50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-900 font-medium">
                    Treatment is confirmed complete. Now schedule 3 follow-up review appointments to monitor the patient's recovery.
                  </p>
                </div>

                <form action={handleScheduleReviews} className="space-y-6">
                  {[1, 2, 3].map(num => (
                    <div key={num} className="bg-white border-2 border-blue-200 rounded-lg p-4 sm:p-5">
                      <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {num}
                        </span>
                        Review {num}
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Review Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name={`review${num}Date`}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Office/Room Location <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name={`review${num}Office`}
                            required
                            placeholder="e.g., Oncology Clinic Room 3"
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule All Reviews & Notify Patient
                  </button>
                </form>
              </div>
            )}

            {/* REVIEW PROGRESS: Show when reviews are scheduled */}
            {typedReviews.length > 0 && ['REVIEW_1_PENDING', 'REVIEW_2_PENDING', 'REVIEW_3_PENDING'].includes(typedPatient.current_status) && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Post-Treatment Reviews
                </h2>

                <div className="space-y-4">
                  {typedReviews.map(review => (
                    <div
                      key={review.id}
                      className={`border-2 rounded-lg p-5 ${review.is_completed
                        ? 'bg-green-50 border-green-300'
                        : 'bg-orange-50 border-orange-300'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${review.is_completed ? 'bg-green-600' : 'bg-orange-600'
                            }`}>
                            {review.is_completed ? '✓' : review.review_number}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">Review {review.review_number}</h3>
                            <p className="text-sm text-gray-600">
                              📅 {new Date(review.review_date).toLocaleDateString('en-GB', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-sm text-gray-600">📍 {review.office_location}</p>
                          </div>
                        </div>

                        {review.is_completed && (
                          <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                            COMPLETED
                          </span>
                        )}
                      </div>

                      {review.is_completed ? (
                        <div className="mt-3 bg-white border border-green-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-green-700 mb-1">
                            Completed: {new Date(review.completed_at!).toLocaleDateString('en-GB')}
                          </p>
                          {review.review_notes && (
                            <p className="text-sm text-gray-700 mt-2">
                              <span className="font-semibold">Notes:</span> {review.review_notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <form
                          action={async (formData: FormData) => {
                            'use server'
                            const notes = formData.get('notes') as string
                            await handleMarkReviewComplete(review.id, notes)
                          }}
                          className="mt-4"
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Review Notes (Optional)
                          </label>
                          <textarea
                            name="notes"
                            rows={3}
                            placeholder="Add any observations or notes from this review..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none mb-3"
                          />
                          <button
                            type="submit"
                            className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mark Review {review.review_number} as Complete
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FINAL DECISION: Show when all reviews are complete */}
            {typedPatient.current_status === 'REVIEWS_COMPLETED' && (
              <div className="space-y-6 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    All Reviews Complete - Final Decision Required
                  </h2>
                  <p className="text-sm text-purple-800">
                    All 3 post-treatment reviews have been completed. Please make a final decision on the treatment outcome.
                  </p>
                </div>

                {/* Treatment Successful Option */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ✅ Treatment Successful
                  </h3>
                  <p className="text-sm text-green-800 mb-4">
                    Mark this treatment as successful. The patient will be notified that their cancer treatment journey is complete.
                  </p>

                  <form action={handleTreatmentSuccess}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Success Notes (Optional)
                    </label>
                    <textarea
                      name="outcomeNotes"
                      rows={3}
                      placeholder="Add any final notes about the successful outcome..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none resize-none mb-4"
                    />
                    <button
                      type="submit"
                      className="w-full py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Confirm Treatment Success & Complete Journey
                    </button>
                  </form>
                </div>

                {/* Treatment Restart Option */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    🔄 Restart Treatment
                  </h3>
                  <p className="text-sm text-amber-800 mb-4">
                    If the treatment was not successful, restart the process. The patient will return to the planning stage for a new treatment plan.
                  </p>

                  <form action={handleTreatmentRestart}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Restart <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="reason"
                      rows={4}
                      required
                      placeholder="Explain why the treatment needs to be restarted (e.g., tumor progression, treatment ineffective, etc.)..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none mb-4"
                    />
                    <button
                      type="submit"
                      className="w-full py-4 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Restart Treatment Process
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* JOURNEY COMPLETE: Show completion message */}
            {typedPatient.current_status === 'JOURNEY_COMPLETE' && (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl shadow-lg p-8 mb-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-3">
                  Treatment Journey Complete!
                </h2>
                <p className="text-emerald-800 mb-4">
                  This patient has successfully completed their entire cancer treatment journey.
                  All reviews were satisfactory and treatment has been marked as successful.
                </p>
                <div className="inline-block bg-emeraldcol-600 text-white px-6 py-3 rounded-lg font-bold">
                  ✓ Journey Completed
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
      </main >
    </div >
  )
}