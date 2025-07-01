import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminSubCategoriesPage from '@/components/admin/subcategories/AdminSubCategoriesPage';

const SubCategoriesPage: React.FC = () => {
    return (
        <ProtectedRoute>
            <AdminSubCategoriesPage />
        </ProtectedRoute>
    );
};

export default SubCategoriesPage;