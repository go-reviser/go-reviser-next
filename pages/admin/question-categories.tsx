import { useState, useEffect } from 'react';
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

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [selectedSubject, setSelectedSubject] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [bulkCategories, setBulkCategories] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
            setError('Failed to fetch subjects');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/question-categories', {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            console.log('data', data);
            if (data.categories) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to fetch categories');
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/question-categories/create', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    name: categoryName,
                    subjectName: selectedSubject,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Category created successfully');
                setCategoryName('');
                setSelectedSubject('');
                fetchCategories();
            } else {
                setError(data.message || 'Failed to create category');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            setError('Failed to create category');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBulk = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const categoryList = bulkCategories
                .split('\n')
                .map(name => name.trim())
                .filter(name => name);

            const response = await fetch('/api/question-categories/create-bulk', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    categories: categoryList.map(name => ({
                        name,
                        subjectName: selectedSubject,
                    })),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Categories created successfully');
                setBulkCategories('');
                setSelectedSubject('');
                fetchCategories();
            } else {
                setError(data.message || 'Failed to create categories');
            }
        } catch (error) {
            console.error('Error creating categories:', error);
            setError('Failed to create categories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCategories.length) return;
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/question-categories/delete-bulk', {
                method: 'DELETE',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    categories: selectedCategories.map(id => ({ id })),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Categories deleted successfully');
                setSelectedCategories([]);
                fetchCategories();
            } else {
                setError(data.message || 'Failed to delete categories');
            }
        } catch (error) {
            console.error('Error deleting categories:', error);
            setError('Failed to delete categories');
        } finally {
            setLoading(false);
        }
    };

    const toggleCategorySelection = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    if (!user?.isAdmin) {
        return null;
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Question Categories</h1>

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
                        {/* Create Bulk Categories */}
                        <div className="h-fit bg-white shadow rounded-lg p-6 md:col-span-2">
                            <h2 className="text-xl font-semibold mb-4">Create Bulk Categories</h2>
                            <form onSubmit={handleCreateBulk}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Select a subject</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
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
                                        value={bulkCategories}
                                        onChange={(e) => setBulkCategories(e.target.value)}
                                        rows={5}
                                        className="p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Categories'}
                                </button>
                            </form>
                        </div>

                        {/* Categories List */}
                        <div className="bg-white shadow rounded-lg p-6 md:col-span-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Question Categories</h2>
                                {selectedCategories.length > 0 && (
                                    <button
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Deleting...' : `Delete Selected (${selectedCategories.length})`}
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
                                                            setSelectedCategories(categories.map(cat => cat.id));
                                                        } else {
                                                            setSelectedCategories([]);
                                                        }
                                                    }}
                                                    checked={selectedCategories.length === categories.length && categories.length > 0}
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
                                                        checked={selectedCategories.includes(category.id)}
                                                        onChange={() => toggleCategorySelection(category.id)}
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
