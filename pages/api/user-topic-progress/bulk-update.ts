import { NextApiResponse } from 'next';
import { Error } from 'mongoose';
import UserTopicProgress from '@/models/UserTopicProgress';
import { connectToDatabase } from '@/lib/mongodb';
import { AuthenticatedRequest } from '@/lib/isAdminMiddleware';
import { withAuth } from '@/lib/authMiddleware';

/**
 * API handler for bulk updating user topic progress
 * 
 * @param {NextApiRequest} req - The incoming request object
 * @param {NextApiResponse} res - The response object
 * 
 * @route POST /api/user-topic-progress/bulk-update
 * @description Update progress status for multiple topics for a user in a single request
 * 
 * @param {Object} req.body
 * @param {string} req.body.userId - The ID of the user
 * @param {Array<Object>} req.body.updates - Array of update objects
 * @param {string} req.body.updates[].topicId - The ID of the topic to update
 * @param {boolean} [req.body.updates[].isCompleted] - Whether the topic is completed
 * @param {boolean} [req.body.updates[].toRevise] - Whether the topic needs revision
 * 
 * @returns {Object} 200 - Success response with update results
 * @returns {Object} 400 - Invalid request (missing required fields)
 * @returns {Object} 401 - Unauthorized
 * @returns {Object} 405 - Method not allowed (only POST is supported)
 * @returns {Object} 500 - Server error
 * 
 * @example
 * // Request body
 * {
 *   "userId": "user123",
 *   "updates": [
 *     {
 *       "topicId": "topic1",
 *       "isCompleted": true,
 *       "toRevise": false
 *     },
 *     {
 *       "topicId": "topic2",
 *       "isCompleted": false,
 *       "toRevise": true
 *     }
 *   ]
 * }
 * 
 * @example
 * // Success response
 * {
 *   "success": true,
 *   "message": "Every topic progress created and updated as per the requirement",
 *   "data": [
 *     {
 *       "updatedProgress": {
 *         "userId": "user123",
 *         "topicId": "topic1",
 *         "isCompleted": true,
 *         "toRevise": false
 *       }
 *     },
 *     {
 *       "updatedProgress": {
 *         "userId": "user123",
 *         "topicId": "topic2",
 *         "isCompleted": false,
 *         "toRevise": true
 *       }
 *     }
 *   ]
 * }
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    await connectToDatabase();

    // Only allow POST requests for bulk updates
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({
            success: false,
            message: `Method ${req.method} Not Allowed`
        });
    }

    try {
        const { userId, updates } = req.body;

        if (userId != req.user?.userId)
            return res.status(401).json({ message: 'Unauthorized' });

        if (!userId || !updates || !Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'userId and an array of updates with attributes topicId, isCompleted & toRevise are required'
            });
        }

        for (const update of updates) {
            const { topicId, isCompleted, toRevise } = update;

            if (!topicId)
                return res.status(400).json({ success: false, message: 'topicId is required for each update' });

            // Check if update fields are provided
            if (!isCompleted && !toRevise)
                return res.status(400).json({ success: false, message: 'At least one update field (isCompleted or toRevise) must be provided' });
        }

        // Array to store the results of each update operation
        const results = [];

        // Process each update in the array
        for (const update of updates) {
            const { topicId, isCompleted, toRevise } = update;

            try {
                // Find and update or create if not exists (upsert)
                const updatedProgress = await UserTopicProgress.findOneAndUpdate(
                    { userId, topicId },
                    {
                        $set: {
                            isCompleted: isCompleted || toRevise,
                            toRevise: toRevise
                        }
                    },
                    { new: true, upsert: true, runValidators: true }
                ).lean();

                results.push({ updatedProgress });
            } catch (error) {
                console.error(`Error updating topic progress for topicId ${topicId}:`, error);
                results.push({
                    topicId,
                    success: false,
                    message: `Error updating topic progress: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        }

        // Return overall success based on if any updates succeeded
        res.status(200).json({
            success: true,
            message: 'Every topic progress created and updated as per the requirement',
            data: results
        });
    } catch (error) {
        console.error('Error in bulk update:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing bulk update request'
        });
    }
}

export default withAuth(handler);