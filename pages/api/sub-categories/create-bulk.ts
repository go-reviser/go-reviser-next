import { NextApiRequest, NextApiResponse } from 'next';
import { SubCategory } from '@/models/SubCategory';
import { QuestionCategory } from '@/models/QuestionCategory';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import { Types } from 'mongoose';
import { IQuestionCategory } from '@/models/QuestionCategory';

interface SubCategoryInput {
    name: string;
    questionCategoryNames: string[];
}

interface CategoryRef {
    _id: Types.ObjectId;
    name: string;
}

interface SuccessResult {
    name: string;
    id: string;
    isNew: boolean;
}

interface FailedResult {
    name: string;
    reason: string;
}

interface BulkResults {
    success: SuccessResult[];
    failed: FailedResult[];
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { subCategories } = req.body;

        if (!subCategories || !Array.isArray(subCategories) || subCategories.length === 0) {
            return res.status(400).json({ message: 'At least one subcategory is required' });
        }

        const results: BulkResults = {
            success: [],
            failed: []
        };

        // Process each subcategory
        for (const subCategoryInput of subCategories) {
            try {
                const { name, questionCategoryNames } = subCategoryInput as SubCategoryInput;

                if (!name || !questionCategoryNames || !Array.isArray(questionCategoryNames) || questionCategoryNames.length === 0) {
                    results.failed.push({
                        name: name || 'Unknown',
                        reason: 'Name and at least one question category name are required'
                    });
                    continue;
                }

                // Verify all question category names exist
                const reqCategories: CategoryRef[] = [];
                let invalidCategoryFound = false;

                for (const categoryName of questionCategoryNames) {
                    const category = await QuestionCategory.findOne({ name: categoryName });
                    if (!category) {
                        results.failed.push({
                            name,
                            reason: `Question category with name "${categoryName}" not found`
                        });
                        invalidCategoryFound = true;
                        break;
                    }
                    // Ensure we have a valid ObjectId
                    reqCategories.push({
                        _id: category._id as Types.ObjectId,
                        name: category.name
                    });
                }

                if (invalidCategoryFound) {
                    continue;
                }

                // Check if subcategory with this name already exists
                const existingSubCategory = await SubCategory.findOne({
                    name: { $regex: `^${name}$`, $options: 'i' }
                });

                let savedSubCategory;
                let isNewSubCategory = false;

                if (existingSubCategory) {
                    // Get current category IDs as strings for comparison
                    await existingSubCategory.populate<{ questionCategories: IQuestionCategory[] }>('questionCategories');

                    // Create a list of existing categories with their IDs and names
                    const existingCategories: CategoryRef[] = [];

                    // Safely extract IDs and names
                    for (const cat of existingSubCategory.questionCategories) {
                        existingCategories.push({
                            _id: cat._id as Types.ObjectId,
                            name: cat.name
                        });
                    }

                    // Get existing category IDs as strings for comparison
                    const existingCategoryIds = existingCategories.map(cat => cat._id.toString());

                    // Filter out categories that already exist in the subcategory
                    const newCategories = reqCategories.filter(
                        cat => !existingCategoryIds.includes(cat._id.toString())
                    );

                    if (newCategories.length === 0) {
                        // All categories already exist in this subcategory
                        results.success.push({
                            name,
                            id: existingSubCategory.subCategoryId,
                            isNew: false
                        });
                        continue;
                    }

                    // Extract just the ObjectIds for the new categories
                    const newCategoryIds = newCategories.map(cat => cat._id);

                    // Instead of trying to combine arrays with type issues,
                    // use Mongoose's update method directly
                    await SubCategory.updateOne(
                        { _id: existingSubCategory._id },
                        { $addToSet: { questionCategories: { $each: newCategoryIds } } }
                    );

                    // Fetch the updated subcategory
                    savedSubCategory = await SubCategory.findById(existingSubCategory._id);
                } else {
                    // Create new subcategory (just need the ObjectIds)
                    savedSubCategory = await SubCategory.create({
                        name,
                        questionCategories: reqCategories.map(cat => cat._id)
                    });
                    isNewSubCategory = true;
                }

                results.success.push({
                    name,
                    id: savedSubCategory!.subCategoryId,
                    isNew: isNewSubCategory
                });

            } catch (error) {
                results.failed.push({
                    name: subCategoryInput.name || 'Unknown',
                    reason: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return res.status(207).json({
            message: 'Bulk subcategory creation/update completed',
            results
        });

    } catch (error: unknown) {
        console.error('Error creating/updating subcategories in bulk:', error);
        return res.status(500).json({
            message: 'Error creating/updating subcategories in bulk',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(isAdmin(handler)); 