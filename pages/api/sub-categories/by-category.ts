import { NextApiRequest, NextApiResponse } from 'next';
import { SubCategory } from '@/models/SubCategory';
import { QuestionCategory } from '@/models/QuestionCategory';
import { withAuth } from '@/lib/authMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import { IQuestionCategory } from '@/models/QuestionCategory';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { categoryName } = req.query;

        if (!categoryName) {
            return res.status(400).json({ message: 'Question category name is required' });
        }

        // Find the question category by name
        const category = await QuestionCategory.findOne({ name: categoryName });

        if (!category) {
            return res.status(404).json({ message: `Question category with name "${categoryName}" not found` });
        }

        // Find all subcategories that contain this category
        const subCategories = await SubCategory.find({
            questionCategories: category._id
        }).populate<{ questionCategories: IQuestionCategory[] }>('questionCategories');

        return res.status(200).json({
            message: 'Subcategories retrieved successfully',
            subCategories: subCategories.map(subCategory => ({
                id: subCategory.subCategoryId,
                name: subCategory.name,
                questionCategories: subCategory.questionCategories.map(qc => ({
                    id: qc.questionCategoryId,
                    name: qc.name
                }))
            }))
        });

    } catch (error: unknown) {
        console.error('Error retrieving subcategories by category:', error);
        return res.status(500).json({
            message: 'Error retrieving subcategories by category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(handler); 