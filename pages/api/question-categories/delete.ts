import { NextApiRequest, NextApiResponse } from 'next';
import { QuestionCategory } from '@/models/QuestionCategory';
import { connectToDatabase } from '@/lib/mongodb';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { uuid, name } = req.body;

        if (uuid && name) {
            return res.status(400).json({ message: 'Both category uuid and name cannot be provided. Provide only one.' });
        }

        if (!uuid && !name) {
            return res.status(400).json({ message: 'Category uuid or name is required' });
        }

        if (!(await QuestionCategory.exists({
            $or: [
                { _id: uuid },
                { name: name }
            ]
        }))) {
            return res.status(404).json({ message: 'Question category not found' });
        }

        await QuestionCategory.deleteOne({
            $or: [
                { _id: uuid },
                { name: name }
            ]
        });

        return res.status(200).json({
            message: 'Question category deleted successfully',
            deletedCategory: uuid || name
        });

    } catch (error: unknown) {
        console.error('Error deleting question category:', error);
        return res.status(500).json({
            message: 'Error deleting question category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(isAdmin(handler));