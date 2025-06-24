export interface Topic {
    id: string;
    name: string;
}

export interface Module {
    id: string;
    name: string;
    topics: Topic[];
}

export interface Subject {
    id: string;
    name: string;
    modules: Module[];
}

export interface TopicProgress {
    topicId: string;
    isCompleted: boolean;
    toRevise: boolean;
}

export interface ProgressSummary {
    totalTopics: number;
    completedTopics: number;
    toReviseTopics: number;
    notStartedTopics: number;
    overallProgress: number;
}

export interface ModuleProgressData {
    completed: number;
    total: number;
    percentage: number;
}

export interface TopicUpdateHandler {
    (topicId: string, isCompleted: boolean, toRevise: boolean): Promise<void>;
}

// Reducer State
export interface TopicProgressState {
    subjects: Subject[];
    progressMap: Record<string, TopicProgress>;
    summary: ProgressSummary | null;
    isLoading: boolean;
    expandedSubject: string | null;
    expandedModule: string | null;
}

// Reducer Actions
export type TopicProgressAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_SUBJECTS'; payload: Subject[] }
    | { type: 'SET_SUMMARY'; payload: ProgressSummary }
    | { type: 'SET_PROGRESS_MAP'; payload: Record<string, TopicProgress> }
    | { type: 'UPDATE_TOPIC_PROGRESS'; payload: { topicId: string; isCompleted: boolean; toRevise: boolean } }
    | { type: 'TOGGLE_SUBJECT'; payload: string }
    | { type: 'TOGGLE_MODULE'; payload: string }
    | { type: 'UPDATE_SUMMARY' }; 