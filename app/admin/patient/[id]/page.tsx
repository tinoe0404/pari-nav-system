// app/admin/patient/[id]/page.tsx
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/utils/auth-helpers'
import { logPatientScan } from '@/app/admin/actions'
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
      redirect(`/admin/patient/${id}?success=Scan logged successfully`)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Patient Management</h1>
                <p className="text-sm text-gray-600">{typedPatient.full_name} • {typedPatient.mrn}</p>
              </div>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeColor(typedPatient.current_status)}`}>
              {getStatusLabel(typedPatient.current_status)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-green-900">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* Two-Column Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: Patient Context (Read-Only Intake Data) */}
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
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Medical History
                </h2>

                {/* High-Risk Conditions Warning */}
                {(hasHighRiskCondition('pacemaker') || 
                  hasHighRiskCondition('metalImplants') || 
                  hasHighRiskCondition('pregnant') || 
                  hasHighRiskCondition('claustrophobia')) && (
                  <div className="mb-4 bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-bold text-red-900 mb-1">⚠️ HIGH RISK PATIENT</p>
                        <p className="text-xs text-red-800">Review conditions carefully before scanning</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditions List */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-semibold text-gray-700">Medical Conditions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {hasHighRiskCondition('pacemaker') && (
                      <div className="flex items-center gap-2 text-xs bg-red-100 text-red-800 px-3 py-2 rounded-lg border border-red-300">
                        <span className="font-bold">⚠️</span> Pacemaker
                      </div>
                    )}
                    {hasHighRiskCondition('metalImplants') && (
                      <div className="flex items-center gap-2 text-xs bg-red-100 text-red-800 px-3 py-2 rounded-lg border border-red-300">
                        <span className="font-bold">⚠️</span> Metal Implants
                      </div>
                    )}
                    {hasHighRiskCondition('pregnant') && (
                      <div className="flex items-center gap-2 text-xs bg-red-100 text-red-800 px-3 py-2 rounded-lg border border-red-300">
                        <span className="font-bold">⚠️</span> Pregnant
                      </div>
                    )}
                    {hasHighRiskCondition('claustrophobia') && (
                      <div className="flex items-center gap-2 text-xs bg-red-100 text-red-800 px-3 py-2 rounded-lg border border-red-300">
                        <span className="font-bold">⚠️</span> Claustrophobia
                      </div>
                    )}
                    {hasHighRiskCondition('previousRadiation') && (
                      <div className="text-xs bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg border border-yellow-300">
                        Previous Radiation
                      </div>
                    )}
                    {hasHighRiskCondition('diabetes') && (
                      <div className="text-xs bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg border border-yellow-300">
                        Diabetes
                      </div>
                    )}
                    {hasHighRiskCondition('heartDisease') && (
                      <div className="text-xs bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg border border-yellow-300">
                        Heart Disease
                      </div>
                    )}
                    {hasHighRiskCondition('kidneyDisease') && (
                      <div className="text-xs bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg border border-yellow-300">
                        Kidney Disease
                      </div>
                    )}
                    {hasHighRiskCondition('allergies') && (
                      <div className="text-xs bg-orange-100 text-orange-800 px-3 py-2 rounded-lg border border-orange-300">
                        Allergies
                      </div>
                    )}
                  </div>
                </div>

                {/* Allergy Details */}
                {medicalHistory.allergyDetails && (
                  <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-orange-900 mb-1">Allergy Details:</p>
                    <p className="text-sm text-orange-800">{medicalHistory.allergyDetails}</p>
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
                  <span className="inline-block text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-300">
                    {medicalHistory.mobilityStatus === 'walking' && '🚶 Walking Independently'}
                    {medicalHistory.mobilityStatus === 'assistance_needed' && '🦯 Walking with Assistance'}
                    {medicalHistory.mobilityStatus === 'wheelchair' && '♿ Wheelchair'}
                    {medicalHistory.mobilityStatus === 'stretcher' && '🛏️ Stretcher/Bed'}
                  </span>
                </div>

                {/* Next of Kin */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
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

          {/* RIGHT COLUMN: Actions */}
          <div className="space-y-6">
            {/* REGISTERED Status: Show Scan Form */}
            {typedPatient.current_status === 'REGISTERED' && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  Log Scan Results
                </h2>

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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technician Notes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="notes"
                      required
                      rows={6}
                      placeholder="Document scan details, patient cooperation, any issues encountered..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      These notes are confidential and only visible to clinical staff.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete Scan & Update Status
                  </button>
                </form>
              </div>
            )}

            {/* SCANNED Status: Show Scan Complete Badge */}
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
                    Patient scan has been logged. Proceed to treatment planning.
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

            {/* Scan Logs History (if any) */}
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
                    <div key={log.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-semibold text-purple-700">{log.machine_room}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.scan_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{log.scan_notes}</p>
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