import { NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { AuthenticatedRequest, withAuth } from '@/lib/authMiddleware';
import UserQuestionProgress from '@/models/UserQuestionProgress';
import User from '@/models/User';
import Question from '@/models/Question';

/**
 * API handler for getting user question progress
 *
 * @param {AuthenticatedRequest} req - The incoming request object
 * @param {NextApiResponse} res - The response object
 *
 * @route POST /api/user-question-progress/get
 * @description Get a user's progress for a specific question by userId and questionNumber
 * @param {Object} req.body
 * @param {string} req.body.questionNumber - The question number to get progress for
 * @returns {Object} 200 - Success response with progress data
 * @returns {Object} 400 - Bad request (missing required fields)
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 404 - User, question, or progress not found
 * @returns {Object} 500 - Server error
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({
            success: false,
            message: `Method ${req.method} Not Allowed`
        });
    }

    try {
        await connectToDatabase();

        const { questionNumber } = req.body;

        // Find the user
        const user = await User.findOne({ userId: req.user?.userId });

        // Find the question by questionNumber
        const question = await Question.findOne({ questionNumber });
        if (!question)
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });

        // Find the progress entry with only the necessary fields
        const progress = await UserQuestionProgress.findOne({
            user: user._id,
            question: question._id
        })
            .select('timeSpent isCompleted toRevise remarks attemptedAt')
            .lean();

        if (!progress)
            return res.status(404).json({
                success: false,
                message: 'No progress found for this question',
                data: {
                    exists: false,
                    userId: req.user?.userId,
                    questionNumber
                }
            });

        return res.status(200).json({
            success: true,
            data: {
                ...progress,
                exists: true,
                questionNumber
            }
        });
    } catch (error) {
        console.error('Error fetching user question progress:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching user question progress'
        });
    }
}

export default withAuth(handler); 