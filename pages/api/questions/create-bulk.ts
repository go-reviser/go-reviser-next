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

interface SuccessResult {
    questionId: string;
    questionNumber: number;
    title: string;
    answer: string | string[] | { min: number; max: number } | undefined;
    link?: string;
}

interface ErrorResult {
    error: string;
    link?: string;
}

// Configure API route to accept larger requests
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { questions } = req.body;

        if (!questions || typeof questions !== 'object' || Object.keys(questions).length === 0) {
            return res.status(400).json({
                message: 'Questions must be provided as a non-empty object'
            });
        }

        const results = {
            success: [] as SuccessResult[],
            errors: [] as ErrorResult[],
            alreadyExists: [] as ErrorResult[]
        };

        // Convert object of questions to array for bulk processing
        const questionsArray: QuestionData[] = [];

        // First check for duplicate links
        for (const key in questions) {
            const questionData = questions[key];
            const { link } = questionData as QuestionData;

            if (link && await Question.findOne({ link })) {
                results.alreadyExists.push({
                    error: 'Question with this link already exists',
                    link
                });
            } else {
                questionsArray.push(questionData as QuestionData);
            }
        }

        // Process questions in bulk
        const { processedQuestions, errors } = await processBulkQuestions(questionsArray);

        // Add any errors to the results
        results.errors.push(...errors);

        // Create questions in bulk
        if (processedQuestions.length > 0) {
            const newQuestions = await createBulkQuestions(processedQuestions);

            // Add successful questions to results
            for (const question of newQuestions) {
                results.success.push({
                    questionId: question.questionId as string,
                    questionNumber: question.questionNumber as number,
                    title: question.title as string,
                    answer: (question.correctAnswer || question.correctAnswers || question.numericalAnswerRange) as string | string[] | { min: number; max: number } | undefined,
                    link: question.link as string | undefined
                });
            }
        }

        return res.status(201).json({
            message: 'Questions processing completed',
            summary: {
                total: Object.keys(questions).length,
                successful: results.success.length,
                failed: results.errors.length,
                alreadyExists: results.alreadyExists.length
            },
            results
        });

    } catch (error: unknown) {
        console.error('Error creating questions:', error);
        return res.status(500).json({
            message: 'Error creating questions',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(isAdmin(handler)); 