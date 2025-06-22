import { FC } from 'react';
import { Subject, TopicProgress, ModuleProgressData } from './types';
import ModuleAccordion from './ModuleAccordion';
import ProgressBar from './ProgressBar';

interface SubjectAccordionProps {
    subject: Subject;
    progressMap: Record<string, TopicProgress>;
    expandedSubject: string | null;
    expandedModule: string | null;
    onToggleSubject: (subjectId: string) => void;
    onToggleModule: (moduleId: string) => void;
    onTopicUpdate: (topicId: string, isCompleted: boolean, toRevise: boolean) => Promise<void>;
    getModuleProgress: (module: { id: string; name: string; topics: Array<{ id: string; name: string }> }) => ModuleProgressData;
}

const SubjectAccordion: FC<SubjectAccordionProps> = ({
    subject,
    progressMap,
    expandedSubject,
    expandedModule,
    onToggleSubject,
    onToggleModule,
    onTopicUpdate,
    getModuleProgress
}) => {
    const isExpanded = expandedSubject === subject.id;

    // Calculate subject progress
    const calculateSubjectProgress = () => {
        let totalTopics = 0;
        let completedTopics = 0;
        let toReviseTopics = 0;

        subject.modules.forEach(module => {
            module.topics.forEach(topic => {
                totalTopics++;
                if (progressMap[topic.id]?.isCompleted) {
                    completedTopics++;
                    if (progressMap[topic.id]?.toRevise) {
                        toReviseTopics++;
                    }
                }
            });
        });

        return {
            total: totalTopics,
            completed: completedTopics,
            toRevise: toReviseTopics,
            percentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
        };
    };

    const subjectProgress = calculateSubjectProgress();

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg">
            {/* Subject Header */}
            <div
                className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 sm:p-5 cursor-pointer transition-colors duration-200 ${isExpanded ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                onClick={() => onToggleSubject(subject.id)}
            >
                <div className="flex-1 mb-4 sm:mb-0">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold mr-4">
                            {subject.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">{subject.name}</h2>
                    </div>
                    <div className="text-sm text-gray-500 mt-2 ml-14">
                        <span className="font-medium">{subjectProgress.completed}</span> of <span className="font-medium">{subjectProgress.total}</span> topics completed
                        {subjectProgress.toRevise > 0 && (
                            <span className="ml-2 text-yellow-600">
                                (<span className="font-medium">{subjectProgress.toRevise}</span> need revision)
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto sm:space-x-6">
                    <div className="flex flex-col items-start sm:items-end">
                        <span className="text-lg font-bold text-indigo-600">{subjectProgress.percentage}%</span>
                        <span className="text-xs text-gray-500">Complete</span>
                    </div>
                    <div className="w-32 sm:w-40 mx-4 sm:mx-0">
                        <ProgressBar
                            completedPercentage={subjectProgress.percentage}
                            revisionPercentage={subjectProgress.total > 0 ? (subjectProgress.toRevise / subjectProgress.total) * 100 : 0}
                            height={3}
                        />
                    </div>
                    <button
                        className={`p-3 sm:p-2 rounded-full transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                        <svg
                            className={`w-6 h-6 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Subject content with smooth transition */}
            <div
                className={`border-t border-indigo-100 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className={`p-4 sm:p-5 space-y-6 ${isExpanded ? 'bg-gradient-to-b from-indigo-50/50 to-white' : ''}`}>
                    {subject.modules.map((module) => (
                        <ModuleAccordion
                            key={module.id}
                            module={module}
                            progressMap={progressMap}
                            isExpanded={expandedModule === module.id}
                            onToggleModule={() => onToggleModule(module.id)}
                            onTopicUpdate={onTopicUpdate}
                            moduleProgress={getModuleProgress(module)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubjectAccordion; 