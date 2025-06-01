import { NextApiResponse } from 'next';
import UserTopicProgress from '@/models/UserTopicProgress';
import { connectToDatabase } from '@/lib/mongodb';
import { AuthenticatedRequest } from '@/lib/isAdminMiddleware';
import { withAuth } from '@/lib/authMiddleware';
import Topic from '@/models/Topic';

/**
 * API handler for managing user topic progress
 *
 * @param {NextApiRequest} req - The incoming request object
 * @param {NextApiResponse} res - The response object
 *
 * @route GET /api/user-topic-progress/[userId]/[topicId]
 * @description Get user's progress for a specific topic
 * @returns {Object} 200 - Success response with progress data
 * @returns {Object} 404 - Progress not found
 * @returns {Object} 500 - Server error
 *
 * @route PUT /api/user-topic-progress/[userId]/[topicId]
 * @description Update user's progress for a specific topic
 * @param {Object} req.body
 * @param {boolean} [req.body.isCompleted] - Whether the topic is completed
 * @param {boolean} [req.body.toRevise] - Whether the topic needs revision
 * @returns {Object} 200 - Success response with updated progress
 * @returns {Object} 500 - Server error
 *
 * @route DELETE /api/user-topic-progress/[userId]/[topicId]
 * @description Delete user's progress for a specific topic
 * @returns {Object} 200 - Success response
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 404 - Progress not found
 * @returns {Object} 500 - Server error
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    await connectToDatabase();

    const { method } = req;
    const { userId, topicId } = req.query;

    if (userId != req.user?.userId)
        return res.status(401).json({ message: 'Unauthorized' });

    // Validate params
    if (!userId || !topicId) {
        return res.status(400).json({
            success: false,
            message: 'userId and topicId are required'
        });
    }

    const topic = await Topic.findOne({ topicId })

    if (!topic)
        return res.status(404).json({ success: false, message: 'Required topic does not exists.' });

    switch (method) {
        case 'GET':
            try {
                // Find the specific user topic progress
                const progress = await UserTopicProgress.findOne({
                    userId: userId as string,
                    topicId: topicId as string
                }).lean();

                if (!progress) {
                    return res.status(404).json({
                        success: false,
                        message: 'User topic progress not found'
                    });
                }

                res.status(200).json({ success: true, data: progress });
            } catch (error) {
                console.error('Error fetching user topic progress:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching user topic progress'
                });
            }
            break;

        case 'PUT':
            try {
                const { isCompleted, toRevise } = req.body;

                // Find and update the user topic progress
                const updatedProgress = await UserTopicProgress.findOneAndUpdate(
                    {
                        userId: userId as string,
                        topicId: topicId as string
                    },
                    {
                        $set: {
                            isCompleted: toRevise || isCompleted,
                            toRevise: toRevise
                        }
                    },
                    { new: true, runValidators: true, upsert: true }
                ).lean();

                res.status(200).json({
                    success: true, data: { ...updatedProgress }
                });
            } catch (error) {
                console.error('Error updating user topic progress:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error updating user topic progress'
                });
            }
            break;

        case 'DELETE':
            try {
                // Find and delete the user topic progress
                const deletedProgress = await UserTopicProgress.findOneAndDelete({
                    userId: userId as string,
                    topicId: topicId as string
                });

                if (!deletedProgress) {
                    return res.status(404).json({
                        success: false,
                        message: 'User topic progress not found'
                    });
                }

                res.status(200).json({
                    success: true,
                    message: 'User topic progress deleted successfully'
                });
            } catch (error) {
                console.error('Error deleting user topic progress:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error deleting user topic progress'
                });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).json({
                success: false,
                message: `Method ${method} Not Allowed`
            });
    }
}

export default withAuth(handler);