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

        const { examBranchName, examTagNames } = req.body;

        if (!examBranchName || !examTagNames || !Array.isArray(examTagNames))
            return res.status(400).json({ message: 'Exam branch name and an array of tag names are required' });

        if (examTagNames.length === 0)
            return res.status(400).json({ message: 'At least one tag name is required' });

        // Find the exam branch
        const examBranch = await ExamBranches.findOne({ name: examBranchName });

        if (!examBranch)
            return res.status(404).json({ message: 'Exam branch not found' });

        // Filter out any tag names that already exist in the branch
        const newTagNames = examTagNames.filter(tagName => 
            !examBranch.examTagNames.includes(tagName)
        );

        if (newTagNames.length === 0)
            return res.status(400).json({ message: 'All provided tag names already exist in this exam branch' });

        // Add the new tag names
        examBranch.examTagNames = [...examBranch.examTagNames, ...newTagNames];
        await examBranch.save();

        return res.status(200).json({
            message: `${newTagNames.length} tag name(s) added successfully`,
            examBranch: {
                examBranchId: examBranch.examBranchId,
                name: examBranch.name,
                examTagNames: examBranch.examTagNames
            },
            addedTags: newTagNames
        });

    } catch (error: unknown) {
        console.error('Error adding multiple tag names:', error);
        return res.status(500).json({
            message: 'Error adding multiple tag names',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Apply both authentication middlewares
export default withAuth(isAdmin(handler));
