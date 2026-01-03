// app/patient/intake/page.tsx
'use client'

import { useState } from 'react'
import { submitIntakeForm } from '@/app/actions/intake'
import { useSearchParams } from 'next/navigation'

export default function IntakePage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const [showAllergyDetails, setShowAllergyDetails] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    await submitIntakeForm(formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
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
              <h1 className="text-2xl font-bold text-gray-900">Medical Intake Form</h1>
              <p className="text-sm text-gray-600">Help us prepare for your treatment</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-blue-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
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
              <h2 className="text-xl font-bold mb-2">Welcome to Parirenyatwa Radiotherapy</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Before we begin your treatment journey, we need to collect some important medical information. 
                This helps our team provide you with the safest and most effective care possible. 
                All information is confidential and will only be used for your treatment.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
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
              <p className="text-sm text-red-800">{decodeURIComponent(error)}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form action={handleSubmit} className="space-y-8">
          {/* Section 1: Medical History */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
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
                <h3 className="text-xl font-bold text-gray-900">Medical History</h3>
                <p className="text-sm text-gray-600">Select all that apply to you</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'pacemaker', label: 'Pacemaker or Implantable Cardioverter Defibrillator (ICD)' },
                { id: 'previousRadiation', label: 'Previous Radiation Therapy' },
                { id: 'claustrophobia', label: 'Claustrophobia (fear of enclosed spaces)' },
                { id: 'metalImplants', label: 'Metal Implants (surgical pins, plates, screws)' },
                { id: 'diabetes', label: 'Diabetes' },
                { id: 'heartDisease', label: 'Heart Disease' },
                { id: 'kidneyDisease', label: 'Kidney Disease' },
                { id: 'pregnant', label: 'Pregnant or Possibly Pregnant' },
                { id: 'allergies', label: 'Allergies (medications, contrast dye, latex)' },
              ].map((condition) => (
                <label
                  key={condition.id}
                  className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="conditions"
                    value={condition.id}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      if (condition.id === 'allergies') {
                        setShowAllergyDetails(e.target.checked)
                      }
                    }}
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    {condition.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Allergy Details (conditional) */}
            {showAllergyDetails && (
              <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify your allergies <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="allergyDetails"
                  rows={3}
                  disabled={isSubmitting}
                  required={showAllergyDetails}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none disabled:bg-gray-100"
                  placeholder="e.g., Penicillin, Iodine contrast dye..."
                />
              </div>
            )}
          </div>

          {/* Section 2: Current Symptoms */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
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
              <div>
                <h3 className="text-xl font-bold text-gray-900">Current Symptoms</h3>
                <p className="text-sm text-gray-600">Describe what you're experiencing</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please describe your symptoms in detail <span className="text-red-500">*</span>
              </label>
              <textarea
                name="currentSymptoms"
                rows={5}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none disabled:bg-gray-100"
                placeholder="e.g., Pain in left hip when walking, difficulty breathing, persistent cough..."
              />
              <p className="mt-2 text-xs text-gray-500">
                Include location, duration, and severity of symptoms
              </p>
            </div>
          </div>

          {/* Section 3: Mobility Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Mobility Status</h3>
                <p className="text-sm text-gray-600">How do you get around?</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select your mobility status <span className="text-red-500">*</span>
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { value: 'walking', label: 'Walking Independently', icon: '🚶' },
                  { value: 'assistance_needed', label: 'Walking with Assistance', icon: '🦯' },
                  { value: 'wheelchair', label: 'Wheelchair', icon: '♿' },
                  { value: 'stretcher', label: 'Stretcher/Bed', icon: '🛏️' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="relative flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="mobilityStatus"
                      value={option.value}
                      required
                      disabled={isSubmitting}
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-sm text-gray-700 font-medium">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Next of Kin */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Emergency Contact</h3>
                <p className="text-sm text-gray-600">Next of kin information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nextOfKinName"
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100"
                  placeholder="e.g., John Moyo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nextOfKinRelationship"
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100"
                  placeholder="e.g., Spouse, Sibling, Parent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="nextOfKinPhone"
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100"
                  placeholder="e.g., +263 77 123 4567"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Additional Notes */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Additional Information</h3>
                <p className="text-sm text-gray-600">Anything else we should know?</p>
              </div>
            </div>

            <textarea
              name="additionalNotes"
              rows={4}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none disabled:bg-gray-100"
              placeholder="Any other medical conditions, concerns, or special requirements..."
            />
          </div>

          {/* Section 6: Consent */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                name="consentGiven"
                value="true"
                required
                disabled={isSubmitting}
                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <div>
                <h4 className="text-lg font-bold text-blue-900 mb-2">
                  Consent & Acknowledgment
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  I confirm that the information provided above is accurate and complete to the best of my knowledge. 
                  I understand that this information will be used to plan my treatment and ensure my safety. 
                  I consent to receive radiotherapy treatment at Parirenyatwa Hospital.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6"
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
                Complete Intake & Continue
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}