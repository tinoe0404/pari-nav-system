// components/Phase2HeroCard.tsx
// PHASE 2: THE WAITING ROOM (Status = 'SCANNED')
'use client'

export default function Phase2HeroCard() {
  return (
    <div className="mb-8">
      {/* Step Badge */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-full shadow-sm">
          <span className="text-sm font-bold">Step 2</span>
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wide">In Progress</span>
        </div>
        <span className="text-sm font-medium text-gray-500">Planning Stage</span>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 lg:p-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Planning in Progress
              </h2>
              <div className="flex items-center gap-2 text-blue-100 text-base sm:text-lg">
                <span className="animate-pulse">●</span>
                <p>Medical team is calculating your treatment plan.</p>
              </div>
            </div>
            <div className="hidden sm:flex bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-inner">
              <div className="animate-spin duration-[3000ms]">
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="bg-blue-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0 text-blue-500">
                <span className="text-2xl font-bold">5-7</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-1">Estimated Wait Time</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Your personalized plan takes approximately <strong>5-7 days</strong> to generate. We will notify you via SMS when it is ready.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">Current Status</h4>
            <div className="space-y-4">
              {/* Progress Item 1 */}
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700 font-medium line-through decoration-gray-400">Scan Completed</p>
              </div>

              {/* Progress Item 2 */}
              <div className="flex items-center gap-4">
                <div className="relative w-6 h-6 flex-shrink-0">
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <p className="text-blue-900 font-bold">Dose Calculation By The Medical Team</p>
              </div>

              {/* Progress Item 3 */}
              <div className="flex items-center gap-4 opacity-50">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                <p className="text-gray-500">Plan Verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

