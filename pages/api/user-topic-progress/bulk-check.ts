import { NextApiResponse } from 'next';
import UserTopicProgress from '@/models/UserTopicProgress';
import { connectToDatabase } from '@/lib/mongodb';
import { AuthenticatedRequest } from '@/lib/isAdminMiddleware';
import { withAuth } from '@/lib/authMiddleware';
import User from '@/models/User';
import Topic from '@/models/Topic';

/**
 * API handler for bulk checking user topic progress
 * 
 * @param {NextApiRequest} req - The incoming request object
 * @param {NextApiResponse} res - The response object
 * 
 * @route POST /api/user-topic-progress/bulk-check
 * @description Check progress status for multiple topics for a user
 * 
 * @param {Object} req.body
 * @param {string} req.body.userId - The ID of the user
 * @param {string[]} req.body.topicIds - Array of topic IDs to check progress for
 * 
 * @returns {Object} 200 - Success response with progress data
 * @returns {Object} 400 - Invalid request (missing userId or topicIds)
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 405 - Method not allowed (only POST is supported)
 * @returns {Object} 500 - Server error
 * 
 * @example
 * // Request body
 * {
 *   "userId": "user123",
 *   "topicIds": ["topic1", "topic2", "topic3"]
 * }
 * 
 * @example
 * // Success response
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "topicId": "topic1",
 *       "exists": true,
 *       "isCompleted": true,
 *       "toRevise": false
 *     },
 *     {
 *       "topicId": "topic2",
 *       "exists": false,
 *       "isCompleted": false,
 *       "toRevise": false
 *     }
 *   ]
 * }
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    await connectToDatabase();

    // Only allow POST requests for bulk checks
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({
            success: false,
            message: `Method ${req.method} Not Allowed`
        });
    }

    try {
        const { userId, topicIds } = req.body;

        if (userId != req.user?.userId)
            return res.status(401).json({ message: 'Unauthorized' });

        if (!topicIds || !Array.isArray(topicIds) || topicIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'An array of topicIds are required'
            });
        }

        const user = await User.findOne({ userId: userId }).select('_id');
        const topics = await Topic.find({ topicId: { $in: topicIds } }).select('_id');

        // Find all progress entries for the user and specified topics
        const progressEntries = await UserTopicProgress.find({
            user: user._id,
            topic: { $in: topics.map(topic => topic._id) }
        });

        // Create a map for quick lookups
        const progressMap: Record<string, {
            isCompleted: boolean;
            toRevise: boolean;
        }> = {};
        progressEntries.forEach(entry => {
            progressMap[entry.topic.toString()] = {
                isCompleted: entry.isCompleted,
                toRevise: entry.toRevise
            };
        });

        // Prepare the response with isCompleted for each requested topic
        const results = topicIds.map(topicId => {
            if (progressMap[topicId.toString()]) {
                return {
                    topicId,
                    exists: true,
                    ...progressMap[topicId.toString()]
                };
            } else {
                return {
                    topicId,
                    exists: false,
                    isCompleted: false,
                    toRevise: false,
                };
            }
        });

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error checking bulk progress completion:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking bulk progress completion'
        });
    }
}

export default withAuth(handler);