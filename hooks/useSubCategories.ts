import { useReducer, useEffect, useCallback } from 'react';
import { ActionType, QuestionCategory, SubCategory } from '@/components/admin/subcategories/types';
import { subCategoriesReducer, initialState } from '@/components/admin/subcategories/subCategoriesReducer';
import { useApi } from './useApi';

interface UseSubCategoriesReturn {
    subCategories: SubCategory[];
    categories: QuestionCategory[];
    loading: boolean;
    error: string | null;
    success: string | null;
    selectedSubCategories: string[];
    bulkSubCategories: string;
    bulkSelectedCategories: string[];
    deletingSubCategories: boolean;
    fetchSubCategories: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    handleCreateBulk: (e: React.FormEvent) => Promise<void>;
    handleDelete: () => Promise<void>;
    setBulkSubCategories: (value: string) => void;
    toggleBulkCategory: (categoryName: string) => void;
    toggleSubCategory: (subCategoryId: string) => void;
    selectAllSubCategories: (subCategories: SubCategory[]) => void;
    deselectAllSubCategories: (subCategories: SubCategory[]) => void;
    clearMessages: () => void;
    resetBulkForm: () => void;
}

interface CategoriesResponse {
    categories: QuestionCategory[];
}

interface SubCategoriesResponse {
    subCategories: SubCategory[];
}

export const useSubCategories = (): UseSubCategoriesReturn => {
    const [state, dispatch] = useReducer(subCategoriesReducer, initialState);
    const { fetchApi } = useApi();

    const {
        categories,
        subCategories,
        loading,
        error,
        success,
        selectedSubCategories,
        bulkSubCategories,
        bulkSelectedCategories,
        deletingSubCategories
    } = state;

    const clearMessages = useCallback(() => {
        dispatch({ type: ActionType.CLEAR_MESSAGES });
    }, []);

    const resetBulkForm = useCallback(() => {
        dispatch({ type: ActionType.RESET_BULK_FORM });
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await fetchApi<CategoriesResponse>('/api/question-categories');
            if (data?.categories) {
                dispatch({ type: ActionType.SET_CATEGORIES, payload: data.categories });
            }
        } catch {
            dispatch({ type: ActionType.SET_ERROR, payload: 'Failed to fetch question categories' });
        }
    }, [fetchApi]);

    const fetchSubCategories = useCallback(async () => {
        try {
            const data = await fetchApi<SubCategoriesResponse>('/api/sub-categories');
            if (data?.subCategories) {
                dispatch({ type: ActionType.SET_SUBCATEGORIES, payload: data.subCategories });
            }
        } catch {
            dispatch({ type: ActionType.SET_ERROR, payload: 'Failed to fetch subcategories' });
        }
    }, [fetchApi]);

    const toggleBulkCategory = useCallback((categoryName: string) => {
        dispatch({ type: ActionType.TOGGLE_BULK_CATEGORY, payload: categoryName });
    }, []);

    const toggleSubCategory = useCallback((subCategoryId: string) => {
        dispatch({ type: ActionType.TOGGLE_SUBCATEGORY, payload: subCategoryId });
    }, []);

    const selectAllSubCategories = useCallback((subCategories: SubCategory[]) => {
        dispatch({ type: ActionType.SELECT_ALL_SUBCATEGORIES, payload: subCategories });
    }, []);

    const deselectAllSubCategories = useCallback((subCategories: SubCategory[]) => {
        dispatch({ type: ActionType.DESELECT_ALL_SUBCATEGORIES, payload: subCategories });
    }, []);

    const setBulkSubCategories = useCallback((value: string) => {
        dispatch({ type: ActionType.SET_BULK_SUBCATEGORIES, payload: value });
    }, []);

    const handleCreateBulk = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bulkSubCategories || bulkSelectedCategories.length === 0) {
            dispatch({ type: ActionType.SET_ERROR, payload: 'Subcategory names and at least one question category are required' });
            return;
        }

        dispatch({ type: ActionType.SET_LOADING, payload: true });
        clearMessages();

        try {
            const subCategoryList = bulkSubCategories
                .split('\n')
                .map(name => name.trim())
                .filter(name => name);

            const bulkData = subCategoryList.map(name => ({
                name,
                questionCategoryNames: bulkSelectedCategories
            }));

            await fetchApi('/api/sub-categories/create-bulk', {
                method: 'POST',
                body: { subCategories: bulkData }
            });

            dispatch({ type: ActionType.SET_SUCCESS, payload: 'Subcategories created successfully' });
            resetBulkForm();
            await fetchSubCategories();
        } catch (error) {
            if (error instanceof Error) {
                dispatch({ type: ActionType.SET_ERROR, payload: error.message || 'Failed to create subcategories' });
            } else {
                dispatch({ type: ActionType.SET_ERROR, payload: 'Failed to create subcategories' });
            }
        } finally {
            dispatch({ type: ActionType.SET_LOADING, payload: false });
        }
    }, [bulkSubCategories, bulkSelectedCategories, fetchApi, fetchSubCategories, clearMessages, resetBulkForm]);

    const handleDelete = useCallback(async () => {
        if (!selectedSubCategories.length) return;
        dispatch({ type: ActionType.SET_DELETING_SUBCATEGORIES, payload: true });
        clearMessages();

        try {
            await fetchApi('/api/sub-categories/delete-bulk', {
                method: 'DELETE',
                body: { subCategoryIds: selectedSubCategories }
            });

            dispatch({ type: ActionType.SET_SUCCESS, payload: 'Subcategories deleted successfully' });
            dispatch({ type: ActionType.SET_SELECTED_SUBCATEGORIES, payload: [] });
            await fetchSubCategories();
        } catch (error) {
            if (error instanceof Error) {
                dispatch({ type: ActionType.SET_ERROR, payload: error.message || 'Failed to delete subcategories' });
            } else {
                dispatch({ type: ActionType.SET_ERROR, payload: 'Failed to delete subcategories' });
            }
        } finally {
            dispatch({ type: ActionType.SET_DELETING_SUBCATEGORIES, payload: false });
        }
    }, [selectedSubCategories, fetchApi, fetchSubCategories, clearMessages]);

    useEffect(() => {
        fetchCategories();
        fetchSubCategories();
    }, [fetchCategories, fetchSubCategories]);

    return {
        subCategories,
        categories,
        loading,
        error,
        success,
        selectedSubCategories,
        bulkSubCategories,
        bulkSelectedCategories,
        deletingSubCategories,
        fetchSubCategories,
        fetchCategories,
        handleCreateBulk,
        handleDelete,
        setBulkSubCategories,
        toggleBulkCategory,
        toggleSubCategory,
        selectAllSubCategories,
        deselectAllSubCategories,
        clearMessages,
        resetBulkForm
    };
};
