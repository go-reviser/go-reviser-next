import { NextApiRequest, NextApiResponse } from 'next';
import { Question } from '@/models/Question';
import { Subject } from '@/models/Subject';
import { QuestionCategory } from '@/models/QuestionCategory';
import { connectToDatabase } from '@/lib/mongodb';
import { withAuth } from '@/lib/authMiddleware';

// Helper function to handle errors
const handleError = (res: NextApiResponse, error: unknown, message: string) => {
    console.error(`Error ${message}:`, error);
    return res.status(500).json({
        message: `Error ${message}`,
        error: error instanceof Error ? error.message : 'Unknown error'
    });
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        // Check if the request is for categories with question counts for a specific subject
        if (req.query.categories === 'true' && req.query.subject) {
            const subjectName = req.query.subject.toString().split('-').join(' ');

            try {
                // Find categories for the subject with case-insensitive name matching
                const categoriesWithCounts = await QuestionCategory.aggregate([
                    // Join with subjects to filter by subject name case-insensitively
                    {
                        $lookup: {
                            from: 'subjects',
                            localField: 'subject',
                            foreignField: '_id',
                            as: 'subjectData'
                        }
                    },
                    // Filter by subject name (case-insensitive)
                    {
                        $match: {
                            'subjectData.name': { $regex: new RegExp(`^${subjectName}$`, 'i') }
                        }
                    },
                    // Lookup questions to count them
                    {
                        $lookup: {
                            from: 'questions',
                            localField: '_id',
                            foreignField: 'questionCategory',
                            as: 'questions'
                        }
                    },
                    // Project the fields we need
                    {
                        $project: {
                            _id: 0,
                            categoryId: '$questionCategoryId',
                            name: 1,
                            questionCount: { $size: '$questions' }
                        }
                    }
                ]);

                if (categoriesWithCounts.length === 0) {
                    // Check if the subject exists
                    const subject = await Subject.findOne({
                        name: { $regex: new RegExp(`^${subjectName}$`, 'i') }
                    });

                    if (!subject) {
                        return res.status(404).json({
                            message: `Subject '${subjectName}' not found`
                        });
                    }

                    // Subject exists but has no categories
                    return res.status(200).json({
                        message: `No categories found for subject '${subjectName}'`,
                        data: []
                    });
                }

                return res.status(200).json({
                    message: `Categories with question counts for subject '${subjectName}' retrieved successfully`,
                    data: categoriesWithCounts
                });
            } catch (error) {
                return handleError(res, error, 'fetching categories');
            }
        }

        // Check if the request is for subjects with question counts
        if (req.query.subjects === 'true') {
            // Use aggregation for better performance
            const subjectsWithCounts = await Subject.aggregate([
                // Lookup question categories for each subject
                {
                    $lookup: {
                        from: 'questioncategories',
                        localField: '_id',
                        foreignField: 'subject',
                        as: 'categories'
                    }
                },
                // Unwind the categories array
                {
                    $unwind: {
                        path: '$categories',
                        preserveNullAndEmptyArrays: true
                    }
                },
                // Lookup questions for each category
                {
                    $lookup: {
                        from: 'questions',
                        localField: 'categories._id',
                        foreignField: 'questionCategory',
                        as: 'questions'
                    }
                },
                // Group by subject to count questions
                {
                    $group: {
                        _id: '$_id',
                        subjectId: { $first: '$subjectId' },
                        name: { $first: '$name' },
                        questionCount: { $sum: { $size: '$questions' } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        subjectId: 1,
                        name: 1,
                        questionCount: 1
                    }
                }
            ]);

            return res.status(200).json({
                message: 'Subjects with question counts retrieved successfully',
                data: subjectsWithCounts
            });
        }

        // Get questions with pagination
        const { limit = 10, page = 1, search } = req.query;
        const pageNum = parseInt(page.toString(), 10);
        const limitNum = parseInt(limit.toString(), 10);
        const skip = (pageNum - 1) * limitNum;

        // Build query
        const query: Record<string, unknown> = { isActive: true };
        if (search) {
            const searchTerm = search.toString();
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { content: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const [total, questions] = await Promise.all([
            Question.countDocuments(query),
            Question.find(query, { _id: 0 })  // Explicitly exclude _id field
                .lean()  // Convert to plain objects
                .populate('questionCategory', 'questionCategoryId name -_id')
                .populate('subCategory', 'subCategoryId name -_id')
                .populate('tags', 'questionTagId name -_id')
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 })
        ]);

        return res.status(200).json({
            message: 'Questions retrieved successfully',
            data: questions,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });

    } catch (error: unknown) {
        return handleError(res, error, 'retrieving questions');
    }
}

export default withAuth(handler);
