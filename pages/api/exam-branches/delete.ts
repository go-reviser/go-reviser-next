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

        const { examBranchName } = req.body;

        if (!examBranchName)
            return res.status(400).json({ message: 'Exam branch name is required' });

        // Find and delete the exam branch
        const deletedExamBranch = await ExamBranches.findOneAndDelete({ name: examBranchName });

        if (!deletedExamBranch)
            return res.status(404).json({ message: 'Exam branch not found' });

        return res.status(200).json({
            message: 'Exam branch deleted successfully',
            examBranchId: deletedExamBranch.examBranchId
        });

    } catch (error: unknown) {
        console.error('Error deleting exam branch:', error);
        return res.status(500).json({
            message: 'Error deleting exam branch',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Apply both authentication middlewares
export default withAuth(isAdmin(handler)); 