import React from 'react';
import SubCategoryTable from './SubCategoryTable';
import { SubCategory } from './types';

interface SubCategoriesListProps {
    subCategories: SubCategory[];
    selectedSubCategories: string[];
    toggleSubCategory: (subCategoryId: string) => void;
    selectAllSubCategories: (subCategories: SubCategory[]) => void;
    deselectAllSubCategories: (subCategories: SubCategory[]) => void;
    handleDelete: () => Promise<void>;
    deletingSubCategories: boolean;
}

const SubCategoriesList: React.FC<SubCategoriesListProps> = ({
    subCategories,
    selectedSubCategories,
    toggleSubCategory,
    selectAllSubCategories,
    deselectAllSubCategories,
    handleDelete,
    deletingSubCategories
}) => {
    // Group subcategories by question category
    const subCategoriesByQuestionCategory: Record<string, SubCategory[]> = {};
    subCategories.forEach(subCategory => {
        subCategory.questionCategories.forEach(category => {
            if (!subCategoriesByQuestionCategory[category.name])
                subCategoriesByQuestionCategory[category.name] = [];
            if (!subCategoriesByQuestionCategory[category.name].find(sc => sc.id === subCategory.id))
                subCategoriesByQuestionCategory[category.name].push(subCategory);
        });
    });

    return (
        <SubCategoryTable
            subCategoriesByQuestionCategory={subCategoriesByQuestionCategory}
            selectedSubCategories={selectedSubCategories}
            toggleSubCategory={toggleSubCategory}
            selectAllSubCategories={selectAllSubCategories}
            deselectAllSubCategories={deselectAllSubCategories}
            handleDelete={handleDelete}
            deletingSubCategories={deletingSubCategories}
        />
    );
};

export default SubCategoriesList; 