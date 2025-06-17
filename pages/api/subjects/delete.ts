import { NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { withAuth, AuthenticatedRequest } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';
import Subject from '@/models/Subject';
import { QuestionCategory } from '@/models/QuestionCategory';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { subjectId } = req.body;

        if (!subjectId)
            return res.status(400).json({ message: 'Subject ID is required' });

        // First check if the subject exists
        const subject = await Subject.findOne({ subjectId });
        if (!subject)
            return res.status(404).json({ message: 'Subject not found' });

        // Check if there are any question categories associated with this subject
        const hasCategories = await QuestionCategory.exists({ subject: subject._id });
        if (hasCategories) {
            return res.status(400).json({
                message: 'Cannot delete subject: There are question categories associated with this subject. Please delete them first.'
            });
        }

        // Delete the subject
        await Subject.deleteOne({ subjectId });

        return res.status(200).json({
            message: 'Subject deleted successfully',
            deletedSubject: {
                subjectId: subject.subjectId,
                name: subject.name
            }
        });

    } catch (error) {
        console.error('Error deleting subject:', error);
        return res.status(500).json({
            message: 'Error deleting subject',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(isAdmin(handler));