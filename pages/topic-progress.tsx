import { useEffect, useReducer } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/lib/contexts/AuthContext';
import ProgressSummary from '@/components/topic-progress/ProgressSummary';
import SubjectAccordion from '@/components/topic-progress/SubjectAccordion';
import type { Subject, TopicProgress, Module } from '@/components/topic-progress/types';
import { topicProgressReducer, initialState } from '@/components/topic-progress/topicProgressReducer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useApi } from '@/hooks/useApi';

// Define API response types
interface SyllabusResponse {
    subjects: Subject[];
}

interface ProgressSummaryResponse {
    data: {
        totalTopics: number;
        completed: number;
        toRevise: number;
        completionPercentage: number;
    };
}

interface UserTopicProgressResponse {
    userTopicProgress: Array<{
        topicId: string;
        isCompleted: boolean;
        toRevise: boolean;
    }>;
}

interface TopicUpdateResponse {
    updatedProgress: {
        topicId: string;
        isCompleted: boolean;
        toRevise: boolean;
    };
}

export default function TopicProgress() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [state, dispatch] = useReducer(topicProgressReducer, initialState);
    const { fetchApi } = useApi();

    const { subjects, progressMap, summary, isLoading, expandedSubject, expandedModule } = state;

    useEffect(() => {
        if (loading) return;

        const fetchData = async () => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });

                // Fetch syllabus data
                const syllabusData = await fetchApi<SyllabusResponse>('/api/syllabus');
                if (!syllabusData) return;

                dispatch({ type: 'SET_SUBJECTS', payload: syllabusData.subjects });

                // Fetch progress summary
                const summaryData = await fetchApi<ProgressSummaryResponse>('/api/user-topic-progress/summary', {
                    method: 'POST',
                    body: { userId: user?.userId }
                });
                if (!summaryData) return;

                dispatch({
                    type: 'SET_SUMMARY',
                    payload: {
                        totalTopics: summaryData.data.totalTopics,
                        completedTopics: summaryData.data.completed,
                        toReviseTopics: summaryData.data.toRevise,
                        notStartedTopics: summaryData.data.totalTopics - summaryData.data.completed,
                        overallProgress: summaryData.data.completionPercentage
                    }
                });

                const newProgressMap: Record<string, TopicProgress> = {};
                syllabusData.subjects.forEach((item: Subject) => {
                    item.modules.forEach((module) => {
                        module.topics.forEach((topic) => {
                            newProgressMap[topic.id] = {
                                topicId: topic.id,
                                isCompleted: false,
                                toRevise: false,
                            };
                        });
                    });
                });

                const progressData = await fetchApi<UserTopicProgressResponse>('/api/user-topic-progress');
                if (!progressData) return;

                for (const progress of progressData.userTopicProgress) {
                    newProgressMap[progress.topicId] = {
                        topicId: progress.topicId,
                        isCompleted: progress.isCompleted,
                        toRevise: progress.toRevise
                    };
                }

                dispatch({ type: 'SET_PROGRESS_MAP', payload: newProgressMap });
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        if (user)
            fetchData();
    }, [user, loading, router, fetchApi]);

    const handleTopicUpdate = async (topicId: string, isCompleted: boolean, toRevise: boolean) => {
        try {
            const responseData = await fetchApi<TopicUpdateResponse>(`/api/user-topic-progress/${user?.userId}/${topicId}`, {
                method: 'PUT',
                body: {
                    isCompleted,
                    toRevise,
                }
            });

            if (!responseData) return;

            const updatedProgress = responseData.updatedProgress;

            // Update the topic progress in the state
            dispatch({
                type: 'UPDATE_TOPIC_PROGRESS',
                payload: {
                    topicId,
                    isCompleted: updatedProgress.isCompleted,
                    toRevise: updatedProgress.toRevise
                }
            });

            // Update the summary based on the new progress
            dispatch({ type: 'UPDATE_SUMMARY' });

        } catch (error) {
            console.error('Error updating topic progress:', error);
        }
    };

    // Calculate module completion percentage
    const getModuleProgress = (module: Module) => {
        let completed = 0;
        const total = module.topics.length;

        module.topics.forEach(topic => {
            if (progressMap[topic.id]?.isCompleted) {
                completed++;
            }
        });

        return {
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    };

    // Handle toggling of subjects and modules
    const handleToggleSubject = (subjectId: string) => {
        dispatch({ type: 'TOGGLE_SUBJECT', payload: subjectId });
    };

    const handleToggleModule = (moduleId: string) => {
        dispatch({ type: 'TOGGLE_MODULE', payload: moduleId });
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8">
                    {/* Progress Summary */}
                    {summary && <ProgressSummary summary={summary} />}

                    {/* Subjects Accordion */}
                    <div className="space-y-5 sm:space-y-6">
                        {subjects.map((subject) => (
                            <SubjectAccordion
                                key={subject.id}
                                subject={subject}
                                progressMap={progressMap}
                                expandedSubject={expandedSubject}
                                expandedModule={expandedModule}
                                onToggleSubject={handleToggleSubject}
                                onToggleModule={handleToggleModule}
                                onTopicUpdate={handleTopicUpdate}
                                getModuleProgress={getModuleProgress}
                            />
                        ))}

                        {subjects.length === 0 && (
                            <div className="bg-white p-8 rounded-xl text-center shadow-md">
                                <h3 className="text-xl font-medium text-gray-700">No subjects available</h3>
                                <p className="text-gray-500 mt-2">Check back later for updated content.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}