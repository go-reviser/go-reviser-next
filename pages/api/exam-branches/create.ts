import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import ExamBranches from '@/models/ExamBranches';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST')
        return res.status(405).json({ message: 'Method not allowed' });

    try {
        await connectToDatabase();

        const { name, description, examTagNames = [], isActive = true } = req.body;

        // Validate required fields
        if (!name)
            return res.status(400).json({ message: 'Name is required' });

        if (await ExamBranches.findOne({ name }))
            return res.status(400).json({ message: 'Exam branch already exists' });

        // Create new exam branch
        const newExamBranch = new ExamBranches({
            name,
            description,
            examTagNames,
            isActive
        });

        await newExamBranch.save();

        return res.status(201).json({
            message: 'Exam branch created successfully',
            examBranch: {
                id: newExamBranch.examBranchId,
                name: newExamBranch.name,
                description: newExamBranch.description,
                examTagNames: newExamBranch.examTagNames,
                isActive: newExamBranch.isActive
            }
        });

    } catch (error: unknown) {
        console.error('Error creating exam branch:', error);
        return res.status(500).json({
            message: 'Error creating exam branch',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Apply both authentication middlewares
export default withAuth(isAdmin(handler)); 