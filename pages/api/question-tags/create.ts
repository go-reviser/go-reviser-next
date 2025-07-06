import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import QuestionTag from '@/models/QuestionTag';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST')
        return res.status(405).json({ message: 'Method not allowed' });

    try {
        await connectToDatabase();

        const { name, isActive = true } = req.body;

        // Validate required fields
        if (!name)
            return res.status(400).json({ message: 'Name is required' });

        // Check if tag already exists
        if (await QuestionTag.findOne({ name }))
            return res.status(400).json({ message: 'Question tag already exists' });

        // Create new question tag
        const newQuestionTag = new QuestionTag({
            name,
            questions: [],
            isActive
        });

        await newQuestionTag.save();

        return res.status(201).json({
            message: 'Question tag created successfully',
            questionTag: {
                id: newQuestionTag.questionTagId,
                name: newQuestionTag.name,
                isActive: newQuestionTag.isActive
            }
        });

    } catch (error: unknown) {
        console.error('Error creating question tag:', error);
        return res.status(500).json({
            message: 'Error creating question tag',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Apply both authentication middlewares
export default withAuth(isAdmin(handler)); 