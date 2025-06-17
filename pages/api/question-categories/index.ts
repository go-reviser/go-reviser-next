import { NextApiRequest, NextApiResponse } from 'next';
import { QuestionCategory } from '@/models/QuestionCategory';
import { withAuth } from '@/lib/authMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import { ISubject } from '@/models/Subject';
import '@/models/Subject';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const categories = await QuestionCategory.find()
            .populate<{ subject: ISubject }>('subject')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Question categories retrieved successfully',
            data: categories.map(category => ({
                questionCategoryId: category.questionCategoryId,
                name: category.name,
                subject: {
                    subjectId: category.subject.subjectId,
                    name: category.subject.name
                },
                createdAt: category.createdAt,
                updatedAt: category.updatedAt
            }))
        });

    } catch (error: unknown) {
        console.error('Error retrieving question categories:', error);
        return res.status(500).json({
            message: 'Error retrieving question categories',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(handler);