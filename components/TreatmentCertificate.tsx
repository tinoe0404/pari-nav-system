// components/TreatmentCertificate.tsx
'use client'

import { useRef } from 'react'

interface TreatmentCertificateProps {
    patientName: string
    treatmentType?: string
    completionDate?: string
}

export default function TreatmentCertificate({ patientName, treatmentType = 'Oncology Treatment', completionDate = new Date().toLocaleDateString() }: TreatmentCertificateProps) {

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="mb-8 print:m-0 print:w-full">
            <div className="bg-white border-8 border-double border-purple-200 p-8 sm:p-12 shadow-2xl rounded-xl relative overflow-hidden text-center max-w-4xl mx-auto">
                {/* Background Seal */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                    <svg className="w-[500px] h-[500px]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 tracking-wide uppercase mb-2">
                        Certificate of Completion
                    </h1>

                    <p className="text-gray-500 font-serif italic text-lg sm:text-xl">
                        This document certifies that
                    </p>

                    <h2 className="text-3xl sm:text-4xl font-bold text-purple-800 border-b-2 border-purple-200 inline-block pb-2 px-8 font-serif">
                        {patientName}
                    </h2>

                    <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                        Has successfully completed the prescribed course of <br />
                        <strong className="text-gray-900">{treatmentType}</strong>
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-12 mt-12 pt-8">
                        <div className="text-center">
                            <p className="font-bold text-lg text-gray-900 border-t border-gray-400 pt-2 min-w-[200px]">
                                {completionDate}
                            </p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Date</p>
                        </div>

                        <div className="text-center">
                            <div className="h-8 mb-2 flex items-center justify-center">
                                <span className="font-script text-2xl text-purple-700 font-bold italic">Parirenyatwa Admin</span>
                            </div>
                            <p className="font-bold text-lg text-gray-900 border-t border-gray-400 pt-2 min-w-[200px]">
                                Parirenyatwa Hospital
                            </p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Authorized Signature</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center print:hidden">
                <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full font-bold shadow-lg hover:bg-purple-700 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Certificate
                </button>
            </div>
        </div>
    )
}
