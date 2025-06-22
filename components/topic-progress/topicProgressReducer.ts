import { TopicProgressState, TopicProgressAction } from './types';

export const initialState: TopicProgressState = {
    subjects: [],
    progressMap: {},
    summary: null,
    isLoading: true,
    expandedSubject: null,
    expandedModule: null
};

export function topicProgressReducer(state: TopicProgressState, action: TopicProgressAction): TopicProgressState {
    switch (action.type) {
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload
            };

        case 'SET_SUBJECTS':
            return {
                ...state,
                subjects: action.payload
            };

        case 'SET_SUMMARY':
            return {
                ...state,
                summary: action.payload
            };

        case 'SET_PROGRESS_MAP':
            return {
                ...state,
                progressMap: action.payload
            };

        case 'UPDATE_TOPIC_PROGRESS': {
            const { topicId, isCompleted, toRevise } = action.payload;
            const newProgressMap = {
                ...state.progressMap,
                [topicId]: {
                    topicId,
                    isCompleted,
                    toRevise
                }
            };

            return {
                ...state,
                progressMap: newProgressMap
            };
        }

        case 'TOGGLE_SUBJECT':
            return {
                ...state,
                expandedSubject: state.expandedSubject === action.payload ? null : action.payload
            };

        case 'TOGGLE_MODULE':
            return {
                ...state,
                expandedModule: state.expandedModule === action.payload ? null : action.payload
            };

        case 'UPDATE_SUMMARY': {
            if (!state.summary) return state;

            // Count completed and to-revise topics
            let completed = 0;
            let toRevise = 0;

            Object.values(state.progressMap).forEach(progress => {
                if (progress.isCompleted) {
                    completed++;
                    if (progress.toRevise) {
                        toRevise++;
                    }
                }
            });

            const totalTopics = state.summary.totalTopics;

            return {
                ...state,
                summary: {
                    ...state.summary,
                    completedTopics: completed,
                    toReviseTopics: toRevise,
                    notStartedTopics: totalTopics - completed,
                    overallProgress: totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0
                }
            };
        }

        default:
            return state;
    }
} 