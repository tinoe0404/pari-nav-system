// app/admin/qr-code/page.tsx
// Example implementation page for the QRCode component

import QRCode from '@/components/QRCode'

export default function QRCodeExamplePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        QR Code Generator - Examples
                    </h1>
                    <p className="text-gray-600">
                        Production-ready QR codes for the Pari Navigation System
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Example 1: Basic QR Code */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Basic QR Code
                        </h2>
                        <QRCode
                            value="https://pari-nav-system.vercel.app/"
                            size={200}
                        />
                    </div>

                    {/* Example 2: QR Code with Download */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            QR Code with Download
                        </h2>
                        <QRCode
                            value="https://pari-nav-system.vercel.app/"
                            size={200}
                            showDownload={true}
                            downloadFilename="pari-nav-patient-portal"
                            title="Scan to access Patient Portal"
                        />
                    </div>

                    {/* Example 3: Pamphlet Version (High Contrast) */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Pamphlet Version (High Contrast)
                        </h2>
                        <QRCode
                            value="https://pari-nav-system.vercel.app/"
                            size={300}
                            fgColor="#000000"
                            bgColor="#FFFFFF"
                            level="H"
                            showDownload={true}
                            downloadFilename="parirenyatwa-navigation-pamphlet"
                            title="Scan to Navigate Parirenyatwa Hospital"
                        />
                    </div>

                    {/* Example 4: Custom Colored QR Code */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Branded QR Code
                        </h2>
                        <QRCode
                            value="https://pari-nav-system.vercel.app/"
                            size={200}
                            fgColor="#7C3AED"
                            bgColor="#F5F3FF"
                            showDownload={true}
                            downloadFilename="pari-nav-branded"
                            title="Branded with Pari Nav colors"
                        />
                    </div>

                    {/* Example 5: Large Print Version */}
                    <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Large Print Version (Poster/Signage)
                        </h2>
                        <QRCode
                            value="https://pari-nav-system.vercel.app/"
                            size={400}
                            level="H"
                            showDownload={true}
                            downloadFilename="parirenyatwa-navigation-large-poster"
                            title="Scan to Navigate Parirenyatwa Radiotherapy Department"
                        />
                    </div>
                </div>

                {/* Usage Instructions */}
                <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-blue-900 mb-4">
                        💡 Usage Instructions
                    </h2>
                    <div className="space-y-4 text-blue-800">
                        <div>
                            <h3 className="font-semibold mb-2">Basic Usage:</h3>
                            <pre className="bg-white p-4 rounded-lg overflow-x-auto text-sm">
                                {`<QRCode value="https://pari-nav-system.vercel.app/" />`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">With Customization:</h3>
                            <pre className="bg-white p-4 rounded-lg overflow-x-auto text-sm">
                                {`<QRCode 
  value="https://pari-nav-system.vercel.app/"
  size={300}
  fgColor="#000000"
  bgColor="#FFFFFF"
  level="H"
  showDownload={true}
  downloadFilename="my-qr-code"
  title="Scan me!"
/>`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Props:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><code>value</code> - URL or text to encode (required)</li>
                                <li><code>size</code> - Size in pixels (default: 256)</li>
                                <li><code>fgColor</code> - QR code color (default: #000000)</li>
                                <li><code>bgColor</code> - Background color (default: #FFFFFF)</li>
                                <li><code>level</code> - Error correction: L, M, Q, H (default: H)</li>
                                <li><code>showDownload</code> - Show download button (default: false)</li>
                                <li><code>downloadFilename</code> - Custom filename (default: qr-code)</li>
                                <li><code>title</code> - Caption text below QR code</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">📖 Error Correction Levels:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li><strong>L (Low)</strong> - 7% recovery - Use for digital displays</li>
                                <li><strong>M (Medium)</strong> - 15% recovery - General purpose</li>
                                <li><strong>Q (Quartile)</strong> - 25% recovery - Good balance</li>
                                <li><strong>H (High)</strong> - 30% recovery - Best for print materials</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
