export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                <div className="prose prose-blue max-w-none">
                    <p className="text-gray-600 mb-4">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                        This Privacy Policy describes how Parirenyatwa Navigation collects, uses, and discloses your information when you use our service.
                    </p>
                    {/* Add more content as needed */}
                    <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Data Collection</h2>
                    <p className="text-gray-600">
                        We collect personal health information necessary for your treatment journey and navigation within the hospital.
                    </p>
                </div>
            </div>
        </div>
    )
}
