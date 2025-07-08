import { NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { AuthenticatedRequest, withAuth } from '@/lib/authMiddleware';
import UserQuestionProgress from '@/models/UserQuestionProgress';
import User from '@/models/User';
import Question from '@/models/Question';
import mongoose from 'mongoose';

/**
 * API handler for managing user question progress
 *
 * @param {AuthenticatedRequest} req - The incoming request object
 * @param {NextApiResponse} res - The response object
 *
 * @route GET /api/user-question-progress
 * @description Get all question progress entries for the authenticated user
 * @returns {Object} 200 - Success response with progress data
 * @returns {Object} 500 - Server error
 *
 * @route POST /api/user-question-progress
 * @description Create or update user's progress for a specific question
 * @param {Object} req.body
 * @param {string} req.body.questionId - The ID of the question
 * @param {number} req.body.timeSpent - Time spent on the question in seconds
 * @param {boolean} [req.body.isCompleted=true] - Whether the question is completed
 * @param {boolean} [req.body.toRevise=false] - Whether the question needs revision
 * @param {string} [req.body.remarks=''] - Any remarks for the question
 * @returns {Object} 200 - Success response with created/updated progress
 * @returns {Object} 400 - Bad request (missing required fields)
 * @returns {Object} 404 - Question not found
 * @returns {Object} 500 - Server error
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    try {
        await connectToDatabase();

        const { method } = req;

        // Find user by userId
        const user = await User.findOne({ userId: req.user?.userId });

        switch (method) {
            case 'GET':
                try {
                    // Get all question progress for the user with only the necessary fields
                    const progressEntries = await UserQuestionProgress.find({ user: user._id })
                        .select('question timeSpent isCompleted toRevise remarks attemptedAt updatedAt')
                        .populate('question', 'questionNumber questionId')
                        .sort({ updatedAt: -1 });

                    return res.status(200).json({
                        success: true,
                        data: progressEntries
                    });
                } catch (error) {
                    console.error('Error fetching user question progress:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Error fetching user question progress'
                    });
                }

            case 'PUT':
                try {
                    const { questionNumber, timeSpent = 0, isCompleted = true, toRevise = false, remarks = '' } = req.body;

                    // Validate required fields
                    if (!questionNumber) {
                        return res.status(400).json({
                            success: false,
                            message: 'questionNumber is required'
                        });
                    }

                    // Validate timeSpent is a positive number
                    if (typeof timeSpent !== 'number' || timeSpent < 0) {
                        return res.status(400).json({
                            success: false,
                            message: 'timeSpent must be a positive number'
                        });
                    }

                    // Find the question with only the necessary fields
                    const question = await Question.findOne({ questionNumber })
                        .select('_id')
                        .lean();
                    if (!question) {
                        return res.status(404).json({
                            success: false,
                            message: 'Question not found'
                        });
                    }

                    // Create or update the progress entry with only necessary fields in response
                    const updatedProgress = await UserQuestionProgress.findOneAndUpdate(
                        {
                            user: user._id,
                            question: question._id
                        },
                        {
                            $set: {
                                timeSpent,
                                isCompleted,
                                toRevise,
                                remarks,
                                attemptedAt: new Date()
                            }
                        },
                        { new: true, upsert: true, runValidators: true }
                    )
                        .select('timeSpent isCompleted toRevise remarks attemptedAt')
                        .lean();

                    return res.status(200).json({
                        success: true,
                        message: 'Question progress updated successfully',
                        data: updatedProgress
                    });
                } catch (error) {
                    console.error('Error updating user question progress:', error);

                    // Handle duplicate key error specifically
                    if (error instanceof mongoose.Error.ValidationError) {
                        return res.status(400).json({
                            success: false,
                            message: 'Validation error',
                            errors: error.errors
                        });
                    }

                    return res.status(500).json({
                        success: false,
                        message: 'Error updating user question progress'
                    });
                }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).json({
                    success: false,
                    message: `Method ${method} Not Allowed`
                });
        }
    } catch (error) {
        console.error('Error in user question progress handler:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export default withAuth(handler); 