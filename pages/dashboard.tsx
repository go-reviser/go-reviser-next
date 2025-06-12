import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100">
                <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-semibold">Dashboard</h1>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                            <h2 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h2>
                            <p className="text-gray-600">
                                This is a protected route. You can only see this page if you&apos;re authenticated.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
} 