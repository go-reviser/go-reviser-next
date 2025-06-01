import { NextApiResponse } from 'next';
import UserTopicProgress from '@/models/UserTopicProgress';
import { connectToDatabase } from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { AuthenticatedRequest, withAuth } from '@/lib/authMiddleware';

/**
 * API handler for fetching a user's topic progress summary.
 *
 * @param {NextApiRequest} req - The incoming request object.
 * @param {NextApiResponse} res - The response object.
 *
 * @route GET /api/user-topic-progress/summary
 * @description Retrieves a summary of the user's progress, including total topics,
 *              completed topics, topics marked for revision, and completion percentage.
 *
 * @query {string} userId - The ID of the user whose progress summary is to be fetched.
 *
 * @returns {Object} 200 - Success response with the progress summary.
 * @property {Object} data - The summary data.
 * @property {number} data.totalTopics - Total number of topics available.
 * @property {number} data.toRevise - Number of topics marked for revision by the user.
 * @property {number} data.completed - Number of topics completed by the user.
 * @property {string} data.completionPercentage - Percentage of topics completed, formatted to two decimal places.
 *
 * @returns {Object} 400 - If `userId` is not provided in the query.
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 405 - If the request method is not GET.
 * @returns {Object} 500 - If an error occurs while generating the summary.
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    await connectToDatabase();

    // Only allow GET requests for summary
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
            success: false,
            message: `Method ${req.method} Not Allowed`
        });
    }

    try {
        const { userId } = req.query;

        if (userId != req.user?.userId)
            return res.status(401).json({ message: 'Unauthorized' });

        // Get total count of topics for this user
        const totalTopicsCount: number = await Topic.countDocuments();

        // Get count by isCompleted
        const isCompletedCount: number = await UserTopicProgress.countDocuments({
            userId: userId as string,
            isCompleted: true
        });

        // Get count of topics marked for revision
        const toReviseCount: number = await UserTopicProgress.countDocuments({
            userId: userId as string,
            toRevise: true
        });

        const completionPercentage = ((isCompletedCount / totalTopicsCount) * 100).toFixed(2);

        // Prepare summary
        const summary = {
            totalTopics: totalTopicsCount,
            toRevise: toReviseCount,
            completed: isCompletedCount,
            completionPercentage,
        };

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error generating progress summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating progress summary'
        });
    }
}

export default withAuth(handler);