import { NextApiResponse } from 'next';
import { AuthenticatedRequest } from '@/lib/isAdminMiddleware';
import { connectToDatabase } from '@/lib/mongodb';
import { withAuth } from '@/lib/authMiddleware';
import UserTopicProgress from '@/models/UserTopicProgress';
import User from '@/models/User';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const user = await User.findOne({ userId: req.user?.userId });

        // Get all topics and populate the module information
        const userTopicProgress = await UserTopicProgress.find({ user: user?._id })
            .populate('topic', 'name topicId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Topics retrieved successfully',
            userTopicProgress: userTopicProgress.map(progress => ({
                progressId: progress.progressId,
                topicId: progress.topic.topicId,
                isCompleted: progress.isCompleted,
                toRevise: progress.toRevise
            }))
        });

    } catch (error: unknown) {
        console.error('Error retrieving topics:', error);
        return res.status(500).json({
            message: 'Error retrieving topics',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(handler);