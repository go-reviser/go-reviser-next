import { NextApiRequest, NextApiResponse } from 'next';
import { QuestionCategory } from '@/models/QuestionCategory';
import { withAuth } from '@/lib/authMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import { ISubject } from '@/models/Subject';
import Subject from '@/models/Subject';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { subjectId, subjectName, subjectUuid } = req.body;

        if (!subjectId && !subjectName && !subjectUuid)
            return res.status(400).json({ message: 'Either subjectId or subjectName or subjectUuid is required' });

        if (subjectId && subjectName && subjectUuid)
            return res.status(400).json({ message: 'Provide either subjectId or subjectName or subjectUuid, not both' });

        const subject = await Subject.findOne({
            $or: [
                { subjectId: subjectId },
                { name: subjectName },
                { _id: subjectUuid }
            ]
        });

        if (!subject)
            return res.status(404).json({ message: 'Subject not found' });

        const categories = await QuestionCategory.find({
            subject: subject._id
        })
            .populate<{ subject: ISubject }>('subject')
            .sort({ createdAt: -1 });

        if (!categories)
            return res.status(404).json({ message: 'No question categories found' });

        return res.status(200).json({
            message: 'Question categories retrieved successfully',
            categories: categories.map(category => ({
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