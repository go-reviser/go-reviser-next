export interface QuestionCategory {
    id: string;
    name: string;
    subject?: {
        id: string;
        name: string;
    };
}

export interface SubCategory {
    id: string;
    name: string;
    questionCategories: {
        id: string;
        name: string;
    }[];
}

export interface SubCategoriesState {
    categories: QuestionCategory[];
    subCategories: SubCategory[];
    loading: boolean;
    error: string | null;
    success: string | null;
    selectedSubCategories: string[];
    bulkSubCategories: string;
    bulkSelectedCategories: string[];
    deletingSubCategories: boolean;
}

export enum ActionType {
    SET_CATEGORIES = 'SET_CATEGORIES',
    SET_SUBCATEGORIES = 'SET_SUBCATEGORIES',
    SET_LOADING = 'SET_LOADING',
    SET_ERROR = 'SET_ERROR',
    SET_SUCCESS = 'SET_SUCCESS',
    CLEAR_MESSAGES = 'CLEAR_MESSAGES',
    SET_SELECTED_SUBCATEGORIES = 'SET_SELECTED_SUBCATEGORIES',
    TOGGLE_SUBCATEGORY = 'TOGGLE_SUBCATEGORY',
    SELECT_ALL_SUBCATEGORIES = 'SELECT_ALL_SUBCATEGORIES',
    DESELECT_ALL_SUBCATEGORIES = 'DESELECT_ALL_SUBCATEGORIES',
    SET_BULK_SUBCATEGORIES = 'SET_BULK_SUBCATEGORIES',
    SET_BULK_SELECTED_CATEGORIES = 'SET_BULK_SELECTED_CATEGORIES',
    TOGGLE_BULK_CATEGORY = 'TOGGLE_BULK_CATEGORY',
    RESET_BULK_FORM = 'RESET_BULK_FORM',
    SET_DELETING_SUBCATEGORIES = 'SET_DELETING_SUBCATEGORIES',
}

export type Action =
    | { type: ActionType.SET_CATEGORIES; payload: QuestionCategory[] }
    | { type: ActionType.SET_SUBCATEGORIES; payload: SubCategory[] }
    | { type: ActionType.SET_LOADING; payload: boolean }
    | { type: ActionType.SET_ERROR; payload: string | null }
    | { type: ActionType.SET_SUCCESS; payload: string | null }
    | { type: ActionType.CLEAR_MESSAGES }
    | { type: ActionType.SET_SELECTED_SUBCATEGORIES; payload: string[] }
    | { type: ActionType.TOGGLE_SUBCATEGORY; payload: string }
    | { type: ActionType.SELECT_ALL_SUBCATEGORIES; payload: SubCategory[] }
    | { type: ActionType.DESELECT_ALL_SUBCATEGORIES; payload: SubCategory[] }
    | { type: ActionType.SET_BULK_SUBCATEGORIES; payload: string }
    | { type: ActionType.SET_BULK_SELECTED_CATEGORIES; payload: string[] }
    | { type: ActionType.TOGGLE_BULK_CATEGORY; payload: string }
    | { type: ActionType.RESET_BULK_FORM }
    | { type: ActionType.SET_DELETING_SUBCATEGORIES; payload: boolean }; 