// components/Phase2HeroCard.tsx
// PHASE 2: THE WAITING ROOM (Status = 'SCANNED')
'use client'

export default function Phase2HeroCard() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-300 rounded-3xl shadow-2xl p-8 mb-8">
      <div className="flex items-start gap-6">
        {/* Large Icon with Pulse Animation */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Step Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full mb-4">
            <span className="text-lg font-bold">Step 2</span>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold">In Progress</span>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl font-bold text-blue-900 mb-4">
            Planning in Progress
          </h2>

          {/* Reassurance Message */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-7 h-7 text-blue-600"
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
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 mb-2">
                  Scan confirmed.
                </p>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Our physics team is calculating your treatment plan. This takes approximately{' '}
                  <span className="font-bold text-blue-700">5-7 days</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Processing Animation */}
          <div className="bg-blue-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold mb-1">Processing Your Plan</p>
                <p className="text-blue-100 text-sm">
                  Our team is working carefully to create your personalized treatment plan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

