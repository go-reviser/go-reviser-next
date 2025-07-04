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

        const { examBranchName, examTagName } = req.body;

        if (!examBranchName || !examTagName)
            return res.status(400).json({ message: 'Exam branch name and tag name are required' });

        // Find the exam branch
        const examBranch = await ExamBranches.findOne({ name: examBranchName });

        if (!examBranch)
            return res.status(404).json({ message: 'Exam branch not found' });

        // Check if tag already exists in this branch
        if (examBranch.examTagNames.includes(examTagName))
            return res.status(400).json({ message: 'Tag name already exists in this exam branch' });

        // Add the tag name
        examBranch.examTagNames.push(examTagName);
        await examBranch.save();

        return res.status(200).json({
            message: 'Tag name added successfully',
            examBranch: {
                examBranchId: examBranch.examBranchId,
                name: examBranch.name,
                examTagNames: examBranch.examTagNames
            }
        });

    } catch (error: unknown) {
        console.error('Error adding tag name:', error);
        return res.status(500).json({
            message: 'Error adding tag name',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Apply both authentication middlewares
export default withAuth(isAdmin(handler)); 