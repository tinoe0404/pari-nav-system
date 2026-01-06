// components/Roadmap.tsx
'use client'

import React, { useState } from 'react'
import { generateRoadmap } from '@/utils/roadmap-helpers'
import type { PatientStatus } from '@/types/patient'
import {
  CheckIcon,
  UserIcon,
  ScanIcon,
  ClockIcon,
  HeartIcon,
  LockIcon,
} from '@/components/icons/RoadmapIcons'
import { markConsultationComplete } from '@/app/actions/patient-actions'

interface RoadmapProps {
  currentStatus: PatientStatus
  consultantRoom?: string
  scanRoom?: string
  hasPlan?: boolean
}

export default function Roadmap({
  currentStatus,
  consultantRoom,
  scanRoom,
  hasPlan,
}: RoadmapProps) {
  const steps = generateRoadmap(currentStatus, consultantRoom, scanRoom, hasPlan)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const getIcon = (iconType: string, status: 'completed' | 'active' | 'locked') => {
    const baseClasses = 'w-6 h-6'
    const colorClasses =
      status === 'completed'
        ? 'text-white'
        : status === 'active'
          ? 'text-blue-600'
          : 'text-gray-400'

    const className = `${baseClasses} ${colorClasses}`

    switch (iconType) {
      case 'check':
        return <CheckIcon className={className} />
      case 'user':
        return <UserIcon className={className} />
      case 'scan':
        return <ScanIcon className={className} />
      case 'clock':
        return <ClockIcon className={className} />
      case 'heart':
        return <HeartIcon className={className} />
      default:
        return <CheckIcon className={className} />
    }
  }

  const getControlIndicator = (controlledBy: 'patient' | 'admin' | 'auto') => {
    if (controlledBy === 'patient') {
      return (
        <div className="flex items-center gap-1 text-xs text-indigo-700 font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Your Action
        </div>
      )
    } else if (controlledBy === 'admin') {
      return (
        <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Staff Will Complete
        </div>
      )
    }
    return null
  }

  const handleConsultationComplete = async () => {
    setIsSubmitting(true)
    setActionMessage(null)

    const result = await markConsultationComplete()

    if (result.success) {
      setActionMessage({ type: 'success', text: result.message || 'Consultation marked as complete!' })
      // Reload the page after a short delay to show updated roadmap
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      setActionMessage({ type: 'error', text: result.error || 'Failed to update. Please try again.' })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border-2 ${actionMessage.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
            }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <p className="font-medium">{actionMessage.text}</p>
          </div>
        </div>
      )}

      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`absolute left-8 top-20 w-1 h-20 -ml-px transition-all duration-500 ${step.status === 'completed'
                ? 'bg-gradient-to-b from-green-500 to-green-400'
                : step.status === 'active'
                  ? 'bg-gradient-to-b from-blue-500 to-blue-300'
                  : 'bg-gray-300'
                }`}
            />
          )}

          {/* Step Card */}
          <div
            className={`relative flex flex-col gap-4 p-6 rounded-2xl transition-all duration-500 ${step.status === 'completed'
              ? 'bg-green-50 border-2 border-green-200'
              : step.status === 'active'
                ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-400 shadow-xl shadow-indigo-200 scale-105'
                : 'bg-gray-50 border-2 border-gray-200 opacity-60'
              }`}
          >
            {/* Current Step Badge */}
            {step.status === 'active' && (
              <div className="absolute -top-3 left-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-lg animate-pulse">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  CURRENT STEP
                </span>
              </div>
            )}

            <div className="flex gap-4">
              {/* Icon Circle */}
              <div
                className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${step.status === 'completed'
                  ? 'bg-green-500 shadow-lg shadow-green-300'
                  : step.status === 'active'
                    ? 'bg-white border-4 border-indigo-600 shadow-xl shadow-indigo-300'
                    : 'bg-gray-300'
                  }`}
              >
                {step.status === 'locked' ? (
                  <LockIcon className="w-6 h-6 text-gray-500" />
                ) : (
                  getIcon(step.icon, step.status)
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 mt-1">
                {/* Step Label */}
                <h3
                  className={`text-xl font-bold mb-1 transition-colors ${step.status === 'completed'
                    ? 'text-green-900'
                    : step.status === 'active'
                      ? 'text-indigo-900'
                      : 'text-gray-500'
                    }`}
                >
                  {step.label}
                </h3>

                {/* Control Indicator */}
                {step.status === 'active' && getControlIndicator(step.controlledBy)}

                {/* Description */}
                <p
                  className={`text-sm mt-2 transition-colors ${step.status === 'completed'
                    ? 'text-green-700'
                    : step.status === 'active'
                      ? 'text-blue-800 font-medium'
                      : 'text-gray-500'
                    }`}
                >
                  {step.description}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                {step.status === 'completed' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-green-600 text-white">
                    <CheckIcon className="w-3 h-3" />
                    Complete
                  </span>
                )}
                {step.status === 'active' && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                    Active
                  </span>
                )}
                {step.status === 'locked' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-400 text-white">
                    <LockIcon className="w-3 h-3" />
                    Pending
                  </span>
                )}
              </div>
            </div>

            {/* Room Direction Card (Active steps only) */}
            {step.status === 'active' && step.room && (
              <div className="bg-white rounded-xl p-4 border-2 border-blue-300 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                    <p className="text-xs text-gray-600 font-medium">Location</p>
                    <p className="text-lg font-bold text-blue-900">{step.room}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button for Patient-Controlled Steps */}
            {step.status === 'active' &&
              step.actionRequired &&
              step.actionLabel &&
              step.id === 2 && (
                <button
                  onClick={handleConsultationComplete}
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ minHeight: '48px' }}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      {step.actionLabel}
                    </>
                  )}
                </button>
              )}

            {/* Planning Progress Bar (Scanning/Planning status) */}
            {step.status === 'active' &&
              (currentStatus === 'SCANNED' || currentStatus === 'PLANNING') &&
              step.id === 4 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">
                      Processing...
                    </span>
                    <span className="text-sm text-blue-600">In Progress</span>
                  </div>
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse w-2/3" />
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Our radiotherapy team is carefully reviewing your scans and
                    creating your personalized treatment plan. This typically takes
                    5-7 days.
                  </p>
                </div>
              )}
          </div>
        </div>
      ))}
    </div>
  )
}