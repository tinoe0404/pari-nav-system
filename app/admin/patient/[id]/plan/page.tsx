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
  const [warning, setWarning] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Form state
  const [treatmentType, setTreatmentType] = useState<'External Beam' | 'Brachytherapy'>('External Beam')
  const [numSessions, setNumSessions] = useState<number>(15)
  const [startDate, setStartDate] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('09:00')
  const [treatmentRoom, setTreatmentRoom] = useState<string>('Room 1 (Linear Accelerator)')
  const [prepInstructions, setPrepInstructions] = useState<string>('Full Bladder')

  // Nutritional Interventions state
  const [nutritionalInterventions, setNutritionalInterventions] = useState<{
    "Difficulty Swallowing"?: string
    "Nausea"?: string
    "Diarrhea"?: string
    "Dry Mouth"?: string
    "Dehydration"?: string
  }>({})

  // Skin Care Management state
  const [skinCareDos, setSkinCareDos] = useState<string[]>([])
  const [skinCareDonts, setSkinCareDonts] = useState<string[]>([])

  // Immobilization Device state
  const [immobilizationDevice, setImmobilizationDevice] = useState<string>('')
  const [setupConsiderations, setSetupConsiderations] = useState<string>('')

  // Unwrap params on mount
  useEffect(() => {
    params.then(p => setPatientId(p.id))
  }, [params])

  const handleNutritionalInterventionChange = (key: keyof typeof nutritionalInterventions, value: string) => {
    setNutritionalInterventions(prev => ({
      ...prev,
      [key]: value.trim() || undefined
    }))
  }

  const handleSkinCareDoToggle = (item: string) => {
    setSkinCareDos(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  const handleSkinCareDontToggle = (item: string) => {
    setSkinCareDonts(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
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
    setWarning(null)

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

    // Build prescription components
    const prescriptionComponents = {
      fractionationSchedule: `${numSessions} fractions`,
      technique: treatmentType,
      // Add more auto-populated fields as needed
    }

    const input: TreatmentPlanInput = {
      patientId,
      treatmentType,
      numSessions,
      startDate: startDateTime,
      prepInstructions: prepText,
      nutritionalInterventions: Object.keys(nutritionalInterventions).length > 0 ? nutritionalInterventions : undefined,
      skinCareDos: skinCareDos.length > 0 ? skinCareDos : undefined,
      skinCareDonts: skinCareDonts.length > 0 ? skinCareDonts : undefined,
      immobilizationDevice: immobilizationDevice.trim() || undefined,
      setupConsiderations: setupConsiderations.trim() || undefined,
      prescriptionComponents,
    }

    try {
      const result = await publishTreatmentPlan(input)

      if (result.success) {
        // Check if email notification succeeded
        const emailStatus = result.data?.emailNotification

        if (emailStatus?.emailSent) {
          // Full success - plan published AND email sent
          router.push('/admin/dashboard?success=Treatment plan published successfully. Patient has been notified via email.')
        } else {
          // Partial success - plan published but email failed
          const warningMsg = result.warning || 'Treatment plan published, but email notification failed. Please inform patient manually.'
          router.push(`/admin/dashboard?warning=${encodeURIComponent(warningMsg)}`)
        }
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href={`/admin/patient/${patientId}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Treatment Planning</h1>
              <p className="text-xs sm:text-sm text-gray-600">Create and publish treatment schedule</p>
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
                The patient will receive an <strong>automatic email notification</strong> with their schedule.
                Please verify all details carefully before submission.
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

        {/* Warning Message */}
        {warning && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-semibold text-amber-900">{warning}</p>
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
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${treatmentType === 'External Beam'
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
                  <label className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${treatmentType === 'Brachytherapy'
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100 text-base ${validationErrors.numSessions ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    style={{ minHeight: '44px' }}
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
              <div className="grid sm:grid-cols-2 gap-4">
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100 ${validationErrors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100 ${validationErrors.startTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
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

          {/* Section 3: Patient Preparation & Care */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Patient Preparation & Care</h2>
                <p className="text-sm text-gray-600">Instructions and nutritional guidance</p>
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

              {/* Nutritional Interventions Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nutritional Interventions and Lifestyle Strategy
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  Provide dietary and lifestyle recommendations for managing treatment side effects
                </p>
                <div className="space-y-4">
                  {[
                    { key: "Difficulty Swallowing" as const, placeholder: "e.g., Eat soft, moist foods with extra gravies; avoid spicy or acidic foods" },
                    { key: "Nausea" as const, placeholder: "e.g., Eat small, frequent meals of bland foods (crackers, toast); drink clear liquids" },
                    { key: "Diarrhea" as const, placeholder: "e.g., Increase clear fluids (Gatorade, broth); avoid high-fiber foods and milk products" },
                    { key: "Dry Mouth" as const, placeholder: "e.g., Sip water frequently; use ice chips or saliva substitutes; avoid smoking and alcohol" },
                    { key: "Dehydration" as const, placeholder: "e.g., Aim for eight to ten 8-ounce glasses of fluid daily" },
                  ].map((item) => (
                    <div key={item.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {item.key}
                      </label>
                      <textarea
                        value={nutritionalInterventions[item.key] || ''}
                        onChange={(e) => handleNutritionalInterventionChange(item.key, e.target.value)}
                        placeholder={item.placeholder}
                        disabled={isSubmitting}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100 text-sm resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Skin Care Management */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Skin Care Management</h2>
                <p className="text-sm text-gray-600">Managing radiation dermatitis</p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
              <p className="text-sm text-blue-900">
                Radiotherapy can cause the skin to become red, dry, itchy, and sensitive—a condition known as radiation dermatitis.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* The Dos */}
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-3">
                  ✓ The Dos
                </label>
                <div className="space-y-2">
                  {[
                    "Wash treated area daily with warm water and gentle, low-pH, fragrance-free cleanser",
                    "Use hands to gently splash water; avoid washcloths, loofahs, or sponges",
                    "Pat skin dry with soft, clean towel",
                    "Apply clinician-recommended moisturizer (e.g., Aquaphor or 100% pure Aloe Vera) daily",
                    "Wear loose-fitting clothing made of natural fibers like cotton",
                    "Protect treatment area from sun with sun-protective clothing or wide-brimmed hat",
                  ].map((item) => (
                    <label
                      key={item}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${skinCareDos.includes(item)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={skinCareDos.includes(item)}
                        onChange={() => handleSkinCareDoToggle(item)}
                        disabled={isSubmitting}
                        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700 leading-tight">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* The Don'ts */}
              <div>
                <label className="block text-sm font-semibold text-red-700 mb-3">
                  ✗ The Don'ts
                </label>
                <div className="space-y-2">
                  {[
                    "Do not scrub or rub the treatment area vigorously",
                    "Do not wash off ink marks or tattoos used for treatment alignment",
                    "Do not apply heating pads, hot water bottles, ice packs, or take hot tubs/saunas",
                    "Do not use deodorants, antiperspirants, perfumes, or makeup in treatment field unless approved",
                    "Do not use adhesive tape, bandages, or medicated patches on treated skin",
                    "Do not shave treatment area; if necessary, use only electric razor",
                  ].map((item) => (
                    <label
                      key={item}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${skinCareDonts.includes(item)
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={skinCareDonts.includes(item)}
                        onChange={() => handleSkinCareDontToggle(item)}
                        disabled={isSubmitting}
                        className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700 leading-tight">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Immobilization Device & Setup */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Immobilization Device & Setup</h2>
                <p className="text-sm text-gray-600">Patient positioning specifications</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Primary Immobilization Device */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Immobilization Device
                </label>
                <select
                  value={immobilizationDevice}
                  onChange={(e) => setImmobilizationDevice(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100"
                >
                  <option value="">Select device (optional)</option>
                  <option value="Thermoplastic mask (3-point or 5-point)">Thermoplastic mask (3-point or 5-point)</option>
                  <option value="Breast board, wing board, or vacuum bag">Breast board, wing board, or vacuum bag</option>
                  <option value="Vacuum bag (Vac-Lok), knee and ankle sponges">Vacuum bag (Vac-Lok), knee and ankle sponges</option>
                  <option value="Customized foam or vacuum cushions">Customized foam or vacuum cushions</option>
                  <option value="High-precision vacuum bags or SBRT frames">High-precision vacuum bags or SBRT frames</option>
                </select>
              </div>

              {/* Setup Considerations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Setup Considerations
                </label>
                <textarea
                  value={setupConsiderations}
                  onChange={(e) => setSetupConsiderations(e.target.value)}
                  placeholder="e.g., Shoulder retractors mandatory for 3-point masks; dentures and piercings removed&#10;e.g., Bladder and bowel preparation protocols to manage internal organ motion&#10;e.g., Ensuring comfort to minimize intrafraction movement"
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100 text-sm resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Describe any special positioning requirements or patient preparation needs</p>
              </div>
            </div>
          </div>

          {/* Section 6: Prescription Components Summary */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-md p-6 border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Essential Prescription Components</h2>
                <p className="text-sm text-gray-600">Clinical specification summary</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded p-3">
                  <p className="text-xs text-slate-600 mb-1">Treatment Intent</p>
                  <p className="text-sm font-semibold text-slate-900">Definitive/Curative</p>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <p className="text-xs text-slate-600 mb-1">Energy and Modality</p>
                  <p className="text-sm font-semibold text-slate-900">{treatmentType}</p>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <p className="text-xs text-slate-600 mb-1">Fractionation Schedule</p>
                  <p className="text-sm font-semibold text-slate-900">{numSessions} fractions</p>
                </div>
                <div className="bg-slate-50 rounded p-3">
                  <p className="text-xs text-slate-600 mb-1">Technique</p>
                  <p className="text-sm font-semibold text-slate-900">{treatmentType === 'External Beam' ? '3DCRT, IMRT, VMAT, or SBRT' : 'Brachytherapy'}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                <strong>Note:</strong> Full prescription components including patient demographics, primary diagnosis, anatomical target, absorbed dose, volume definitions, and image guidance will be documented in the treatment record.
              </p>
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
                  instructions, nutritional guidance, and skin care instructions. This action cannot be undone. Please ensure all
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
                  <p className="text-purple-200 text-xs">Nutritional Interventions</p>
                  <p className="font-semibold">{Object.keys(nutritionalInterventions).filter(k => nutritionalInterventions[k as keyof typeof nutritionalInterventions]).length || 'None'}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-purple-700 py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-purple-50 transition-colors shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              style={{ minHeight: '48px' }}
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