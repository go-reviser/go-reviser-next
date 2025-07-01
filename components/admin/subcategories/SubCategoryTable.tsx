import React from 'react';
import { SubCategory } from './types';
import { Button, Checkbox } from '../shared/FormElements';
import { Card } from '../shared/Card';

interface SubCategoryTableProps {
    subCategoriesByQuestionCategory: Record<string, SubCategory[]>;
    selectedSubCategories: string[];
    toggleSubCategory: (subCategoryId: string) => void;
    selectAllSubCategories: (subCategories: SubCategory[]) => void;
    deselectAllSubCategories: (subCategories: SubCategory[]) => void;
    handleDelete: () => Promise<void>;
    deletingSubCategories: boolean;
}

const SubCategoryTable: React.FC<SubCategoryTableProps> = ({
    subCategoriesByQuestionCategory,
    selectedSubCategories,
    toggleSubCategory,
    selectAllSubCategories,
    deselectAllSubCategories,
    handleDelete,
    deletingSubCategories
}) => {
    const deleteButton = selectedSubCategories.length > 0 && (
        <Button
            onClick={handleDelete}
            disabled={deletingSubCategories}
            variant="danger"
            className="text-sm py-1 px-3"
        >
            {deletingSubCategories ? 'Deleting...' : `Delete Selected (${selectedSubCategories.length})`}
        </Button>
    );

    return (
        <Card
            title="Subcategories by Question Category"
            actions={deleteButton}
        >
            {Object.keys(subCategoriesByQuestionCategory).length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                    No subcategories found
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(subCategoriesByQuestionCategory).map(([categoryName, categorySubCategories]) => (
                        <div key={categoryName} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                <h3 className="font-medium text-gray-800">{categoryName}</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                                <Checkbox
                                                    id={`select-all-${categoryName}`}
                                                    checked={categorySubCategories.every(sc => selectedSubCategories.includes(sc.id))}
                                                    onChange={() => {
                                                        const allSelected = categorySubCategories.every(sc => selectedSubCategories.includes(sc.id));
                                                        if (allSelected) {
                                                            deselectAllSubCategories(categorySubCategories);
                                                        } else {
                                                            selectAllSubCategories(categorySubCategories);
                                                        }
                                                    }}
                                                />
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                All Question Categories
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {categorySubCategories.map((subCategory) => (
                                            <tr key={subCategory.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Checkbox
                                                        id={`subcategory-${subCategory.id}`}
                                                        checked={selectedSubCategories.includes(subCategory.id)}
                                                        onChange={() => toggleSubCategory(subCategory.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{subCategory.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {subCategory.questionCategories.map((category) => (
                                                            <span
                                                                key={category.id}
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.name === categoryName
                                                                    ? 'bg-indigo-100 text-indigo-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                                    }`}
                                                            >
                                                                {category.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default SubCategoryTable;