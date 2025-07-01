import React from 'react';
import CategorySelector from './CategorySelector';
import { QuestionCategory } from './types';
import { TextArea, Button } from '../shared/FormElements';
import { Card } from '../shared/Card';

interface SubCategoryFormProps {
    bulkSubCategories: string;
    setBulkSubCategories: (value: string) => void;
    bulkSelectedCategories: string[];
    toggleBulkCategory: (categoryName: string) => void;
    categoriesBySubject: Record<string, QuestionCategory[]>;
    handleCreateBulk: (e: React.FormEvent) => Promise<void>;
    loading: boolean;
}

const SubCategoryForm: React.FC<SubCategoryFormProps> = ({
    bulkSubCategories,
    setBulkSubCategories,
    bulkSelectedCategories,
    toggleBulkCategory,
    categoriesBySubject,
    handleCreateBulk,
    loading
}) => {
    return (
        <Card title="Create Subcategories" className="mb-8">
            <form onSubmit={handleCreateBulk}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <TextArea
                        id="bulkSubCategories"
                        label="Subcategory Names (one per line)"
                        value={bulkSubCategories}
                        onChange={(e) => setBulkSubCategories(e.target.value)}
                        placeholder="Enter each subcategory name on a new line"
                        required
                        rows={8}
                    />
                    <div>
                        <CategorySelector
                            categoriesBySubject={categoriesBySubject}
                            selectedCategories={bulkSelectedCategories}
                            onToggleCategory={toggleBulkCategory}
                        />
                    </div>
                </div>
                <div className="mt-6">
                    <Button
                        type="submit"
                        disabled={loading}
                        variant="primary"
                    >
                        {loading ? 'Creating...' : 'Create Subcategories'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default SubCategoryForm; 