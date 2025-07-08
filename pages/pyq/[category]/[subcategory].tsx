import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { useApi } from '@/hooks/useApi';
import Head from 'next/head';

// Define MathJax types
declare global {
    interface Window {
        MathJax: {
            tex: {
                inlineMath: string[][];
                displayMath: string[][];
                processEscapes: boolean;
            };
            options: {
                skipHtmlTags: string[];
                ignoreHtmlClass: string;
                processHtmlClass: string;
            };
            typesetPromise?: () => Promise<void>;
        };
    }
}

interface Question {
    questionId: string;
    title: string;
    content: string;
    questionNumber: number;
    year: number;
    link: string;
    tags: { name: string }[];
    examBranches: { name: string }[];
    correctAnswer?: string;
    correctAnswers?: string[];
    numericalAnswer?: number;
    numericalAnswerRange?: { min: number; max: number };
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export default function PreviousYearQuestions() {
    const router = useRouter();
    const { category, subcategory, page: pageQuery } = router.query;

    // Initialize pagination state from URL query or default to page 1
    const initialPage = pageQuery ? parseInt(pageQuery as string, 10) : 1;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total: 0,
        page: initialPage,
        limit: 10,
        pages: 0,
    });
    const { fetchApi } = useApi();

    // Initialize MathJax
    useEffect(() => {
        // Add MathJax script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        script.id = 'MathJax-script';
        document.head.appendChild(script);

        // Configure MathJax
        window.MathJax = {
            tex: {
                inlineMath: [['\\(', '\\)']],
                displayMath: [['\\[', '\\]']],
                processEscapes: true,
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
                ignoreHtmlClass: 'tex2jax_ignore',
                processHtmlClass: 'tex2jax_process'
            }
        };

        return () => {
            // Clean up
            if (document.getElementById('MathJax-script')) {
                document.getElementById('MathJax-script')?.remove();
            }
        };
    }, []);

    // Add CSS for ordered lists in question content
    useEffect(() => {
        // Create a style element
        const style = document.createElement('style');
        style.id = 'question-content-styles';
        style.innerHTML = `
            .question-content ol {
                padding-left: 24px !important;
            }
            .question-content ol li {
                margin-bottom: 0.5rem;
            }
        `;
        document.head.appendChild(style);

        return () => {
            // Clean up
            if (document.getElementById('question-content-styles')) {
                document.getElementById('question-content-styles')?.remove();
            }
        };
    }, []);

    // Render MathJax when questions change
    useEffect(() => {
        if (questions.length > 0 && typeof window !== 'undefined') {
            // Wait a bit for the DOM to update before rendering math
            const timer = setTimeout(() => {
                if (window.MathJax && window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise();
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [questions]);

    // Update pagination state when URL query changes
    useEffect(() => {
        if (pageQuery) {
            const newPage = parseInt(pageQuery as string, 10);
            if (!isNaN(newPage) && newPage > 0 && newPage !== pagination.page) {
                setPagination(prev => ({ ...prev, page: newPage }));
            }
        }
    }, [pageQuery]);

    useEffect(() => {
        async function fetchQuestions() {
            if (!category || !subcategory) return;

            try {
                setLoading(true);
                setError(null);

                const formattedCategory = decodeURIComponent(category as string);
                const formattedSubcategory = decodeURIComponent(subcategory as string);

                const response = await fetchApi<{
                    data: Question[];
                    pagination: PaginationInfo;
                    message: string;
                }>(`/api/questions/by-category-subcategory?categoryName=${formattedCategory}&subCategoryName=${formattedSubcategory}&page=${pagination.page}&limit=${pagination.limit}`);

                if (response) {
                    setQuestions(response.data);
                    setPagination(prev => ({
                        ...prev,
                        total: response.pagination.total,
                        pages: response.pagination.pages
                    }));
                }
            } catch (err) {
                setError('Failed to fetch questions. Please try again later.');
                console.error('Error fetching questions:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchQuestions();
    }, [category, subcategory, pagination.page, pagination.limit, fetchApi]);

    const handlePageChange = (newPage: number) => {
        // Update URL with the new page number
        router.push(
            {
                pathname: router.pathname,
                query: { ...router.query, page: newPage }
            },
            undefined,
            { shallow: true }
        );

        // Update state
        setPagination(prev => ({ ...prev, page: newPage }));

        // Scroll to top when changing page
        window.scrollTo(0, 0);
    };

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
            <Head>
                <title>{category} - {subcategory} | Previous Year Questions</title>
            </Head>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Previous Year Questions
                    </h1>
                    <div className="text-lg text-gray-600 mt-2">
                        <span className="font-medium">{category}</span> &gt; <span className="font-medium">{subcategory}</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {questions.length === 0 && !loading && !error ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-8 rounded text-center">
                        <h3 className="text-xl font-medium">No questions found</h3>
                        <p className="mt-2">There are no previous year questions available for this category and subcategory.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {questions.map((question) => (
                            <div key={question.questionId} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        Q{question.questionNumber}. {question.title}
                                    </h3>
                                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                                        {question.year}
                                    </span>
                                </div>

                                <div
                                    className="prose max-w-none mb-4 tex2jax_process question-content"
                                    dangerouslySetInnerHTML={{ __html: question.content }}
                                />

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {question.tags.map((tag, index) => (
                                        <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>

                                {/* Exam Branches */}
                                <div className="mt-2">
                                    {question.examBranches.map((branch, index) => (
                                        <span key={index} className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                                            {branch.name}
                                        </span>
                                    ))}
                                </div>

                                {/* Link to original question */}
                                {question.link && (
                                    <div className="mt-4">
                                        <a
                                            href={question.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            View Original Question
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center mt-8">
                                <nav className="inline-flex rounded-md shadow">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className={`px-4 py-2 text-sm font-medium rounded-l-md ${pagination.page === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Previous
                                    </button>

                                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-4 py-2 text-sm font-medium ${pagination.page === page
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className={`px-4 py-2 text-sm font-medium rounded-r-md ${pagination.page === pagination.pages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
} 