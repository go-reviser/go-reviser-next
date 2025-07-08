import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useApi } from '@/hooks/useApi';

interface SubCategory {
  id: string;
  name: string;
  questionCount: number;
}

export default function PYQSubCategories() {
  const router = useRouter();
  const { category } = router.query;
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchApi } = useApi();

  useEffect(() => {
    async function fetchSubCategories() {
      if (!category) return;

      try {
        setLoading(true);
        setError(null);

        const formattedCategory = decodeURIComponent(category as string);

        // Fetch subcategories for the selected category using the public endpoint
        const response = await fetchApi<{
          data: SubCategory[];
          message: string;
        }>(`/api/sub-categories/by-category-public?categoryName=${formattedCategory}`);

        if (response) {
          setSubCategories(response.data);
        }
      } catch (err) {
        setError('Failed to fetch subcategories. Please try again later.');
        console.error('Error fetching subcategories:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubCategories();
  }, [category, fetchApi]);

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
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/pyq" className="hover:text-blue-600">
              PYQs
            </Link>
            <span>&gt;</span>
            <span className="font-medium">{category}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            {category}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Select a subcategory to view available questions
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {subCategories.length === 0 && !loading && !error ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-8 rounded text-center">
            <h3 className="text-xl font-medium">No subcategories found</h3>
            <p className="mt-2">There are no subcategories available for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subCategories.map((subCategory) => (
              <Link
                href={`/pyq/${encodeURIComponent(category as string)}/${encodeURIComponent(subCategory.name)}`}
                key={subCategory.id || subCategory.name}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {subCategory.name}
                </h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-gray-600">
                    {subCategory.questionCount} {subCategory.questionCount === 1 ? 'question' : 'questions'}
                  </span>
                  <span className="text-blue-600 flex items-center">
                    View Questions
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