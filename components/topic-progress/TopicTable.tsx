import { FC } from 'react';
import { Topic, TopicProgress, TopicUpdateHandler } from './types';

interface TopicTableProps {
    topics: Topic[];
    progressMap: Record<string, TopicProgress>;
    onTopicUpdate: TopicUpdateHandler;
}

const TopicTable: FC<TopicTableProps> = ({ topics, progressMap, onTopicUpdate }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 font-medium text-gray-700 border-b bg-gray-50">
                <div className="pl-2 sm:pl-3">Topic Name</div>
                <div className="text-center">Completed</div>
                <div className="text-center">Need Revision</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
                {topics.map((topic) => {
                    const progress = progressMap[topic.id] || {
                        topicId: topic.id,
                        isCompleted: false,
                        toRevise: false,
                    };

                    // Determine row background color based on status
                    let rowClass = "hover:bg-gray-50 transition-colors duration-150";
                    if (progress.isCompleted && progress.toRevise) {
                        rowClass = "bg-yellow-50 hover:bg-yellow-100 transition-colors duration-150";
                    } else if (progress.isCompleted) {
                        rowClass = "bg-green-50 hover:bg-green-100 transition-colors duration-150";
                    }

                    return (
                        <div key={topic.id} className={`grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 items-center ${rowClass}`}>
                            <div className="font-medium text-gray-800 pl-2 sm:pl-3 flex items-start sm:items-center flex-col sm:flex-row">
                                <span className="inline-flex items-center justify-center mb-2 sm:mb-0 mr-0 sm:mr-3 w-6 h-6 rounded-full bg-gray-100 text-gray-400">
                                    {progress.isCompleted ? (
                                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    )}
                                </span>
                                <div className="flex flex-col">
                                    <span className="line-clamp-2 text-sm sm:text-base">{topic.name}</span>
                                    {progress.toRevise && (
                                        <span className="mt-1 inline-block bg-yellow-200 text-yellow-800 text-xs px-2 py-0.5 rounded-full w-fit">Revision</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <label className="inline-flex items-center cursor-pointer group touch-manipulation">
                                    <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${progress.isCompleted ? 'bg-green-500' : 'bg-gray-300'} group-hover:${progress.isCompleted ? 'bg-green-600' : 'bg-gray-400'}`}>
                                        <input
                                            type="checkbox"
                                            className="opacity-0 w-0 h-0"
                                            checked={progress.isCompleted}
                                            onChange={() => onTopicUpdate(
                                                topic.id,
                                                !progress.isCompleted,
                                                false
                                            )}
                                        />
                                        <span className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform ${progress.isCompleted ? 'translate-x-5' : ''}`}></span>
                                    </div>
                                </label>
                            </div>
                            <div className="flex justify-center">
                                <label className="inline-flex items-center cursor-pointer group touch-manipulation">
                                    <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${progress.toRevise ? 'bg-yellow-500' : 'bg-gray-300'} group-hover:${progress.toRevise ? 'bg-yellow-600' : 'bg-gray-400'} ${!progress.isCompleted ? 'opacity-50' : ''}`}>
                                        <input
                                            type="checkbox"
                                            className="opacity-0 w-0 h-0"
                                            checked={progress.toRevise}
                                            onChange={() => onTopicUpdate(
                                                topic.id,
                                                progress.isCompleted,
                                                !progress.toRevise
                                            )}
                                            disabled={!progress.isCompleted}
                                        />
                                        <span className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform ${progress.toRevise ? 'translate-x-5' : ''}`}></span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    );
                })}
                {topics.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        No topics available for this module.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopicTable; 