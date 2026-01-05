// components/Phase1HeroCard.tsx
// PHASE 1: THE CONSULTANT (Status = 'REGISTERED')
'use client'

interface Phase1HeroCardProps {
  consultantRoom?: string
}

export default function Phase1HeroCard({ consultantRoom = 'Room 104' }: Phase1HeroCardProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 border-4 border-green-400 rounded-3xl shadow-2xl p-8 mb-8">
      <div className="flex items-start gap-6">
        {/* Large Icon */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Step Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full mb-4">
            <span className="text-lg font-bold">Step 1</span>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold">Active</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl font-bold text-green-900 mb-4">
            Consultation
          </h2>

          {/* Instruction */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
            <p className="text-2xl font-semibold text-gray-900 mb-2">
              Please proceed to the Consultant's Room
            </p>
            <p className="text-xl text-gray-700">
              to get your Scan Referral Letter.
            </p>
          </div>

          {/* Room Location Card */}
          <div className="bg-green-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
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
                <p className="text-sm text-green-100 font-medium mb-1">Location</p>
                <p className="text-3xl font-bold">{consultantRoom}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

