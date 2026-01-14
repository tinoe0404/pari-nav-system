export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                <div className="prose prose-blue max-w-none">
                    <p className="text-gray-600 mb-4">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                        By accessing or using the Parirenyatwa Navigation service, you agree to be bound by these Terms of Service.
                    </p>
                    <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Acceptable Use</h2>
                    <p className="text-gray-600">
                        You agree to use this service only for lawful purposes along your patient journey.
                    </p>
                </div>
            </div>
        </div>
    )
}
