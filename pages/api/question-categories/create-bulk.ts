import { NextApiRequest, NextApiResponse } from 'next';
import { QuestionCategory } from '@/models/QuestionCategory';
import { connectToDatabase } from '@/lib/mongodb';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';
import Subject, { ISubject } from '@/models/Subject';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { categories } = req.body;

        if (!Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({
                message: 'Categories must be provided as a non-empty array'
            });
        }

        // Validate each category has required fields
        for (const category of categories) {
            if (!category.name || (!category.subjectUuid && !category.subjectName)) {
                return res.status(400).json({
                    message: 'Each category must have a name and subjectUuid',
                    invalidCategory: category
                });
            }

            if (category.subjectUuid && category.subjectName) {
                return res.status(400).json({
                    message: 'Both subjectUuid and subjectName cannot be provided. Provide only one.',
                    invalidCategory: category
                });
            }

            if (category.subjectName && !(await Subject.exists({ name: category.subjectName }))) {
                return res.status(400).json({
                    message: 'Subject not found with the provided name',
                    invalidCategory: category
                });
            }

            if (category.subjectUuid && !(await Subject.exists({ _id: category.subjectUuid }))) {
                return res.status(400).json({
                    message: 'Subject not found with the provided subjectUuid',
                    invalidCategory: category
                });
            }
        }

        // Check for duplicate names in the request
        const names = categories.map(cat => cat.name);
        if (new Set(names).size !== names.length) {
            return res.status(400).json({
                message: 'Duplicate category names found in the request'
            });
        }

        // Check for existing categories with the same names
        const existingCategories = await QuestionCategory.find({
            name: { $in: names }
        });

        if (existingCategories.length > 0) {
            return res.status(400).json({
                message: 'Some categories already exist',
                existingCategories: existingCategories.map(cat => cat.name)
            });
        }

        const newCategories = await Promise.all(categories.map(async cat => {
            let subject: ISubject | null = null;
            if (cat.subjectName) {
                subject = await Subject.findOne({ name: cat.subjectName });
            } else {
                subject = await Subject.findOne({ _id: cat.subjectUuid });
            }
            return {
                name: cat.name,
                subject: subject?._id
            };
        }));

        // Create all categories
        const createdCategories = await QuestionCategory.insertMany(newCategories);

        return res.status(201).json({
            message: 'Question categories created successfully',
            data: createdCategories.map(cat => ({
                questionCategoryId: cat.questionCategoryId,
                name: cat.name,
                subject: cat.subject
            }))
        });

    } catch (error: unknown) {
        console.error('Error creating question categories:', error);
        return res.status(500).json({
            message: 'Error creating question categories',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(isAdmin(handler));