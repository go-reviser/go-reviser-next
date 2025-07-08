import { NextApiRequest, NextApiResponse } from 'next';
import { Question } from '@/models/Question';
import { QuestionCategory } from '@/models/QuestionCategory';
import { SubCategory } from '@/models/SubCategory';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        let { categoryName = '', subCategoryName = '' } = req.query as { categoryName: string, subCategoryName: string };

        if (!categoryName || !subCategoryName) {
            return res.status(400).json({
                message: 'Both categoryName and subCategoryName are required query parameters'
            });
        }

        categoryName = categoryName.toLowerCase().split(' ').join('-');
        subCategoryName = subCategoryName.toLowerCase().split(' ').join('-');

        // Find the category by name
        const category = await QuestionCategory.findOne({
            name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
        });

        if (!category) {
            return res.status(404).json({ message: `Category '${categoryName}' not found` });
        }

        // Find the subcategory by name
        const subCategory = await SubCategory.findOne({
            name: { $regex: new RegExp(`^${subCategoryName}$`, 'i') },
            questionCategories: { $in: [category._id] }
        });

        if (!subCategory) {
            return res.status(404).json({
                message: `SubCategory '${subCategoryName}' not found or does not belong to category '${categoryName}'`
            });
        }

        // Get questions with pagination
        const { limit = 10, page = 1 } = req.query;
        const pageNum = parseInt(page.toString(), 10);
        const limitNum = parseInt(limit.toString(), 10);
        const skip = (pageNum - 1) * limitNum;

        // Find questions that belong to the subcategory and category
        const [total, questions] = await Promise.all([
            Question.countDocuments({
                subCategory: subCategory._id,
                questionCategory: category._id,
                isActive: true
            }),
            Question.find({
                subCategory: subCategory._id,
                questionCategory: category._id,
                isActive: true
            })
                .populate('tags', 'name -_id')
                .populate('examBranches', 'name -_id')
                .skip(skip)
                .limit(limitNum)
                .sort({ year: -1, questionNumber: 1 })
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
        console.error('Error retrieving questions:', error);
        return res.status(500).json({
            message: 'Error retrieving questions',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 