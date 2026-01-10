// app/onboarding/IntakeSummaryView.tsx
'use client'

import Link from 'next/link'
import type { PatientData } from '@/types/patient'

interface IntakeSummaryViewProps {
    patient: PatientData
}

export default function IntakeSummaryView({ patient }: IntakeSummaryViewProps) {
    const medicalHistory = patient.medical_history
    const consentDate = medicalHistory?.consentDate
        ? new Date(medicalHistory.consentDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : 'Unknown'

    const mobilityLabels = {
        walking: '🚶 Walking Independently',
        assistance_needed: '🦯 Walking with Assistance',
        wheelchair: '♿ Wheelchair',
        stretcher: '🛏️ Stretcher/Bed',
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #c7d2fe 0%, #e0e7ff 50%, #f8fafc 100%)', minHeight: '100vh' }}>
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
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
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Intake Form Summary</h1>
                            <p className="text-sm text-gray-600">Your submitted medical information</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Banner */}
                <div className="bg-green-50 border-2 border-green-300 rounded-2xl shadow-lg p-4 sm:p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
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
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-green-900 mb-2">
                                ✅ Intake Form Completed
                            </h2>
                            <p className="text-green-800 mb-2">
                                Your intake form was successfully submitted on <span className="font-semibold">{consentDate}</span>.
                            </p>
                            <p className="text-sm text-green-700">
                                If you need to update any information, please contact the reception desk at{' '}
                                <a href="tel:+2634791631" className="font-semibold underline">+263 4 791631</a>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Clinical Information */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-blue-600"
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
                            <h3 className="text-xl font-bold text-gray-900">Clinical Information</h3>
                            <p className="text-sm text-gray-600">Diagnosis and Referrals</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                            <p className="text-xs text-gray-600 mb-1 font-bold uppercase tracking-wider">Primary Diagnosis</p>
                            <p className="text-lg font-semibold text-gray-900">{medicalHistory?.diagnosis}</p>
                        </div>

                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                            <p className="text-xs text-gray-600 mb-1 font-bold uppercase tracking-wider">Referring Physician</p>
                            <p className="text-lg font-semibold text-gray-900">{medicalHistory?.referringPhysician}</p>
                        </div>

                        {medicalHistory?.allergyDetails && (
                            <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <h4 className="text-sm font-bold text-amber-900">Allergy Details:</h4>
                                </div>
                                <p className="text-sm text-amber-800 font-medium">{medicalHistory.allergyDetails}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Symptoms */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
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
                        </div>
                    </div>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{medicalHistory?.currentSymptoms}</p>
                    </div>
                </div>

                {/* Mobility Status */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
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
                        </div>
                    </div>
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <p className="text-lg font-semibold text-green-900">
                            {mobilityLabels[medicalHistory?.mobilityStatus as keyof typeof mobilityLabels] || medicalHistory?.mobilityStatus}
                        </p>
                    </div>
                </div>

                {/* Next of Kin */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
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
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Name</p>
                            <p className="text-sm font-semibold text-gray-900">{medicalHistory?.nextOfKin?.name}</p>
                        </div>
                        <div className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Relationship</p>
                            <p className="text-sm font-semibold text-gray-900">{medicalHistory?.nextOfKin?.relationship}</p>
                        </div>
                        <div className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Phone Number</p>
                            <p className="text-sm font-semibold text-gray-900">
                                <a href={`tel:${medicalHistory?.nextOfKin?.phone}`} className="text-blue-600 hover:underline">
                                    {medicalHistory?.nextOfKin?.phone}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional Notes */}
                {medicalHistory?.additionalNotes && (
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
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
                            </div>
                        </div>
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{medicalHistory.additionalNotes}</p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/dashboard"
                        className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold text-center hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        Go to Dashboard
                    </Link>
                    <a
                        href="tel:+2634791631"
                        className="flex-1 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-center hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                        </svg>
                        Contact Reception
                    </a>
                </div>
            </main>
        </div>
    )
}
