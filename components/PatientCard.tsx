// components/PatientCard.tsx - Mobile-friendly patient card for admin dashboard
import Link from 'next/link'
import type { PatientData } from '@/types/patient'

interface PatientCardProps {
    patient: PatientData
    isHighRisk: boolean
    statusBadgeColor: string
    statusLabel: string
}

export default function PatientCard({
    patient,
    isHighRisk,
    statusBadgeColor,
    statusLabel
}: PatientCardProps) {
    return (
        <Link
            href={`/admin/patient/${patient.id}`}
            className={`block bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all ${isHighRisk ? 'ring-2 ring-rose-300 bg-rose-50/30 border-rose-200' : ''
                }`}
        >
            {/* Header with Avatar and Name */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isHighRisk ? 'bg-rose-100 ring-2 ring-rose-300' : 'bg-indigo-100'
                            }`}
                    >
                        <span className={`font-bold text-sm ${isHighRisk ? 'text-rose-700' : 'text-indigo-700'}`}>
                            {patient.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">{patient.full_name}</h3>
                        <p className="text-xs text-gray-500">
                            DOB: {new Date(patient.dob).toLocaleDateString('en-GB')}
                        </p>
                    </div>
                </div>
                {isHighRisk && (
                    <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <p className="text-xs text-gray-600 font-medium">MRN</p>
                    <p className="text-sm font-mono font-bold text-indigo-700">{patient.mrn}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600 font-medium">Admission</p>
                    <p className="text-sm text-gray-900">
                        {new Date(patient.admission_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                        })}
                    </p>
                </div>
            </div>

            {/* Status and Risk Badges */}
            <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeColor}`}>
                    {statusLabel}
                </span>
                {isHighRisk ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        High Risk
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Standard
                    </span>
                )}
            </div>

            {/* Action Indicator */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-600">Tap to manage</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    )
}
