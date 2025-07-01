import { SubCategoriesState, Action, ActionType } from './types';

export const initialState: SubCategoriesState = {
    categories: [],
    subCategories: [],
    loading: false,
    error: null,
    success: null,
    selectedSubCategories: [],
    bulkSubCategories: '',
    bulkSelectedCategories: [],
    deletingSubCategories: false,
};

export const subCategoriesReducer = (state: SubCategoriesState, action: Action): SubCategoriesState => {
    switch (action.type) {
        case ActionType.SET_CATEGORIES:
            return { ...state, categories: action.payload };

        case ActionType.SET_SUBCATEGORIES:
            return { ...state, subCategories: action.payload };

        case ActionType.SET_LOADING:
            return { ...state, loading: action.payload };

        case ActionType.SET_ERROR:
            return { ...state, error: action.payload };

        case ActionType.SET_SUCCESS:
            return { ...state, success: action.payload };

        case ActionType.CLEAR_MESSAGES:
            return { ...state, error: null, success: null };

        case ActionType.SET_SELECTED_SUBCATEGORIES:
            return { ...state, selectedSubCategories: action.payload };

        case ActionType.TOGGLE_SUBCATEGORY: {
            const subCategoryId = action.payload;
            const isSelected = state.selectedSubCategories.includes(subCategoryId);

            return {
                ...state,
                selectedSubCategories: isSelected
                    ? state.selectedSubCategories.filter(id => id !== subCategoryId)
                    : [...state.selectedSubCategories, subCategoryId]
            };
        }

        case ActionType.SELECT_ALL_SUBCATEGORIES: {
            const subCategories = action.payload;
            const newSelected = [...state.selectedSubCategories];

            subCategories.forEach(sc => {
                if (!newSelected.includes(sc.id)) {
                    newSelected.push(sc.id);
                }
            });

            return { ...state, selectedSubCategories: newSelected };
        }

        case ActionType.DESELECT_ALL_SUBCATEGORIES: {
            const subCategories = action.payload;
            return {
                ...state,
                selectedSubCategories: state.selectedSubCategories.filter(
                    id => !subCategories.some(sc => sc.id === id)
                )
            };
        }

        case ActionType.SET_BULK_SUBCATEGORIES:
            return { ...state, bulkSubCategories: action.payload };

        case ActionType.SET_BULK_SELECTED_CATEGORIES:
            return { ...state, bulkSelectedCategories: action.payload };

        case ActionType.TOGGLE_BULK_CATEGORY: {
            const categoryName = action.payload;
            const isSelected = state.bulkSelectedCategories.includes(categoryName);

            return {
                ...state,
                bulkSelectedCategories: isSelected
                    ? state.bulkSelectedCategories.filter(name => name !== categoryName)
                    : [...state.bulkSelectedCategories, categoryName]
            };
        }

        case ActionType.RESET_BULK_FORM:
            return {
                ...state,
                bulkSubCategories: '',
                bulkSelectedCategories: []
            };

        case ActionType.SET_DELETING_SUBCATEGORIES:
            return { ...state, deletingSubCategories: action.payload };

        default:
            return state;
    }
}; 