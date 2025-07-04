import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import ExamBranches from '@/models/ExamBranches';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT')
        return res.status(405).json({ message: 'Method not allowed' });

    try {
        await connectToDatabase();

        const { examBranchName, oldExamTagName, newExamTagName } = req.body;

        if (!examBranchName || !oldExamTagName || !newExamTagName)
            return res.status(400).json({ message: 'Exam branch name, old tag name and new tag name are required' });

        // Find the exam branch
        const examBranch = await ExamBranches.findOne({ name: examBranchName });

        if (!examBranch)
            return res.status(404).json({ message: 'Exam branch not found' });

        // Check if old tag exists
        if (!examBranch.examTagNames.includes(oldExamTagName))
            return res.status(400).json({ message: 'Old tag name does not exist in this exam branch' });

        // Check if new tag already exists
        if (examBranch.examTagNames.includes(newExamTagName))
            return res.status(400).json({ message: 'New tag name already exists in this exam branch' });

        // Update the tag name
        examBranch.examTagNames = examBranch.examTagNames.map(tag =>
            tag === oldExamTagName ? newExamTagName : tag
        );

        await examBranch.save();

        return res.status(200).json({
            message: 'Tag name updated successfully',
            examBranch: {
                examBranchId: examBranch.examBranchId,
                name: examBranch.name,
                examTagNames: examBranch.examTagNames
            }
        });

    } catch (error: unknown) {
        console.error('Error updating tag name:', error);
        return res.status(500).json({
            message: 'Error updating tag name',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Apply both authentication middlewares
export default withAuth(isAdmin(handler)); 