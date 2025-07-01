import React from 'react';
import { QuestionCategory } from './types';
import { Checkbox } from '../shared/FormElements';

interface CategorySelectorProps {
    categoriesBySubject: Record<string, QuestionCategory[]>;
    selectedCategories: string[];
    onToggleCategory: (categoryName: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
    categoriesBySubject,
    selectedCategories,
    onToggleCategory
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Question Categories</label>
            <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3">
                {Object.entries(categoriesBySubject).map(([subjectName, subjectCategories]) => (
                    <div key={subjectName} className="mb-4">
                        <h3 className="font-medium text-gray-700 mb-2">{subjectName}</h3>
                        <div className="space-y-2 ml-2">
                            {subjectCategories.map((category) => (
                                <Checkbox
                                    key={category.id}
                                    id={`category-${category.id}`}
                                    label={category.name}
                                    checked={selectedCategories.includes(category.name)}
                                    onChange={() => onToggleCategory(category.name)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">Selected: {selectedCategories.length}</p>
        </div>
    );
};

export default CategorySelector; 