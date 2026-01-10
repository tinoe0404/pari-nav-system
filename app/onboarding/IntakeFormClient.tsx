// app/onboarding/IntakeFormClient.tsx
'use client'

import { useState } from 'react'
import { submitIntakeForm } from '@/app/actions/intake'

interface IntakeFormClientProps {
    error?: string
}

export default function IntakeFormClient({ error }: IntakeFormClientProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        try {
            await submitIntakeForm(formData)
        } catch (e) {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #c7d2fe 0%, #e0e7ff 50%, #f8fafc 100%)', minHeight: '100vh' }}>
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
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
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Medical Intake Form</h1>
                            <p className="text-sm text-gray-600">Help us prepare for your treatment</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* BLOCKING MESSAGE */}
                <div className="bg-red-50 border-4 border-red-300 rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
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
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-red-900 mb-3">
                                Help us treat you safely.
                            </h2>
                            <p className="text-lg sm:text-xl text-red-800 font-semibold mb-2">
                                Please fill out your history.
                            </p>
                            <p className="text-sm sm:base text-red-700 leading-relaxed">
                                Before you can access your dashboard, we need to collect your medical history.
                                This information is essential for our team to provide you with safe and effective treatment.
                                All information is confidential and will only be used for your care.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Welcome Card */}
                <div className="bg-blue-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2">Welcome to Parirenyatwa Radiotherapy</h2>
                            <p className="text-blue-100 text-sm leading-relaxed">
                                We need to collect some important medical information to ensure your safety and
                                provide you with the best possible care. This form will take approximately 5-10 minutes to complete.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <div className="flex gap-3">
                            <svg
                                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
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
                            <p className="text-sm text-red-800">{decodeURIComponent(error)}</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form action={handleSubmit} className="space-y-8">
                    {/* Section 1: Patient Details */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Personal Details</h3>
                                <p className="text-sm text-gray-600">Basic patient information</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 space-y-0">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name (Read-only)
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                                    value="[Auto-filled from profile]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth (Read-only)
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                                    value="[Auto-filled from profile]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    National ID Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nationalId"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="e.g., 63-123456-X-23"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Marital Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="maritalStatus"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                >
                                    <option value="">Select status...</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="divorced">Divorced</option>
                                    <option value="widowed">Widowed</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Residential Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="residentialAddress"
                                    rows={3}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                    placeholder="Enter full physical address..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Employment */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Employment</h3>
                                <p className="text-sm text-gray-600">Occupation and employer details</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Occupation <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="occupation"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="e.g., Teacher, Engineer, Unemployed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Employer Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="employerName"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Company/Organization name"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Employer Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="employerAddress"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Workplace address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Next of Kin */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Next of Kin</h3>
                                <p className="text-sm text-gray-600">Emergency contact information</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nextOfKinName"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Next of kin's name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Relationship <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nextOfKinRelationship"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="e.g., Spouse, Mother, Son"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="nextOfKinPhone"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="+263 7..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="nextOfKinAddress"
                                    rows={2}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                    placeholder="Next of kin's physical address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Clinical Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Clinical Information</h3>
                                <p className="text-sm text-gray-600">Diagnosis and referral details</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Primary Diagnosis <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="diagnosis"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="e.g., Carcinoma of the Cervix Stage IIB"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Referring Physician <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="referringPhysician"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Doctor who referred you"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mobility Status <span className="text-red-500">*</span>
                                </label>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {[
                                        { value: 'walking', label: 'Walking Independently', icon: '🚶' },
                                        { value: 'assistance_needed', label: 'Walking with Assistance', icon: '🦯' },
                                        { value: 'wheelchair', label: 'Wheelchair', icon: '♿' },
                                        { value: 'stretcher', label: 'Stretcher/Bed', icon: '🛏️' },
                                    ].map((option) => (
                                        <label
                                            key={option.value}
                                            className="relative flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="mobilityStatus"
                                                value={option.value}
                                                required
                                                disabled={isSubmitting}
                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                                            />
                                            <span className="text-xl">{option.icon}</span>
                                            <span className="text-sm text-gray-700 font-medium">
                                                {option.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Symptoms <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="currentSymptoms"
                                    rows={3}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                                    placeholder="Describe your current symptoms, pain levels, and any other relevant issues..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date & Time of Admission <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    name="admissionDate"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 6: Additional Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Additional Information</h3>
                        <textarea
                            name="additionalNotes"
                            rows={3}
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                            placeholder="Any other medical conditions or concerns..."
                        />
                    </div>

                    {/* Section 6: Consent */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-6">
                        <div className="flex items-start gap-4">
                            <input
                                type="checkbox"
                                name="consentGiven"
                                value="true"
                                required
                                disabled={isSubmitting}
                                className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                            />
                            <div>
                                <h4 className="text-lg font-bold text-blue-900 mb-2">
                                    Consent & Acknowledgment
                                </h4>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    I confirm that the information provided above is accurate and complete to the best of my knowledge.
                                    I understand that this information will be used to plan my treatment and ensure my safety.
                                    I consent to receive radiotherapy treatment at Parirenyatwa Hospital.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? (
                            <>
                                <svg
                                    className="animate-spin h-6 w-6 text-white"
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
                                Submitting...
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-6 h-6"
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
                                Complete Intake & Continue
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    )
}
