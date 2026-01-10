// components/Phase1HeroCard.tsx
// PHASE 1: THE CONSULTANT (Status = 'REGISTERED')
'use client'

interface Phase1HeroCardProps {
  consultantRoom?: string
}

export default function Phase1HeroCard({ consultantRoom = 'Room 104' }: Phase1HeroCardProps) {
  return (
    <div className="mb-8">
      {/* Step Badge - Now outside the card for cleaner look */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500 text-white rounded-full shadow-sm">
          <span className="text-sm font-bold">Step 1</span>
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wide">Active</span>
        </div>
        <span className="text-sm font-medium text-gray-500">Consultation Stage</span>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-teal-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 sm:p-6 lg:p-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Consultation
              </h2>
              <p className="text-teal-50 text-base sm:text-lg leading-relaxed max-w-lg">
                Please proceed to the Consultant's Room to get your Scan Referral Letter.
              </p>
            </div>
            <div className="hidden sm:flex bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-inner">
              <svg
                className="w-8 h-8 text-white"
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
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-teal-50 rounded-2xl p-4 sm:p-5 border border-teal-100 flex items-center gap-4 sm:gap-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600"
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
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-teal-800 uppercase tracking-wider mb-1">
                Your Destination
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-teal-900">
                {consultantRoom}
              </p>
              <p className="text-sm text-teal-600 mt-1">Ground Floor, Main Wing</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

