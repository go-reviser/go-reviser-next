import { NextApiRequest, NextApiResponse } from 'next';
import { QuestionCategory } from '@/models/QuestionCategory';
import { connectToDatabase } from '@/lib/mongodb';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { categories } = req.body;

        if (!Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({
                message: 'Categories must be provided as a non-empty array'
            });
        }

        for (const category of categories) {
            if (!category.name && !category.id) {
                return res.status(400).json({
                    message: 'Each category must have a name or id',
                    invalidCategory: category
                });
            }
        }

        for (const category of categories) {
            if (category.id && category.name) {
                return res.status(400).json({ message: 'Both id and name cannot be provided. Provide only one.' });
            }
        }

        for (const category of categories) {
            if (!(await QuestionCategory.exists({
                $or: [
                    { questionCategoryId: category.id },
                    { name: category.name }
                ]
            }))) {
                return res.status(404).json({ message: 'Question category not found', category });
            }
        }


        await QuestionCategory.deleteMany({
            $or: [
                { questionCategoryId: { $in: categories.map(cat => cat.id) } },
                { name: { $in: categories.map(cat => cat.name) } }
            ]
        });


        return res.status(200).json({
            message: 'Question category deleted successfully',
            deletedCategories: categories.map(cat => cat.id || cat.name)
        });

    } catch (error: unknown) {
        console.error('Error deleting question category:', error);
        return res.status(500).json({
            message: 'Error deleting question category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(isAdmin(handler));