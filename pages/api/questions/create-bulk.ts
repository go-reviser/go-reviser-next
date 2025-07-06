import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';
import { processBulkQuestions, createBulkQuestions } from '@/lib/questionUtils';
import Question from '@/models/Question';
import ExamBranches from '@/models/ExamBranches';

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

interface AlreadyExistsResult {
    alreadyExists: string;
    link?: string;
}

interface InActiveTagsResult {
    inActiveTags: string[];
    link?: string;
}

interface ErrorResult {
    error?: string;
    yearError?: string;
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

        const { questions, examBranchNames } = req.body;

        if (!questions || typeof questions !== 'object' || Object.keys(questions).length === 0 || !examBranchNames) {
            return res.status(400).json({
                message: 'Questions must be provided as a non-empty object and examBranchNames must be provided.'
            });
        }

        const examBranches = await ExamBranches.find({ name: { $in: examBranchNames } });

        if (examBranches.length === 0 || examBranches.length !== examBranchNames.length) {
            return res.status(400).json({
                message: 'Exam branches not found'
            });
        }

        const results = {
            success: [] as SuccessResult[],
            errors: [] as ErrorResult[],
            alreadyExists: [] as AlreadyExistsResult[],
            inActiveTagsResults: [] as InActiveTagsResult[]
        };

        // Convert object of questions to array for bulk processing
        const questionsArray: QuestionData[] = [];

        const questionEntries = Object.entries(questions);
        const links = questionEntries
            .map(([, q]) => (q as QuestionData).link)
            .filter(link => !!link);

        const existingQuestions = await Question.find({ link: { $in: links } }).select('link');
        const existingLinks = new Set(existingQuestions.map(q => q.link));

        // Separate existing and new questions
        for (const [, q] of questionEntries) {
            const questionData = q as QuestionData;
            const { link } = questionData;

            if (link && existingLinks.has(link)) {
                results.alreadyExists.push({
                    alreadyExists: 'Question with this link already exists',
                    link
                });
            } else {
                questionsArray.push(questionData);
            }
        }

        console.log("Going to process questions in bulk");

        // Process questions in bulk
        const { processedQuestions, errors, inActiveTagsErrors } = await processBulkQuestions(questionsArray, examBranches);

        // Add any errors to the results
        results.errors.push(...errors);
        results.inActiveTagsResults.push(...inActiveTagsErrors);
        console.log("Errors in bulk processing");

        // Create questions in bulk
        if (processedQuestions.length > 0) {
            const newQuestions = await createBulkQuestions(processedQuestions);

            console.log("Created questions in bulk");

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

        console.log("Questions processing completed");

        return res.status(201).json({
            message: 'Questions processing completed',
            summary: {
                total: Object.keys(questions).length,
                successful: results.success.length,
                failed: results.errors.length,
                alreadyExists: results.alreadyExists.length,
                inActiveTags: results.inActiveTagsResults.length
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