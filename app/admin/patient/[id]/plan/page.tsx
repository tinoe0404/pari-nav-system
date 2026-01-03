// app/admin/patient/[id]/plan/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { publishTreatmentPlan } from '@/app/admin/actions'
import type { TreatmentPlanInput } from '@/app/admin/actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TreatmentPlanningPage({ params }: PageProps) {
  const router = useRouter()
  const [patientId, setPatientId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [treatmentType, setTreatmentType] = useState<'External Beam' | 'Brachytherapy'>('External Beam')
  const [numSessions, setNumSessions] = useState<number>(15)
  const [startDate, setStartDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('09:00')
  const [treatmentRoom, setTreatmentRoom] = useState<string>('Room 1 (Linear Accelerator)')
  const [prepInstructions, setPrepInstructions] = useState<string>('Full Bladder')
  const [sideEffects, setSideEffects] = useState<string[]>([])

  // Unwrap params on mount
  useState(() => {
    params.then(p => setPatientId(p.id))
  })

  const handleSideEffectToggle = (effect: string) => {
    setSideEffects(prev =>
      prev.includes(effect)
        ? prev.filter(e => e !== effect)
        : [...prev, effect]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validate
    if (!startDate) {
      setError('Please select a start date')
      setIsSubmitting(false)
      return
    }

    if (numSessions < 1 || numSessions > 50) {
      setError('Number of sessions must be between 1 and 50')
      setIsSubmitting(false)
      return
    }

    // Combine date and time
    const startDateTime = `${startDate}T${startTime}:00`

    // Build prep instructions text
    const prepText = `Patient must arrive with: ${prepInstructions}. Treatment will be administered in ${treatmentRoom}.`

    const input: TreatmentPlanInput = {
      patientId,
      treatmentType,
      numSessions,
      startDate: startDateTime,
      prepInstructions: prepText,
      sideEffects: sideEffects.length > 0 ? sideEffects : undefined,
    }

    try {
      const result = await publishTreatmentPlan(input)

      if (result.success) {
        // Redirect to admin dashboard
        router.push('/admin/dashboard?success=Treatment plan published successfully')
      } else {
        setError(result.error || 'Failed to publish treatment plan')
        setIsSubmitting(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsSubmitting(false)
      console.error('Plan submission error:', err)
    }
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/patient/${patientId}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Treatment Planning</h1>
              <p className="text-sm text-gray-600">Create and publish treatment schedule</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-1">
                Medical Physicist Review Required
              </h3>
              <p className="text-sm text-blue-700">
                This treatment plan will be immediately visible to the patient once published. 
                Please verify all details carefully before submission.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
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

        {/* Planning Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Logistics */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Treatment Logistics</h2>
                <p className="text-sm text-gray-600">Schedule and location details</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Treatment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Treatment Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    treatmentType === 'External Beam'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}>
                    <input
                      type="radio"
                      name="treatmentType"
                      value="External Beam"
                      checked={treatmentType === 'External Beam'}
                      onChange={(e) => setTreatmentType(e.target.value as 'External Beam')}
                      className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm font-semibold text-gray-700">External Beam</span>
                  </label>
                  <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    treatmentType === 'Brachytherapy'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}>
                    <input
                      type="radio"
                      name="treatmentType"
                      value="Brachytherapy"
                      checked={treatmentType === 'Brachytherapy'}
                      onChange={(e) => setTreatmentType(e.target.value as 'Brachytherapy')}
                      className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm font-semibold text-gray-700">Brachytherapy</span>
                  </label>
                </div>
              </div>

              {/* Number of Sessions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Sessions <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={numSessions}
                  onChange={(e) => setNumSessions(parseInt(e.target.value))}
                  disabled={isSubmitting}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Typical range: 1-40 sessions</p>
              </div>

              {/* Start Date & Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Treatment Room */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treatment Room <span className="text-red-500">*</span>
                </label>
                <select
                  value={treatmentRoom}
                  onChange={(e) => setTreatmentRoom(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100"
                >
                  <option value="Room 1 (Linear Accelerator)">Room 1 (Linear Accelerator)</option>
                  <option value="Room 2 (Brachytherapy Suite)">Room 2 (Brachytherapy Suite)</option>
                  <option value="Room 3 (CT Simulator)">Room 3 (CT Simulator)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Patient Prep & Care */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Patient Preparation & Care</h2>
                <p className="text-sm text-gray-600">Instructions and side effects</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Preparation Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preparation Instructions <span className="text-red-500">*</span>
                </label>
                <select
                  value={prepInstructions}
                  onChange={(e) => setPrepInstructions(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100"
                >
                  <option value="Full Bladder">Full Bladder (drink 500ml water 1 hour before)</option>
                  <option value="Empty Bladder">Empty Bladder (void immediately before treatment)</option>
                  <option value="Fasting">Fasting (no food 4 hours before treatment)</option>
                  <option value="Standard Prep">Standard Prep (no special requirements)</option>
                </select>
              </div>

              {/* Potential Side Effects */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Potential Side Effects
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Fatigue',
                    'Skin Redness',
                    'Nausea',
                    'Urinary Irritation',
                    'Bowel Changes',
                    'Hair Loss',
                    'Loss of Appetite',
                    'Dry Mouth',
                  ].map((effect) => (
                    <label
                      key={effect}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        sideEffects.includes(effect)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={sideEffects.includes(effect)}
                        onChange={() => handleSideEffectToggle(effect)}
                        disabled={isSubmitting}
                        className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{effect}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select all side effects the patient should be aware of
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-xl p-6 text-white">
            <div className="flex items-start gap-4 mb-4">
              <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold mb-1">Ready to Publish?</p>
                <p className="text-sm text-purple-100">
                  The patient will receive immediate notification of their treatment schedule. 
                  Ensure all details are accurate before publishing.
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-purple-700 py-4 rounded-lg font-bold text-lg hover:bg-purple-50 transition-colors shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publishing Plan...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  PUBLISH TREATMENT PLAN
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}