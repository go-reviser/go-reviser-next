import { FC } from 'react';
import { Module, TopicProgress, ModuleProgressData } from './types';
import TopicTable from './TopicTable';
import ProgressBar from './ProgressBar';

interface ModuleAccordionProps {
    module: Module;
    progressMap: Record<string, TopicProgress>;
    isExpanded: boolean;
    onToggleModule: () => void;
    onTopicUpdate: (topicId: string, isCompleted: boolean, toRevise: boolean) => Promise<void>;
    moduleProgress: ModuleProgressData;
}

const ModuleAccordion: FC<ModuleAccordionProps> = ({
    module,
    progressMap,
    isExpanded,
    onToggleModule,
    onTopicUpdate,
    moduleProgress
}) => {
    // Calculate topics that need revision
    const toReviseCount = module.topics.reduce((count, topic) => {
        const progress = progressMap[topic.id];
        return count + (progress?.isCompleted && progress?.toRevise ? 1 : 0);
    }, 0);

    return (
        <div className={`bg-white rounded-lg shadow-sm overflow-hidden border ${isExpanded ? 'border-indigo-200' : 'border-gray-200'} transition-all duration-300`}>
            {/* Module Header */}
            <div
                className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-4 cursor-pointer transition-colors duration-200 ${isExpanded ? 'bg-indigo-50/70' : 'hover:bg-gray-50'}`}
                onClick={onToggleModule}
            >
                <div className="flex-1 mb-3 sm:mb-0">
                    <div className="flex items-center">
                        <h3 className={`text-base font-medium ${isExpanded ? 'text-indigo-800' : 'text-gray-700'}`}>{module.name}</h3>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 ml-11">
                        <span className="font-medium">{moduleProgress.completed}</span> of <span className="font-medium">{moduleProgress.total}</span> topics completed
                        {toReviseCount > 0 && (
                            <span className="ml-2 text-yellow-600">
                                (<span className="font-medium">{toReviseCount}</span> need revision)
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto sm:space-x-5">
                    <div className="flex flex-col items-start sm:items-end">
                        <span className={`text-base font-bold ${isExpanded ? 'text-indigo-600' : 'text-gray-600'}`}>{moduleProgress.percentage}%</span>
                        <span className="text-xs text-gray-500">Complete</span>
                    </div>
                    <div className="w-28 sm:w-32 mx-3 sm:mx-0">
                        <ProgressBar
                            completedPercentage={moduleProgress.percentage}
                            revisionPercentage={moduleProgress.total > 0 ? (toReviseCount / moduleProgress.total) * 100 : 0}
                            height={2.5}
                        />
                    </div>
                    <button
                        className={`p-2.5 sm:p-1.5 rounded-full transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                        <svg
                            className={`w-5 h-5 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Module content with smooth transition */}
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-3 sm:p-4 border-t border-gray-100 bg-white">
                    <TopicTable
                        topics={module.topics}
                        progressMap={progressMap}
                        onTopicUpdate={onTopicUpdate}
                    />
                </div>
            </div>
        </div>
    );
};

export default ModuleAccordion;