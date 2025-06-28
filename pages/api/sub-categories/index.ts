import { NextApiRequest, NextApiResponse } from 'next';
import { SubCategory } from '@/models/SubCategory';
import { withAuth } from '@/lib/authMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import { IQuestionCategory } from '@/models/QuestionCategory';
import '@/models/QuestionCategory';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const subCategories = await SubCategory.find()
            .populate<{ questionCategories: IQuestionCategory[] }>('questionCategories');

        subCategories.sort((a, b) => {
            return a.name.localeCompare(b.name);
        });

        return res.status(200).json({
            message: 'Sub categories retrieved successfully',
            subCategories: subCategories.map(subCategory => ({
                id: subCategory.subCategoryId,
                name: subCategory.name,
                questionCategories: subCategory.questionCategories.map(category => ({
                    id: category.questionCategoryId,
                    name: category.name
                }))
            }))
        });

    } catch (error: unknown) {
        console.error('Error retrieving sub categories:', error);
        return res.status(500).json({
            message: 'Error retrieving sub categories',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(handler); 