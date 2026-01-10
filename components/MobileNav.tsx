'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface NavLink {
    href: string
    label: string
    icon: React.ReactNode
}

interface MobileNavProps {
    isPatient?: boolean
    isAdmin?: boolean
    onLogout?: () => void
    adminStatusCounts?: {
        ALL: number
        AWAITING_SCAN: number
        PLANNING_QUEUE: number
        PLAN_READY: number
        IN_REVIEWS: number
        COMPLETED: number
    }
}

export default function MobileNav({ isPatient = false, isAdmin = false, onLogout, adminStatusCounts }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentStatus = searchParams.get('status')

    // Close menu when route changes or status changes
    useEffect(() => {
        setIsOpen(false)
    }, [pathname, currentStatus])

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const patientLinks: NavLink[] = [
        {
            href: '/dashboard',
            label: 'Dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            href: '/onboarding',
            label: 'Medical Intake',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
    ]

    const adminLinks: NavLink[] = [
        {
            href: '/admin/dashboard',
            label: 'Dashboard Overview',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
        },
    ]

    const links = isAdmin ? adminLinks : isPatient ? patientLinks : []

    return (
        <>
            {/* Hamburger Button - Only visible on mobile */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Backdrop Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Drawer Menu */}
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Parirenyatwa</h2>
                            <p className="text-xs text-gray-600 font-medium">{isAdmin ? 'Admin Portal' : 'Patient Portal'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        aria-label="Close menu"
                    >
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
                    <ul className="space-y-1">
                        {/* Main Links */}
                        {links.map((link) => {
                            const isActive = pathname === link.href && !searchParams.toString()
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${isActive
                                            ? 'bg-purple-50 text-purple-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {link.icon}
                                        <span>{link.label}</span>
                                    </Link>
                                </li>
                            )
                        })}

                        {/* Admin Filters - Rendered directly in menu */}
                        {isAdmin && adminStatusCounts && (
                            <>
                                <li className="pt-4 pb-2">
                                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Patient Filters</p>
                                </li>

                                {/* All Patients */}
                                <li>
                                    <Link
                                        href="/admin/dashboard"
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${!currentStatus
                                            ? 'bg-purple-100 text-purple-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${!currentStatus ? 'bg-purple-500' : 'bg-gray-300'}`} />
                                            <span>All Patients</span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${!currentStatus ? 'bg-white text-purple-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {adminStatusCounts.ALL}
                                        </span>
                                    </Link>
                                </li>

                                {/* Awaiting Scan */}
                                <li>
                                    <Link
                                        href="/admin/dashboard?status=CONSULTATION_COMPLETED"
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${currentStatus === 'CONSULTATION_COMPLETED'
                                            ? 'bg-orange-100 text-orange-800 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${currentStatus === 'CONSULTATION_COMPLETED' ? 'bg-orange-500' : 'bg-orange-200'
                                                }`} />
                                            <span>Awaiting Scan</span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${currentStatus === 'CONSULTATION_COMPLETED' ? 'bg-white text-orange-800' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {adminStatusCounts.AWAITING_SCAN}
                                        </span>
                                    </Link>
                                </li>

                                {/* Planning Queue */}
                                <li>
                                    <Link
                                        href="/admin/dashboard?status=SCANNED"
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${currentStatus === 'SCANNED'
                                            ? 'bg-blue-100 text-blue-800 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${currentStatus === 'SCANNED' ? 'bg-blue-500' : 'bg-blue-200'
                                                }`} />
                                            <span>Planning Queue</span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${currentStatus === 'SCANNED' ? 'bg-white text-blue-800' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {adminStatusCounts.PLANNING_QUEUE}
                                        </span>
                                    </Link>
                                </li>

                                {/* Ready for Treatment */}
                                <li>
                                    <Link
                                        href="/admin/dashboard?status=PLAN_READY"
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${currentStatus === 'PLAN_READY'
                                            ? 'bg-green-100 text-green-800 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${currentStatus === 'PLAN_READY' ? 'bg-green-500' : 'bg-green-200'
                                                }`} />
                                            <span>Ready for Treatment</span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${currentStatus === 'PLAN_READY' ? 'bg-white text-green-800' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {adminStatusCounts.PLAN_READY}
                                        </span>
                                    </Link>
                                </li>

                                {/* In Reviews */}
                                <li>
                                    <Link
                                        href="/admin/dashboard?status=IN_REVIEWS"
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${currentStatus === 'IN_REVIEWS'
                                            ? 'bg-amber-100 text-amber-800 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${currentStatus === 'IN_REVIEWS' ? 'bg-amber-500' : 'bg-amber-200'
                                                }`} />
                                            <span>In Reviews</span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${currentStatus === 'IN_REVIEWS' ? 'bg-white text-amber-800' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {adminStatusCounts.IN_REVIEWS}
                                        </span>
                                    </Link>
                                </li>

                                {/* Discharged */}
                                <li>
                                    <Link
                                        href="/admin/dashboard?status=DISCHARGED_GROUP"
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${currentStatus === 'DISCHARGED_GROUP' || currentStatus === 'TREATMENT_COMPLETED'
                                            ? 'bg-teal-100 text-teal-800 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${currentStatus === 'DISCHARGED_GROUP' || currentStatus === 'TREATMENT_COMPLETED' ? 'bg-teal-500' : 'bg-teal-200'
                                                }`} />
                                            <span>Discharged</span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${currentStatus === 'DISCHARGED_GROUP' || currentStatus === 'TREATMENT_COMPLETED' ? 'bg-white text-teal-800' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {adminStatusCounts.COMPLETED}
                                        </span>
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>

                {/* Logout Button */}
                {onLogout && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
