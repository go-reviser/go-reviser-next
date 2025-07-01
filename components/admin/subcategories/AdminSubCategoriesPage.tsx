import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/contexts/AuthContext';
import SubCategoryForm from './SubCategoryForm';
import SubCategoriesList from './SubCategoriesList';
import AlertMessage from '../shared/AlertMessage';
import { useSubCategories } from '@/hooks/useSubCategories';
import { QuestionCategory } from './types';

const AdminSubCategoriesPage: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const {
        categories,
        subCategories,
        loading,
        error,
        success,
        selectedSubCategories,
        bulkSubCategories,
        bulkSelectedCategories,
        deletingSubCategories,
        handleCreateBulk,
        handleDelete,
        setBulkSubCategories,
        toggleBulkCategory,
        toggleSubCategory,
        selectAllSubCategories,
        deselectAllSubCategories
    } = useSubCategories();

    React.useEffect(() => {
        if (user && !user.isAdmin) {
            router.push('/');
        }
    }, [user, router]);

    if (!user?.isAdmin) {
        return null;
    }

    // Group categories by subject for better organization
    const categoriesBySubject: Record<string, QuestionCategory[]> = {};
    categories.forEach(category => {
        const subjectName = category.subject?.name || 'Unknown';
        if (!categoriesBySubject[subjectName]) {
            categoriesBySubject[subjectName] = [];
        }
        categoriesBySubject[subjectName].push(category);
    });

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Subcategories</h1>

                {error && <AlertMessage type="error" message={error} />}
                {success && <AlertMessage type="success" message={success} />}

                {/* Create Bulk Subcategories */}
                <SubCategoryForm
                    bulkSubCategories={bulkSubCategories}
                    setBulkSubCategories={setBulkSubCategories}
                    bulkSelectedCategories={bulkSelectedCategories}
                    toggleBulkCategory={toggleBulkCategory}
                    categoriesBySubject={categoriesBySubject}
                    handleCreateBulk={handleCreateBulk}
                    loading={loading}
                />

                {/* Subcategories List */}
                <SubCategoriesList
                    subCategories={subCategories}
                    selectedSubCategories={selectedSubCategories}
                    toggleSubCategory={toggleSubCategory}
                    selectAllSubCategories={selectAllSubCategories}
                    deselectAllSubCategories={deselectAllSubCategories}
                    handleDelete={handleDelete}
                    deletingSubCategories={deletingSubCategories}
                />
            </div>
        </div>
    );
};

export default AdminSubCategoriesPage; 