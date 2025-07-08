import { NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { AuthenticatedRequest, withAuth } from '@/lib/authMiddleware';
import UserQuestionProgress, { IUserQuestionProgress } from '@/models/UserQuestionProgress';
import User from '@/models/User';

/**
 * API handler for fetching all user question progress entries
 *
 * @param {AuthenticatedRequest} req - The incoming request object
 * @param {NextApiResponse} res - The response object
 *
 * @route GET /api/user-question-progress/get-all
 * @description Get all question progress entries for the authenticated user
 * @returns {Object} 200 - Success response with progress data
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 404 - User not found
 * @returns {Object} 500 - Server error
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
            success: false,
            message: `Method ${req.method} Not Allowed`
        });
    }

    try {
        await connectToDatabase();

        // Find user by userId
        const user = await User.findOne({ userId: req.user?.userId });
        if (!user)
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });

        let progressEntries: IUserQuestionProgress[] = [];
        let total: number = 0;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Optional: Add pagination if needed
        if (req.query.page && req.query.limit) {
            progressEntries = await UserQuestionProgress.find({ user: user._id })
                .select('question timeSpent isCompleted toRevise remarks attemptedAt updatedAt')
                .populate('question', 'questionNumber questionId')
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            total = await UserQuestionProgress.countDocuments({ user: user._id });
        } else {
            // Get all question progress for the user with only the necessary fields
            progressEntries = await UserQuestionProgress.find({ user: user._id })
                .select('question timeSpent isCompleted toRevise remarks')
                .populate('question', 'questionNumber questionId')
                .sort({ updatedAt: -1 })
                .lean();
        }

        return res.status(200).json({
            success: true,
            data: progressEntries,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
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