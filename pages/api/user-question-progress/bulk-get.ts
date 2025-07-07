import { NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { AuthenticatedRequest, withAuth } from '@/lib/authMiddleware';
import UserQuestionProgress from '@/models/UserQuestionProgress';
import User from '@/models/User';
import Question from '@/models/Question';

/**
 * API handler for bulk getting user question progress
 *
 * @param {AuthenticatedRequest} req - The incoming request object
 * @param {NextApiResponse} res - The response object
 *
 * @route POST /api/user-question-progress/bulk-get
 * @description Get a user's progress for multiple questions by userId and questionNumbers
 * @param {Object} req.body
 * @param {number[]} req.body.questionNumbers - Array of question numbers to get progress for
 * @returns {Object} 200 - Success response with progress data for each question
 * @returns {Object} 400 - Bad request (missing required fields)
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 404 - User not found
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

        const { questionNumbers } = req.body;

        // Validate required fields
        if (!questionNumbers || !Array.isArray(questionNumbers) || questionNumbers.length === 0)
            return res.status(400).json({
                success: false,
                message: 'an array of questionNumbers are required'
            });

        // Find the user
        const user = await User.findOne({ userId: req.user?.userId });

        // Find all questions by their questionNumbers with only the necessary fields
        const questions = await Question.find({
            questionNumber: { $in: questionNumbers }
        })
            .select('_id questionNumber')
            .lean();

        // Create a map of questionNumber to question._id for easier lookup
        const questionIdMap = new Map();
        questions.forEach(question => {
            questionIdMap.set(question.questionNumber, question._id);
        });

        // Find all progress entries for the user and these questions with only the necessary fields
        const progressEntries = await UserQuestionProgress.find({
            userId: user._id,
            questionId: { $in: Array.from(questionIdMap.values()) }
        })
            .select('question timeSpent isCompleted toRevise remarks attemptedAt')
            .lean();

        // Create a map of questionId to progress for easier lookup
        const progressMap = new Map();
        progressEntries.forEach(progress => {
            progressMap.set(progress.question.toString(), progress);
        });

        // Prepare the response with progress for each requested question
        const results = questionNumbers.map(questionNumber => {
            const questionObjectId = questionIdMap.get(questionNumber);

            if (!questionObjectId) {
                return {
                    questionNumber,
                    exists: false,
                    message: 'Question not found'
                };
            }

            const progress = progressMap.get(questionObjectId.toString());

            if (progress) {
                return {
                    questionNumber,
                    exists: true,
                    progress: {
                        ...progress,
                        questionNumber
                    }
                };
            } else {
                return {
                    questionNumber,
                    exists: false,
                    message: 'No progress found for this question'
                };
            }
        });

        return res.status(200).json({
            success: true,
            data: results
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