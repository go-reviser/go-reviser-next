import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { SubCategory } from '@/models/SubCategory';
import { QuestionCategory } from '@/models/QuestionCategory';
import { connectToDatabase } from '@/lib/mongodb';
import { IQuestionCategory } from '@/models/QuestionCategory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        let { categoryName = '' } = req.query as { categoryName: string };

        categoryName = categoryName.toLowerCase().split(' ').join('-');

        if (!categoryName) {
            return res.status(400).json({ message: 'Question category name is required' });
        }

        // Find the question category by name
        const category = await QuestionCategory.findOne({
            name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
        });

        if (!category) {
            return res.status(404).json({ message: `Question category with name "${categoryName}" not found` });
        }

        // Find all subcategories that contain this category
        const subCategories = await SubCategory.find({
            questionCategories: category._id
        }).populate<{ questionCategories: IQuestionCategory[] }>('questionCategories');

        // Count questions for each subcategory
        const subcategoryData = await Promise.all(
            subCategories.map(async (subCategory) => {
                // Use aggregate to count questions for this subcategory
                const Question = mongoose.model('Question');
                const questionCount = await Question.countDocuments({
                    subCategory: subCategory._id,
                    questionCategory: category._id,
                    isActive: true
                });

                return {
                    id: subCategory.subCategoryId,
                    name: subCategory.name.split('-').join(' ').replace(/\b\w/g, (char) => char.toUpperCase()),
                    questionCount
                };
            })
        );

        return res.status(200).json({
            message: 'Subcategories retrieved successfully',
            data: subcategoryData
        });

    } catch (error: unknown) {
        console.error('Error retrieving subcategories by category:', error);
        return res.status(500).json({
            message: 'Error retrieving subcategories by category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 