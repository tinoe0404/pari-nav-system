// components/Roadmap.tsx
'use client'

import React from 'react'
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

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`absolute left-8 top-16 w-0.5 h-16 -ml-px transition-colors duration-500 ${
                step.status === 'completed'
                  ? 'bg-green-500'
                  : step.status === 'active'
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
            />
          )}

          {/* Step Card */}
          <div
            className={`relative flex gap-4 p-6 rounded-2xl transition-all duration-500 ${
              step.status === 'completed'
                ? 'bg-green-50 border-2 border-green-200'
                : step.status === 'active'
                ? 'bg-blue-50 border-2 border-blue-300 shadow-lg shadow-blue-100'
                : 'bg-gray-50 border-2 border-gray-200'
            }`}
          >
            {/* Icon Circle */}
            <div
              className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                step.status === 'completed'
                  ? 'bg-green-500 shadow-lg shadow-green-200'
                  : step.status === 'active'
                  ? 'bg-white border-4 border-blue-500 shadow-lg shadow-blue-200 animate-pulse'
                  : 'bg-gray-200'
              }`}
            >
              {step.status === 'locked' ? (
                <LockIcon className="w-6 h-6 text-gray-400" />
              ) : (
                getIcon(step.icon, step.status)
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Step Label */}
              <h3
                className={`text-xl font-semibold mb-2 transition-colors ${
                  step.status === 'completed'
                    ? 'text-green-900'
                    : step.status === 'active'
                    ? 'text-blue-900'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </h3>

              {/* Description */}
              <p
                className={`text-sm mb-3 transition-colors ${
                  step.status === 'completed'
                    ? 'text-green-700'
                    : step.status === 'active'
                    ? 'text-blue-700'
                    : 'text-gray-500'
                }`}
              >
                {step.description}
              </p>

              {/* Room Direction Card (Active steps only) */}
              {step.status === 'active' && step.room && (
                <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-md">
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
                      <p className="text-xs text-gray-600 font-medium">Direction</p>
                      <p className="text-lg font-bold text-blue-900">{step.room}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Planning Progress Bar (Scanning/Planning status) */}
              {step.status === 'active' &&
                (currentStatus === 'SCANNED' || currentStatus === 'PLANNING') &&
                step.id === 4 && (
                  <div className="mt-4">
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

            {/* Status Badge */}
            <div className="flex-shrink-0">
              {step.status === 'completed' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                  Complete
                </span>
              )}
              {step.status === 'active' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white animate-pulse">
                  Current
                </span>
              )}
              {step.status === 'locked' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-300 text-gray-600">
                  Locked
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}