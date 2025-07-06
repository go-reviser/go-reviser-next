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

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST')
        return res.status(405).json({ message: 'Method not allowed' });

    try {
        await connectToDatabase();

        const { questionData, examBranchNames } = req.body as { questionData: QuestionData, examBranchNames: string[] };
        const { title, content, category, link } = questionData;

        // Validate required fields
        if (!title || !content || !category || !examBranchNames)
            return res.status(400).json({
                message: 'Missing required fields: title, content, category, or examBranches',
                link
            });

        if (await Question.findOne({ link }))
            return res.status(400).json({
                message: 'Question with this link already exists',
                link
            });

        const examBranches = await ExamBranches.find({ name: { $in: examBranchNames } });

        if (examBranches.length === 0 || examBranches.length !== examBranchNames.length)
            return res.status(400).json({
                message: 'Exam branches not found',
                invalidExamBranches: examBranchNames.filter(branch => !examBranches.some(b => b.name === branch)),
                link
            });

        // Process question data using bulk functions
        const { processedQuestions, errors, inActiveTagsErrors } = await processBulkQuestions([questionData], examBranches);

        // Handle validation errors
        if (errors.length > 0)
            return res.status(400).json({
                message: errors[0],
                link
            });

        if (inActiveTagsErrors.length > 0)
            return res.status(400).json({
                message: `Inactive tags ${inActiveTagsErrors[0].inActiveTags.join(', ')}`,
                link
            });

        if (processedQuestions.length === 0)
            return res.status(400).json({
                message: 'Failed to process question data',
                link
            });

        // Create question using bulk function
        const newQuestions = await createBulkQuestions(processedQuestions);

        if (newQuestions.length === 0)
            return res.status(500).json({
                message: 'Failed to create question',
                link
            });

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