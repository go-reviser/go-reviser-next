import { NextApiRequest, NextApiResponse } from 'next';
import { QuestionCategory } from '@/models/QuestionCategory';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import Subject, { ISubject } from '@/models/Subject';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { name, subjectUuid, subjectName } = req.body;

        if (subjectUuid && subjectName) {
            return res.status(400).json({ message: 'Both subjectUuid and subjectName cannot be provided. Provide only one.' });
        }

        if (!name || (!subjectUuid && !subjectName)) {
            return res.status(400).json({ message: 'Name and subjectUuid or subjectName are required' });
        }

        // Find the subject first using the UUID
        // const subject = await Subject.findOne({ subjectId: subjectUuid || subjectName });
        let subject;
        if (subjectUuid) {
            subject = await Subject.findById(subjectUuid);
        } else {
            subject = await Subject.findOne({ name: subjectName });
        }
        if (!subject) {
            return res.status(400).json({ message: 'Subject not found with provided UUID or name' });
        }

        const existingCategory = await QuestionCategory.exists({
            name: { $regex: `^${name}$`, $options: 'i' }
        });
        if (existingCategory) {
            return res.status(400).json({ message: 'A category with this name already exists' });
        }

        const newCategory = await QuestionCategory.create({
            name,
            subject: subject._id // Store the MongoDB ObjectId
        });

        // Populate the subject details for the response
        await newCategory.populate('subject');
        const populatedSubject = newCategory.subject as ISubject;

        return res.status(201).json({
            message: 'Question category created successfully',
            data: {
                questionCategoryId: newCategory.questionCategoryId,
                name: newCategory.name,
                subject: {
                    subjectId: populatedSubject.subjectId,
                    name: populatedSubject.name
                }
            }
        });

    } catch (error: unknown) {
        console.error('Error creating question category:', error);
        return res.status(500).json({
            message: 'Error creating question category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(isAdmin(handler));