'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'

export interface QRCodeProps {
    /**
     * The URL or text to encode in the QR code
     */
    value: string

    /**
     * Size of the QR code in pixels
     * @default 256
     */
    size?: number

    /**
     * Foreground color (the QR code itself)
     * @default '#000000'
     */
    fgColor?: string

    /**
     * Background color
     * @default '#FFFFFF'
     */
    bgColor?: string

    /**
     * Error correction level: 'L' | 'M' | 'Q' | 'H'
     * L: Low (7% recovery)
     * M: Medium (15% recovery) - Recommended
     * Q: Quartile (25% recovery)
     * H: High (30% recovery) - Best for damaged codes
     * @default 'H'
     */
    level?: 'L' | 'M' | 'Q' | 'H'

    /**
     * Whether to show a download button
     * @default false
     */
    showDownload?: boolean

    /**
     * Custom filename for download (without extension)
     * @default 'qr-code'
     */
    downloadFilename?: string

    /**
     * Optional title/caption to display below the QR code
     */
    title?: string

    /**
     * Additional CSS classes for the container
     */
    className?: string
}

/**
 * Production-ready QR Code component with customizable styling and download capability
 * 
 * @example
 * ```tsx
 * <QRCode 
 *   value="https://example.com" 
 *   size={300}
 *   showDownload={true}
 *   title="Scan to visit our site"
 * />
 * ```
 */
export default function QRCode({
    value,
    size = 256,
    fgColor = '#000000',
    bgColor = '#FFFFFF',
    level = 'H',
    showDownload = false,
    downloadFilename = 'qr-code',
    title,
    className = '',
}: QRCodeProps) {
    const [isDownloading, setIsDownloading] = useState(false)

    /**
     * Download the QR code as PNG
     */
    const handleDownload = () => {
        try {
            setIsDownloading(true)

            // Get the SVG element
            const svg = document.getElementById(`qr-code-${value}`)
            if (!svg) {
                throw new Error('QR code element not found')
            }

            // Create a canvas element
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                throw new Error('Could not get canvas context')
            }

            // Set canvas size (increase for higher resolution)
            const scale = 2 // 2x resolution for better print quality
            canvas.width = size * scale
            canvas.height = size * scale

            // Create an image from the SVG
            const svgData = new XMLSerializer().serializeToString(svg)
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
            const url = URL.createObjectURL(svgBlob)

            const img = new Image()
            img.onload = () => {
                // Draw white background
                ctx.fillStyle = bgColor
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // Draw the image
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                // Convert to PNG and download
                canvas.toBlob((blob) => {
                    if (!blob) {
                        throw new Error('Could not create blob')
                    }

                    const pngUrl = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = pngUrl
                    link.download = `${downloadFilename}.png`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)

                    // Cleanup
                    URL.revokeObjectURL(pngUrl)
                    URL.revokeObjectURL(url)
                    setIsDownloading(false)
                }, 'image/png')
            }

            img.onerror = () => {
                URL.revokeObjectURL(url)
                setIsDownloading(false)
                throw new Error('Failed to load QR code image')
            }

            img.src = url
        } catch (error) {
            console.error('Error downloading QR code:', error)
            setIsDownloading(false)
            alert('Failed to download QR code. Please try again.')
        }
    }

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            {/* QR Code */}
            <div
                className="bg-white p-4 rounded-lg shadow-lg"
                style={{ backgroundColor: bgColor }}
            >
                <QRCodeSVG
                    id={`qr-code-${value}`}
                    value={value}
                    size={size}
                    bgColor={bgColor}
                    fgColor={fgColor}
                    level={level}
                    marginSize={1}
                    includeMargin={true}
                />
            </div>

            {/* Title */}
            {title && (
                <p className="text-sm text-gray-700 font-medium text-center max-w-md">
                    {title}
                </p>
            )}

            {/* Download Button */}
            {showDownload && (
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Downloading...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PNG
                        </>
                    )}
                </button>
            )}
        </div>
    )
}
