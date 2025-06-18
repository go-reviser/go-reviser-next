import { useState, useEffect, useReducer } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface Subject {
    id: string;
    name: string;
}

// Form state interface
interface FormState {
    newSubject: string;
    isCreating: boolean;
    deletingSubjectId: string | null;
    error: string;
    success: string;
}

// Form action types
type FormAction =
    | { type: 'SET_NEW_SUBJECT'; payload: string }
    | { type: 'SET_CREATING'; payload: boolean }
    | { type: 'SET_DELETING_SUBJECT'; payload: string | null }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'SET_SUCCESS'; payload: string }
    | { type: 'RESET_FORM' }
    | { type: 'CLEAR_MESSAGES' };

// Initial form state
const initialFormState: FormState = {
    newSubject: '',
    isCreating: false,
    deletingSubjectId: null,
    error: '',
    success: ''
};

// Form reducer
const formReducer = (state: FormState, action: FormAction): FormState => {
    switch (action.type) {
        case 'SET_NEW_SUBJECT':
            return { ...state, newSubject: action.payload };
        case 'SET_CREATING':
            return { ...state, isCreating: action.payload };
        case 'SET_DELETING_SUBJECT':
            return { ...state, deletingSubjectId: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, success: '' };
        case 'SET_SUCCESS':
            return { ...state, success: action.payload, error: '' };
        case 'RESET_FORM':
            return {
                ...state,
                newSubject: '',
                error: '',
                success: ''
            };
        case 'CLEAR_MESSAGES':
            return { ...state, error: '', success: '' };
        default:
            return state;
    }
};

const AdminSubjects = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [formState, dispatch] = useReducer(formReducer, initialFormState);

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
        if (!token) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/signin';
        }
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
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch subjects' });
        }
    };

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'SET_CREATING', payload: true });
        dispatch({ type: 'CLEAR_MESSAGES' });

        try {
            const response = await fetch('/api/subjects/add', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    subject: formState.newSubject.trim()
                }),
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'SET_SUCCESS', payload: 'Subject created successfully' });
                dispatch({ type: 'RESET_FORM' });
                fetchSubjects();
            } else {
                dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to create subject' });
                fetchSubjects();
            }
        } catch (error) {
            console.error('Error creating subject:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to create subject' });
            fetchSubjects();
        } finally {
            dispatch({ type: 'SET_CREATING', payload: false });
        }
    };

    const handleDelete = async (subjectId: string) => {
        dispatch({ type: 'SET_DELETING_SUBJECT', payload: subjectId });
        dispatch({ type: 'CLEAR_MESSAGES' });

        try {
            const response = await fetch('/api/subjects/delete', {
                method: 'DELETE',
                headers: getAuthHeaders(),
                body: JSON.stringify({ subjectId: subjectId }),
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'SET_SUCCESS', payload: 'Subject deleted successfully' });
            }
            else {
                dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to delete subject' });
            }
            fetchSubjects();
        } catch (error) {
            console.error('Error deleting subject:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to delete subject' });
            fetchSubjects();
        } finally {
            dispatch({ type: 'SET_DELETING_SUBJECT', payload: null });
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

                    {formState.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {formState.error}
                        </div>
                    )}

                    {formState.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {formState.success}
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
                                        value={formState.newSubject}
                                        onChange={(e) => dispatch({ type: 'SET_NEW_SUBJECT', payload: e.target.value })}
                                        className="p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={formState.isCreating}
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {formState.isCreating ? 'Creating...' : 'Create Subject'}
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
                                                            disabled={formState.deletingSubjectId === subject.id}
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                        >
                                                            {formState.deletingSubjectId === subject.id ? 'Deleting...' : 'Delete'}
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