import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useApi } from '@/hooks/useApi';

interface Category {
    categoryId: string;
    name: string;
    questionCount: number;
}

export default function PYQCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { fetchApi } = useApi();

    useEffect(() => {
        async function fetchCategories() {
            try {
                setLoading(true);
                setError(null);

                // Fetch all subjects with question counts
                const response = await fetchApi<{ data: Category[]; message: string; }>('/api/questions?subjects=true');

                if (response) {
                    setCategories(response.data);
                }
            } catch (err) {
                setError('Failed to fetch categories. Please try again later.');
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, [fetchApi]);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Previous Year Questions
                    </h1>
                    <p className="text-lg text-gray-600 mt-2">
                        Select a category to view available subcategories and questions
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {categories.length === 0 && !loading && !error ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-8 rounded text-center">
                        <h3 className="text-xl font-medium">No categories found</h3>
                        <p className="mt-2">There are no question categories available yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <Link
                                href={`/pyq/${encodeURIComponent(category.name)}`}
                                key={category.categoryId}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
                            >
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {category.name}
                                </h3>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-gray-600">
                                        {category.questionCount} {category.questionCount === 1 ? 'question' : 'questions'}
                                    </span>
                                    <span className="text-blue-600 flex items-center">
                                        View
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
} 