import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface Subject {
    id: string;
    name: string;
}

const AdminSubjects = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [newSubject, setNewSubject] = useState('');

    useEffect(() => {
        if (user && !user.isAdmin) {
            router.push('/');
        }
    }, [user, router]);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchSubjects = async () => {
        try {
            const response = await fetch('/api/subjects/get-all', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.subjectsData) {
                setSubjects(data.subjectsData);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
            setError('Failed to fetch subjects');
        }
    };

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/subjects/add', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    subject: newSubject.trim()
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Subject created successfully');
                setNewSubject('');
                fetchSubjects();
            } else {
                setError(data.message || 'Failed to create subject');
                fetchSubjects();
            }
        } catch (error) {
            console.error('Error creating subject:', error);
            setError('Failed to create subject');
            fetchSubjects();
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (subjectId: string) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/subjects/delete', {
                method: 'DELETE',
                headers: getAuthHeaders(),
                body: JSON.stringify({ subjectId: subjectId }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Subject deleted successfully');
            }
            else {
                setError(data.message || 'Failed to delete subject');
            }
            fetchSubjects();
        } catch (error) {
            console.error('Error deleting subject:', error);
            setError('Failed to delete subject');
            fetchSubjects();
        } finally {
            setLoading(false);
        }
    };

    if (!user?.isAdmin) {
        return null;
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Subjects</h1>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {success}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-6">
                        {/* Create Subject Form */}
                        <div className="h-fit bg-white shadow rounded-lg p-6 md:col-span-2">
                            <h2 className="text-xl font-semibold mb-4">Create Subject</h2>
                            <form onSubmit={handleCreateSubject}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Subject Name</label>
                                    <input
                                        type="text"
                                        value={newSubject}
                                        onChange={(e) => setNewSubject(e.target.value)}
                                        className="p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Subject'}
                                </button>
                            </form>
                        </div>

                        {/* Subjects List */}
                        <div className="bg-white shadow rounded-lg p-6 md:col-span-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Subjects</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subject Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {subjects.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                                                    No subjects found
                                                </td>
                                            </tr>
                                        ) : (
                                            subjects.map((subject) => (
                                                <tr
                                                    key={subject.id}
                                                    className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 break-words">{subject.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleDelete(subject.id)}
                                                            disabled={loading}
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AdminSubjects;