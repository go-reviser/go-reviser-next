import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import ExamBranches from '@/models/ExamBranches';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET')
        return res.status(405).json({ message: 'Method not allowed' });

    try {
        await connectToDatabase();

        const examBranches = await ExamBranches.find();

        // Sort alphabetically by name
        examBranches.sort((a, b) => a.name.localeCompare(b.name));

        return res.status(200).json({
            message: 'Exam branches retrieved successfully',
            examBranches: examBranches.map(branch => ({
                examBranchId: branch.examBranchId,
                name: branch.name,
                description: branch.description,
                examTagNames: branch.examTagNames,
                isActive: branch.isActive
            }))
        });

    } catch (error: unknown) {
        console.error('Error retrieving exam branches:', error);
        return res.status(500).json({
            message: 'Error retrieving exam branches',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Apply both authentication middlewares
export default withAuth(isAdmin(handler)); 