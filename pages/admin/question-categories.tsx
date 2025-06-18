import { useState, useEffect, useReducer } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface Subject {
    id: string;
    name: string;
}

interface QuestionCategory {
    id: string;
    name: string;
    subject: {
        id: string;
        name: string;
    };
}

// Form state interface
interface FormState {
    selectedSubject: string;
    bulkCategories: string;
    selectedCategories: string[];
    loading: boolean;
    error: string;
    success: string;
}

// Form action types
type FormAction =
    | { type: 'SET_SUBJECT'; payload: string }
    | { type: 'SET_BULK_CATEGORIES'; payload: string }
    | { type: 'SET_SELECTED_CATEGORIES'; payload: string[] }
    | { type: 'TOGGLE_CATEGORY'; payload: string }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'SET_SUCCESS'; payload: string }
    | { type: 'RESET_FORM' }
    | { type: 'SELECT_ALL_CATEGORIES'; payload: string[] }
    | { type: 'CLEAR_MESSAGES' };

// Initial form state
const initialFormState: FormState = {
    selectedSubject: '',
    bulkCategories: '',
    selectedCategories: [],
    loading: false,
    error: '',
    success: ''
};

// Form reducer
const formReducer = (state: FormState, action: FormAction): FormState => {
    switch (action.type) {
        case 'SET_SUBJECT':
            return { ...state, selectedSubject: action.payload };
        case 'SET_BULK_CATEGORIES':
            return { ...state, bulkCategories: action.payload };
        case 'SET_SELECTED_CATEGORIES':
            return { ...state, selectedCategories: action.payload };
        case 'TOGGLE_CATEGORY':
            return {
                ...state,
                selectedCategories: state.selectedCategories.includes(action.payload)
                    ? state.selectedCategories.filter(id => id !== action.payload)
                    : [...state.selectedCategories, action.payload]
            };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, success: '' };
        case 'SET_SUCCESS':
            return { ...state, success: action.payload, error: '' };
        case 'RESET_FORM':
            return {
                ...state,
                selectedSubject: '',
                bulkCategories: ''
            };
        case 'SELECT_ALL_CATEGORIES':
            return { ...state, selectedCategories: action.payload };
        case 'CLEAR_MESSAGES':
            return { ...state, error: '', success: '' };
        default:
            return state;
    }
};

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

const AdminQuestionCategories = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [categories, setCategories] = useState<QuestionCategory[]>([]);
    const [formState, dispatch] = useReducer(formReducer, initialFormState);

    useEffect(() => {
        if (user && !user.isAdmin) {
            router.push('/');
        }
    }, [user, router]);

    useEffect(() => {
        fetchSubjects();
        fetchCategories();
    }, []);

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

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/question-categories', {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.categories) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch categories' });
        }
    };

    const handleCreateBulk = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_MESSAGES' });

        try {
            const categoryList = formState.bulkCategories
                .split('\n')
                .map(name => name.trim())
                .filter(name => name);

            const response = await fetch('/api/question-categories/create-bulk', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    categories: categoryList.map(name => ({
                        name,
                        subjectName: formState.selectedSubject,
                    })),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'SET_SUCCESS', payload: 'Categories created successfully' });
                dispatch({ type: 'RESET_FORM' });
                fetchCategories();
            } else {
                dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to create categories' });
            }
        } catch (error) {
            console.error('Error creating categories:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to create categories' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleDelete = async () => {
        if (!formState.selectedCategories.length) return;
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_MESSAGES' });

        try {
            const response = await fetch('/api/question-categories/delete-bulk', {
                method: 'DELETE',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    categories: formState.selectedCategories.map(id => ({ id })),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'SET_SUCCESS', payload: 'Categories deleted successfully' });
                dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: [] });
                fetchCategories();
            } else {
                dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to delete categories' });
            }
        } catch (error) {
            console.error('Error deleting categories:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to delete categories' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    if (!user?.isAdmin) {
        return null;
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Question Categories</h1>

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

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* Create Bulk Categories */}
                        <div className="h-fit bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Create Bulk Categories</h2>
                            <form onSubmit={handleCreateBulk}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                                    <select
                                        value={formState.selectedSubject}
                                        onChange={(e) => dispatch({ type: 'SET_SUBJECT', payload: e.target.value })}
                                        className="p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Select a subject</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.name} value={subject.name}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Category Names (one per line)
                                    </label>
                                    <textarea
                                        value={formState.bulkCategories}
                                        onChange={(e) => dispatch({ type: 'SET_BULK_CATEGORIES', payload: e.target.value })}
                                        rows={5}
                                        className="p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={formState.loading}
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {formState.loading ? 'Creating...' : 'Create Categories'}
                                </button>
                            </form>
                        </div>

                        {/* Categories List */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Question Categories</h2>
                                {formState.selectedCategories.length > 0 && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={formState.loading}
                                        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {formState.loading ? 'Deleting...' : `Delete Selected (${formState.selectedCategories.length})`}
                                    </button>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            dispatch({ type: 'SELECT_ALL_CATEGORIES', payload: categories.map(cat => cat.id) });
                                                        } else {
                                                            dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: [] });
                                                        }
                                                    }}
                                                    checked={formState.selectedCategories.length === categories.length && categories.length > 0}
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Subject
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {categories.map((category) => (
                                            <tr key={category.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={formState.selectedCategories.includes(category.id)}
                                                        onChange={() => dispatch({ type: 'TOGGLE_CATEGORY', payload: category.id })}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{category.subject.name}</td>
                                            </tr>
                                        ))}
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

export default AdminQuestionCategories;
