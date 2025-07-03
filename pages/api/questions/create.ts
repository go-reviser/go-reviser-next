import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';
import { processBulkQuestions, createBulkQuestions } from '@/lib/questionUtils';
import Question from '@/models/Question';

interface QuestionData {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    answer?: string | string[] | number;
    link?: string;
    isActive?: boolean;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const questionData = req.body as QuestionData;
        const { title, content, category, link, } = questionData;

        // Validate required fields
        if (!title || !content || !category) {
            return res.status(400).json({
                message: 'Missing required fields: title, content, or category',
                link
            });
        }

        if (await Question.findOne({ link })) {
            return res.status(400).json({
                message: 'Question with this link already exists',
                link
            });
        }

        // Process question data using bulk functions
        const { processedQuestions, errors } = await processBulkQuestions([questionData]);

        // Handle validation errors
        if (errors.length > 0) {
            return res.status(400).json({
                message: errors[0].error,
                link
            });
        }

        if (processedQuestions.length === 0) {
            return res.status(400).json({
                message: 'Failed to process question data',
                link
            });
        }

        // Create question using bulk function
        const newQuestions = await createBulkQuestions(processedQuestions);

        if (newQuestions.length === 0) {
            return res.status(500).json({
                message: 'Failed to create question',
                link
            });
        }

        const newQuestion = newQuestions[0];

        return res.status(201).json({
            message: 'Question created successfully',
            data: {
                questionId: newQuestion.questionId,
                questionNumber: newQuestion.questionNumber,
                title: newQuestion.title,
                content: newQuestion.content,
                category: category,
                tags: questionData.tags || [],
                link,
                answer: newQuestion.correctAnswer || newQuestion.correctAnswers || newQuestion.numericalAnswerRange
            }
        });

    } catch (error: unknown) {
        console.error('Error creating question:', error);
        return res.status(500).json({
            message: 'Error creating question',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(isAdmin(handler)); 