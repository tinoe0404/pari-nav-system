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
      {/* Step 3 Header */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-4 border-purple-400 rounded-3xl shadow-2xl p-8 mb-6">
        <div className="flex items-start gap-6">
          {/* Large Icon */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-white"
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
          <div className="flex-1">
            {/* Step Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-full mb-4">
              <span className="text-lg font-bold">Step 3</span>
              <span className="w-2 h-2 bg-white rounded-full"></span>
              <span className="text-sm font-semibold">Treatment Ready</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-4xl font-bold text-purple-900 mb-2">
              Treatment Ready
            </h2>
            <p className="text-xl text-purple-700">
              Your treatment plan is ready. Please review your boarding pass below.
            </p>
          </div>
        </div>
      </div>

      {/* BOARDING PASS STYLE TICKET */}
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-purple-300 overflow-hidden">
        {/* Ticket Header - Airline-style */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-200 uppercase tracking-wide mb-1">
                Parirenyatwa Hospital
              </p>
              <p className="text-2xl font-bold">Treatment Boarding Pass</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-200 mb-1">Patient</p>
              <p className="text-lg font-bold">{patientName.split(' ')[0]}</p>
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Date & Time */}
            <div className="space-y-6">
              {/* Start Date - HUGE */}
              <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-3">
                  Start Date
                </p>
                <p className="text-4xl font-bold text-purple-900 leading-tight">
                  {formattedDate}
                </p>
              </div>

              {/* Start Time - HUGE */}
              <div className="bg-indigo-50 rounded-2xl p-6 border-2 border-indigo-200">
                <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-3">
                  Start Time
                </p>
                <p className="text-4xl font-bold text-indigo-900 leading-tight">
                  {formattedTime}
                </p>
              </div>
            </div>

            {/* Right Column - Location & Details */}
            <div className="space-y-6">
              {/* Location (Room Number) - HUGE */}
              <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-200">
                <div className="flex items-center gap-4 mb-3">
                  <svg
                    className="w-8 h-8 text-emerald-600"
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
                  <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                    Location
                  </p>
                </div>
                <p className="text-4xl font-bold text-emerald-900 leading-tight">
                  {treatmentRoom}
                </p>
              </div>

              {/* Treatment Details - Enhanced */}
              <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200">
                <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
                  Treatment Details
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">Treatment Type</span>
                    <span className="font-bold text-slate-900 text-lg">{plan.treatment_type}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">Total Sessions</span>
                    <span className="font-bold text-slate-900 text-lg">{plan.num_sessions} sessions</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 font-medium">Plan Status</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                      ✓ Published
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Effects Section - NEW */}
          {plan.side_effects && plan.side_effects.length > 0 && (
            <div className="mt-8 bg-rose-50 border-2 border-rose-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-rose-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-rose-800 uppercase tracking-wide mb-3">
                    Possible Side Effects
                  </p>
                  <p className="text-sm text-rose-700 mb-4">
                    You may experience some of the following during or after treatment. Please report any concerns to your care team.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {plan.side_effects.map((effect, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-rose-200"
                      >
                        <span className="w-2 h-2 bg-rose-400 rounded-full flex-shrink-0"></span>
                        <span className="text-rose-900 font-medium">{effect}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prep Warning - PROMINENT */}
          {plan.prep_instructions && (
            <div className="mt-8 bg-amber-50 border-4 border-amber-400 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-4xl">⚠️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">
                    Important Preparation Required
                  </p>
                  <p className="text-2xl font-bold text-amber-900">
                    {plan.prep_instructions}
                  </p>
                  <p className="text-base text-amber-800 mt-3">
                    Please follow these instructions carefully before your treatment session.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ticket Footer */}
        <div className="bg-gray-100 border-t-2 border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p className="font-semibold">Please arrive 15 minutes early</p>
            <p>Bring your ID and this boarding pass</p>
          </div>
        </div>
      </div>
    </div>
  )
}

