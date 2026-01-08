'use client'

interface ScanHeroCardProps {
    scanRoom?: string
}

export default function ScanHeroCard({ scanRoom = 'Room S234' }: ScanHeroCardProps) {
    return (
        <div className="mb-8">
            {/* Step Badge */}
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-full shadow-sm">
                    <span className="text-sm font-bold">Step 2</span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    <span className="text-xs font-semibold uppercase tracking-wide">Action Required</span>
                </div>
                <span className="text-sm font-medium text-gray-500">Scan Stage</span>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 sm:p-8 text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                                CT Scan Required
                            </h2>
                            <p className="text-purple-100 text-base sm:text-lg leading-relaxed max-w-lg">
                                Your consultation is complete. The next step is to undergo a CT scan for treatment planning.
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
                <div className="p-6 sm:p-8">
                    <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 flex items-center gap-4 sm:gap-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                            <svg
                                className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600"
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
                            <p className="text-xs sm:text-sm font-bold text-purple-800 uppercase tracking-wider mb-1">
                                Scan Location
                            </p>
                            <p className="text-2xl sm:text-3xl font-bold text-purple-900">
                                {scanRoom}
                            </p>
                            <p className="text-sm text-purple-600 mt-1">Radiology Department</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800">
                            <svg className="w-6 h-6 flex-shrink-0 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium">
                                Please proceed to the scan room. Our staff will check you in and perform the scan.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
