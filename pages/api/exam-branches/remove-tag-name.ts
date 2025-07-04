import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import ExamBranches from '@/models/ExamBranches';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE')
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

        // Check if tag exists in this branch
        if (!examBranch.examTagNames.includes(examTagName))
            return res.status(400).json({ message: 'Tag name does not exist in this exam branch' });

        // Remove the tag name
        examBranch.examTagNames = examBranch.examTagNames.filter(tag => tag !== examTagName);
        await examBranch.save();

        return res.status(200).json({
            message: 'Tag name removed successfully',
            examBranch: {
                examBranchId: examBranch.examBranchId,
                name: examBranch.name,
                examTagNames: examBranch.examTagNames
            }
        });

    } catch (error: unknown) {
        console.error('Error removing tag name:', error);
        return res.status(500).json({
            message: 'Error removing tag name',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Apply both authentication middlewares
export default withAuth(isAdmin(handler)); 