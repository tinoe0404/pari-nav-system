// components/TreatmentTicket.tsx
// PHASE 3: THE TICKET (Status = 'PLAN_READY' or 'TREATING')
// Boarding Pass Style Treatment Ticket
'use client'

import type { TreatmentPlan } from '@/types/patient'

interface TreatmentTicketProps {
  plan: TreatmentPlan
  patientName: string
}

export default function TreatmentTicket({ plan, patientName }: TreatmentTicketProps) {
  // Parse start_date - could be date or datetime string
  const startDate = new Date(plan.start_date)
  const hasTime = plan.start_date.includes('T') || plan.start_date.includes(' ')

  // Format date
  const formattedDate = startDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Format time (if available)
  const formattedTime = hasTime
    ? startDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    : '09:00 AM' // Default time if not specified

  // Extract room number from prep_instructions or use default
  // Note: Room should ideally be a separate field, but using default for now
  const treatmentRoom = 'Room 1' // TODO: Add room field to TreatmentPlan type

  return (
    <div className="mb-8">
      {/* Step 3 Header - Mobile Optimized */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-4 border-purple-400 rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 lg:gap-6">
          {/* Large Icon */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-8 h-8 sm:w-12 sm:h-12 text-white"
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
          </div>

          {/* Content */}
          <div className="flex-1 w-full">
            {/* Step Badge */}
            <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-500 text-white rounded-full mb-4 max-w-full">
              <span className="text-base sm:text-lg font-bold whitespace-nowrap">Step 3</span>
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full flex-shrink-0"></span>
              <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">Treatment Ready</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-4xl font-bold text-purple-900 mb-2">
              Treatment Ready
            </h2>
            <p className="text-base sm:text-xl text-purple-700">
              Your treatment plan is ready. Please review your boarding pass below.
            </p>
          </div>
        </div>
      </div>

      {/* BOARDING PASS STYLE TICKET */}
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-purple-300 overflow-hidden">
        {/* Ticket Header - Mobile Optimized */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-purple-200 uppercase tracking-wide mb-1">
                Parirenyatwa Hospital
              </p>
              <p className="text-xl sm:text-2xl font-bold leading-tight">Treatment Boarding Pass</p>
            </div>
            <div className="flex items-center justify-between sm:block sm:text-right border-t border-purple-500/30 sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0 w-full sm:w-auto">
              <p className="text-xs sm:text-sm text-purple-200 sm:mb-1">Patient</p>
              <p className="text-base sm:text-lg font-bold">{patientName.split(' ')[0]}</p>
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column - Date & Time */}
            <div className="space-y-4 sm:space-y-6">
              {/* Start Date */}
              <div className="bg-purple-50 rounded-2xl p-4 sm:p-6 border-2 border-purple-200">
                <p className="text-xs sm:text-sm font-semibold text-purple-700 uppercase tracking-wide mb-2 sm:mb-3">
                  Start Date
                </p>
                <p className="text-2xl sm:text-4xl font-bold text-purple-900 leading-tight break-words">
                  {formattedDate}
                </p>
              </div>

              {/* Start Time */}
              <div className="bg-indigo-50 rounded-2xl p-4 sm:p-6 border-2 border-indigo-200">
                <p className="text-xs sm:text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-2 sm:mb-3">
                  Start Time
                </p>
                <p className="text-2xl sm:text-4xl font-bold text-indigo-900 leading-tight">
                  {formattedTime}
                </p>
              </div>
            </div>

            {/* Right Column - Location & Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Location */}
              <div className="bg-emerald-50 rounded-2xl p-4 sm:p-6 border-2 border-emerald-200">
                <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                    Location
                  </p>
                </div>
                <p className="text-2xl sm:text-4xl font-bold text-emerald-900 leading-tight">
                  {treatmentRoom}
                </p>
              </div>

              {/* Treatment Details */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border-2 border-slate-200">
                <p className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 sm:mb-4">
                  Treatment Details
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-sm sm:text-base text-slate-600 font-medium">Treatment Type</span>
                    <span className="font-bold text-slate-900 text-base sm:text-lg text-right">{plan.treatment_type}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-sm sm:text-base text-slate-600 font-medium">Total Sessions</span>
                    <span className="font-bold text-slate-900 text-base sm:text-lg">{plan.num_sessions} sessions</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm sm:text-base text-slate-600 font-medium">Plan Status</span>
                    <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold bg-emerald-100 text-emerald-800">
                      ✓ Published
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nutritional Interventions Section */}
          {plan.nutritional_interventions && Object.keys(plan.nutritional_interventions).length > 0 && (
            <div className="mt-6 sm:mt-8 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2 sm:mb-3">
                    Nutritional Guidance
                  </p>
                  <p className="text-sm text-amber-700 mb-4">
                    Follow these dietary recommendations to help manage potential side effects during treatment.
                  </p>
                  <div className="bg-white rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-amber-100">
                        <tr>
                          <th className="text-left px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-amber-900">Side Effect</th>
                          <th className="text-left px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-amber-900">Strategy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100">
                        {Object.entries(plan.nutritional_interventions).map(([key, value]) => (
                          value && (
                            <tr key={key} className="hover:bg-amber-50">
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium text-amber-900">{key}</td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-amber-800">{value}</td>
                            </tr>
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skin Care Management Section */}
          {((plan.skin_care_dos && plan.skin_care_dos.length > 0) || (plan.skin_care_donts && plan.skin_care_donts.length > 0)) && (
            <div className="mt-6 sm:mt-8 bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 sm:p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-rose-800 uppercase tracking-wide mb-2">
                    Skin Care Instructions
                  </p>
                  <p className="text-sm text-rose-700 mb-4">
                    Follow these guidelines to protect your skin during radiation therapy.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* The Dos */}
                {plan.skin_care_dos && plan.skin_care_dos.length > 0 && (
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      The Do's
                    </h4>
                    <ul className="space-y-2">
                      {plan.skin_care_dos.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* The Don'ts */}
                {plan.skin_care_donts && plan.skin_care_donts.length > 0 && (
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      The Don'ts
                    </h4>
                    <ul className="space-y-2">
                      {plan.skin_care_donts.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Immobilization Device Section */}
          {plan.immobilization_device && (
            <div className="mt-6 sm:mt-8 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-indigo-800 uppercase tracking-wide mb-2">
                    Positioning Setup
                  </p>
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs text-indigo-600 mb-1">Device</p>
                      <p className="text-sm sm:text-base font-semibold text-indigo-900">{plan.immobilization_device}</p>
                    </div>
                    {plan.setup_considerations && (
                      <div className="pt-3 border-t border-indigo-200">
                        <p className="text-xs text-indigo-600 mb-1">Important Notes</p>
                        <p className="text-xs sm:text-sm text-indigo-800 whitespace-pre-wrap">{plan.setup_considerations}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prep Warning */}
          {plan.prep_instructions && (
            <div className="mt-6 sm:mt-8 bg-amber-50 border-4 border-amber-400 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl sm:text-4xl">⚠️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">
                    Important Preparation Required
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-amber-900">
                    {plan.prep_instructions}
                  </p>
                  <p className="text-sm sm:text-base text-amber-800 mt-2 sm:mt-3">
                    Please follow these instructions carefully before your treatment session.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ticket Footer */}
        <div className="bg-gray-100 border-t-2 border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600 text-center sm:text-left">
            <p className="font-semibold">Please arrive 15 minutes early</p>
            <p>Bring your ID and this boarding pass</p>
          </div>
        </div>
      </div>
    </div>
  )
}

