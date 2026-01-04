// app/admin/patient/[id]/plan/page.tsx
'use client'

import { useState, useEffect } from 'react'
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Form state
  const [treatmentType, setTreatmentType] = useState<'External Beam' | 'Brachytherapy'>('External Beam')
  const [numSessions, setNumSessions] = useState<number>(15)
  const [startDate, setStartDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('09:00')
  const [treatmentRoom, setTreatmentRoom] = useState<string>('Room 1 (Linear Accelerator)')
  const [prepInstructions, setPrepInstructions] = useState<string>('Full Bladder')
  const [sideEffects, setSideEffects] = useState<string[]>([])

  // Unwrap params on mount
  useEffect(() => {
    params.then(p => setPatientId(p.id))
  }, [params])

  const handleSideEffectToggle = (effect: string) => {
    setSideEffects(prev =>
      prev.includes(effect)
        ? prev.filter(e => e !== effect)
        : [...prev, effect]
    )
  }

  // Real-time validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!startDate) {
      errors.startDate = 'Start date is required'
    } else {
      const selectedDate = new Date(startDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      selectedDate.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        errors.startDate = 'Start date cannot be in the past'
      }

      const sixMonthsFromNow = new Date()
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
      if (selectedDate > sixMonthsFromNow) {
        errors.startDate = 'Start date is more than 6 months away - please verify'
      }
    }

    if (numSessions < 1) {
      errors.numSessions = 'At least 1 session is required'
    } else if (numSessions > 50) {
      errors.numSessions = 'Maximum 50 sessions allowed'
    }

    if (!startTime) {
      errors.startTime = 'Start time is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validate form
    if (!validateForm()) {
      setIsSubmitting(false)
      setError('Please correct the validation errors below')
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
        // Redirect to admin dashboard with success message
        router.push('/admin/dashboard?success=Treatment plan published successfully. Patient has been notified.')
      } else {
        setError(result.error || 'Failed to publish treatment plan')
        setIsSubmitting(false)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
      console.error('Plan submission error:', err)
    }
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]

  // Calculate estimated end date
  const calculateEndDate = () => {
    if (!startDate || numSessions < 1) return null
    
    const start = new Date(startDate)
    // Assume treatments Mon-Fri (5 days per week)
    const weeks = Math.ceil(numSessions / 5)
    const days = weeks * 7 - 2 // Subtract weekend days
    const end = new Date(start)
    end.setDate(start.getDate() + days)
    
    return end.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
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
              <p className="text-sm text-blue-700 leading-relaxed">
                This treatment plan will be immediately visible to the patient once published. 
                Please verify all details carefully before submission. The patient will receive 
                automatic notification with their schedule.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
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

        {/* Planning Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Treatment Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Treatment Details</h2>
                <p className="text-sm text-gray-600">Type and duration of therapy</p>
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
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
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
                    <div>
                      <span className="text-sm font-semibold text-gray-700 block">External Beam</span>
                      <span className="text-xs text-gray-500">LINAC therapy</span>
                    </div>
                  </label>
                  <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    treatmentType === 'Brachytherapy'
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
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
                    <div>
                      <span className="text-sm font-semibold text-gray-700 block">Brachytherapy</span>
                      <span className="text-xs text-gray-500">Internal radiation</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Number of Sessions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Sessions <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={numSessions}
                    onChange={(e) => setNumSessions(parseInt(e.target.value) || 1)}
                    disabled={isSubmitting}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100 ${
                      validationErrors.numSessions ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                </div>
                {validationErrors.numSessions ? (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.numSessions}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Typical range: 1-40 sessions (50 max)</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Schedule */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Treatment Schedule</h2>
                <p className="text-sm text-gray-600">Timing and location details</p>
              </div>
            </div>

            <div className="space-y-5">
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100 ${
                      validationErrors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.startDate && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.startDate}</p>
                  )}
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100 ${
                      validationErrors.startTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.startTime && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.startTime}</p>
                  )}
                </div>
              </div>

              {/* Estimated End Date Display */}
              {startDate && numSessions > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-purple-900">Estimated End Date</p>
                      <p className="text-sm font-bold text-purple-700">{calculateEndDate()}</p>
                      <p className="text-xs text-purple-600 mt-0.5">Based on {numSessions} sessions (Mon-Fri schedule)</p>
                    </div>
                  </div>
                </div>
              )}

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

          {/* Section 3: Patient Care */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-xs text-gray-500 mt-1">This will be communicated to the patient</p>
              </div>

              {/* Potential Side Effects */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Potential Side Effects (Select all that apply)
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { value: 'Fatigue', desc: 'Tiredness, low energy' },
                    { value: 'Skin Redness', desc: 'Irritation at treatment site' },
                    { value: 'Nausea', desc: 'Stomach upset' },
                    { value: 'Urinary Irritation', desc: 'Frequent urination' },
                    { value: 'Bowel Changes', desc: 'Diarrhea or constipation' },
                    { value: 'Hair Loss', desc: 'In treatment area' },
                    { value: 'Loss of Appetite', desc: 'Reduced hunger' },
                    { value: 'Dry Mouth', desc: 'Reduced saliva production' },
                  ].map((effect) => (
                    <label
                      key={effect.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        sideEffects.includes(effect.value)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={sideEffects.includes(effect.value)}
                        onChange={() => handleSideEffectToggle(effect.value)}
                        disabled={isSubmitting}
                        className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mt-0.5"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 block">{effect.value}</span>
                        <span className="text-xs text-gray-500">{effect.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected effects will be communicated to the patient with management tips
                </p>
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-xl p-6 text-white">
            <div className="flex items-start gap-4 mb-5">
              <svg className="w-6 h-6 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold mb-1">Ready to Publish Treatment Plan?</p>
                <p className="text-sm text-purple-100 leading-relaxed">
                  The patient will receive immediate notification with their treatment schedule, preparation 
                  instructions, and expected side effects. This action cannot be undone. Please ensure all 
                  details are accurate before publishing.
                </p>
              </div>
            </div>

            {/* Summary Preview */}
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-5">
              <p className="text-xs font-semibold text-purple-200 uppercase tracking-wide mb-2">Plan Summary</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-purple-200 text-xs">Treatment Type</p>
                  <p className="font-semibold">{treatmentType}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-xs">Sessions</p>
                  <p className="font-semibold">{numSessions}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-xs">Start Date</p>
                  <p className="font-semibold">{startDate ? new Date(startDate).toLocaleDateString('en-GB') : 'Not set'}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-xs">Side Effects Selected</p>
                  <p className="font-semibold">{sideEffects.length || 'None'}</p>
                </div>
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