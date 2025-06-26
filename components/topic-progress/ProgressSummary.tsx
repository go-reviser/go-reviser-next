import { FC } from 'react';
import { ProgressSummary as ProgressSummaryType } from './types';
import ProgressBar from './ProgressBar';

interface ProgressSummaryProps {
    summary: ProgressSummaryType;
}

const ProgressSummary: FC<ProgressSummaryProps> = ({ summary }) => {
    // Calculate percentages for the progress bar
    const completedPercentage = summary.totalTopics > 0
        ? ((summary.completedTopics - summary.toReviseTopics) / summary.totalTopics) * 100
        : 0;

    const revisionPercentage = summary.totalTopics > 0
        ? (summary.toReviseTopics / summary.totalTopics) * 100
        : 0;

    return (
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 mb-6 sm:mb-8 border border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 md:mb-0">Your Learning Progress</h2>
                <div className="flex items-center bg-indigo-50 px-4 py-2 rounded-lg self-start">
                    <span className="text-2xl sm:text-3xl font-bold text-indigo-600">{summary.overallProgress || 0}%</span>
                    <span className="ml-2 text-gray-500">Complete</span>
                </div>
            </div>

            <div className="mb-6">
                <ProgressBar
                    completedPercentage={completedPercentage}
                    revisionPercentage={revisionPercentage}
                    showLegend={true}
                    height={4}
                    className="mb-2"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-5 rounded-xl border border-blue-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-blue-700 mb-1">Total Topics</p>
                            <p className="text-xl sm:text-2xl font-bold text-blue-900 transition-all duration-500">{summary.totalTopics}</p>
                        </div>
                        <div className="bg-blue-200 rounded-lg p-2">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-5 rounded-xl border border-green-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-green-700 mb-1">Completed</p>
                            <p className="text-xl sm:text-2xl font-bold text-green-900 transition-all duration-500">{summary.completedTopics}</p>
                        </div>
                        <div className="bg-green-200 rounded-lg p-2">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 sm:p-5 rounded-xl border border-yellow-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-yellow-700 mb-1">To Revise</p>
                            <p className="text-xl sm:text-2xl font-bold text-yellow-900 transition-all duration-500">{summary.toReviseTopics}</p>
                        </div>
                        <div className="bg-yellow-200 rounded-lg p-2">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-5 rounded-xl border border-purple-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-purple-700 mb-1">Not Started</p>
                            <p className="text-xl sm:text-2xl font-bold text-purple-900 transition-all duration-500">{summary.notStartedTopics}</p>
                        </div>
                        <div className="bg-purple-200 rounded-lg p-2">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressSummary; 