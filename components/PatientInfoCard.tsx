// components/PatientInfoCard.tsx
import type { PatientData } from '@/types/patient'
import { getStatusColor, getStatusLabel } from '@/utils/roadmap-helpers'

interface PatientInfoCardProps {
  patient: PatientData
}

export default function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-100 rounded-2xl shadow-lg border border-violet-200 p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-violet-600 text-sm font-medium mb-1">Patient ID</p>
          <p className="text-3xl font-bold tracking-wide text-violet-900">{patient.mrn}</p>
        </div>
        <div className="w-12 h-12 bg-violet-200 rounded-xl flex items-center justify-center">
          <svg
            className="w-7 h-7 text-violet-600"
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

      <div className="border-t border-violet-200 pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-violet-600 text-sm">Patient Name</span>
          <span className="font-semibold text-violet-900">{patient.full_name}</span>
        </div>

        {patient.consultant_name && (
          <div className="flex justify-between items-center">
            <span className="text-violet-600 text-sm">Consultant</span>
            <span className="font-semibold text-violet-900">{patient.consultant_name}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-violet-600 text-sm">Current Status</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-violet-200 text-violet-800">
            {getStatusLabel(patient.current_status)}
          </span>
        </div>

        {patient.risk_flags && patient.risk_flags.length > 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
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
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  Important Notes
                </p>
                <div className="flex flex-wrap gap-2">
                  {patient.risk_flags.map((flag, index) => (
                    <span
                      key={index}
                      className="inline-block text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}