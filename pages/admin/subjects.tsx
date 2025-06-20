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
                // Preserve success and error messages
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
                await fetchSubjects();
            } else {
                dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to create subject' });
                await fetchSubjects();
            }
        } catch (error) {
            console.error('Error creating subject:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to create subject' });
            await fetchSubjects();
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
            await fetchSubjects();
        } catch (error) {
            console.error('Error deleting subject:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to delete subject' });
            await fetchSubjects();
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

                            {subjects.length === 0 ? (
                                <div className="text-center text-gray-500 py-4">
                                    No subjects found
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {subjects.map((subject) => (
                                            <div
                                                key={subject.id}
                                                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-150 ease-in-out"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="text-gray-900 font-medium break-words">{subject.name}</div>
                                                    <button
                                                        onClick={() => handleDelete(subject.id)}
                                                        disabled={formState.deletingSubjectId === subject.id}
                                                        className="text-red-600 hover:text-red-900 disabled:opacity-50 ml-2"
                                                    >
                                                        {formState.deletingSubjectId === subject.id ? (
                                                            <span className="flex items-center">
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Deleting
                                                            </span>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AdminSubjects;