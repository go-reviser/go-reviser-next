import { NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { AuthenticatedRequest, withAuth } from '@/lib/authMiddleware';
import UserQuestionProgress from '@/models/UserQuestionProgress';
import User from '@/models/User';
import Question from '@/models/Question';

// Define the category summary interface
interface CategorySummary {
    categoryId: string;
    categoryName: string;
    totalQuestions: number;
    completed: number;
    toRevise: number;
}

/**
 * API handler for fetching a user's question progress summary by category.
 *
 * @param {AuthenticatedRequest} req - The incoming request object.
 * @param {NextApiResponse} res - The response object.
 *
 * @route POST /api/user-question-progress/summary
 * @description Retrieves a summary of the user's question progress by category, including total questions,
 *              completed questions, questions marked for revision, and completion percentage.
 *
 * @param {Object} req.body
 * @param {string} req.body.userId - The ID of the user whose progress summary is to be fetched.
 *
 * @returns {Object} 200 - Success response with the progress summary by category.
 * @property {Object} data - The summary data.
 * @property {number} data.totalQuestions - Total number of questions available.
 * @property {number} data.totalCompleted - Total number of questions completed by the user.
 * @property {number} data.totalToRevise - Total number of questions marked for revision by the user.
 * @property {string} data.overallCompletionPercentage - Overall percentage of questions completed.
 * @property {Array} data.categorySummaries - Array of category-wise summaries.
 * @property {string} data.categorySummaries[].categoryId - ID of the category.
 * @property {string} data.categorySummaries[].categoryName - Name of the category.
 * @property {number} data.categorySummaries[].totalQuestions - Total questions in this category.
 * @property {number} data.categorySummaries[].completed - Completed questions in this category.
 * @property {number} data.categorySummaries[].toRevise - Questions marked for revision in this category.
 * @property {string} data.categorySummaries[].completionPercentage - Percentage of questions completed in this category.
 *
 * @returns {Object} 400 - If `userId` is not provided in the body.
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
        const user = await User.findOne({ userId: req.user?.userId });
        if (!user)
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });

        // Get all questions with only the necessary category info
        const questions = await Question.find()
            .select('_id questionCategory questionCategoryName')
            .lean();

        // Create a map of question._id to questionCategory
        const questionCategoryMap = new Map<string, { categoryId: string, categoryName: string }>();
        questions.forEach(question => {
            questionCategoryMap.set(question._id.toString(), {
                categoryId: question.questionCategory.toString(),
                categoryName: question.questionCategoryName
            });
        });

        // Get all progress entries for this user with only the necessary fields
        const progressEntries = await UserQuestionProgress.find({
            user: user._id
        }).select('question isCompleted toRevise').lean();

        // Count questions by category
        const questionsByCategory: Record<string, CategorySummary> = questions.reduce((acc: Record<string, CategorySummary>, question) => {
            const categoryId = question.questionCategory.toString();
            if (!acc[categoryId]) {
                acc[categoryId] = {
                    categoryId,
                    categoryName: question.questionCategoryName,
                    totalQuestions: 0,
                    completed: 0,
                    toRevise: 0
                };
            }
            acc[categoryId].totalQuestions++;
            return acc;
        }, {});

        // Count completed and toRevise questions by category
        progressEntries.forEach(progress => {
            const questionObjectId = progress.question.toString();
            const categoryInfo = questionCategoryMap.get(questionObjectId);

            if (categoryInfo) {
                const { categoryId } = categoryInfo;
                if (questionsByCategory[categoryId]) {
                    if (progress.isCompleted)
                        questionsByCategory[categoryId].completed++;
                    if (progress.toRevise)
                        questionsByCategory[categoryId].toRevise++;
                }
            }
        });

        // Calculate completion percentages and prepare the final summary
        const totalQuestions = questions.length;
        let totalCompleted = 0;
        let totalToRevise = 0;

        interface CategorySummaryWithPercentage extends CategorySummary {
            completionPercentage: string;
        }

        const categorySummaries: CategorySummaryWithPercentage[] = Object.values(questionsByCategory).map((category: CategorySummary) => {
            const { categoryId, categoryName, totalQuestions, completed, toRevise } = category;
            const completionPercentage = totalQuestions > 0
                ? ((completed / totalQuestions) * 100).toFixed(2)
                : '0.00';

            totalCompleted += completed;
            totalToRevise += toRevise;

            return {
                categoryId,
                categoryName,
                totalQuestions,
                completed,
                toRevise,
                completionPercentage
            };
        });

        const overallCompletionPercentage = totalQuestions > 0
            ? ((totalCompleted / totalQuestions) * 100).toFixed(2)
            : '0.00';

        // Prepare the final summary
        const summary = {
            totalQuestions,
            totalCompleted,
            totalToRevise,
            overallCompletionPercentage,
            categorySummaries
        };

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error generating question progress summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating question progress summary'
        });
    }
}

export default withAuth(handler); 