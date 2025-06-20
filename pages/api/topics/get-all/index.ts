import { NextApiRequest, NextApiResponse } from 'next';
import Topic from '@/models/Topic';
import { connectToDatabase } from '@/lib/mongodb';
import { withAuth } from '@/lib/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        // Get all topics and populate the module information
        const topics = await Topic.find()
            .populate('module', 'name moduleId') // Only populate name and moduleId from module
            .sort({ createdAt: -1 }); // Sort by newest first

        return res.status(200).json({
            message: 'Topics retrieved successfully',
            topics: topics.map(topic => ({
                id: topic.topicId,
                name: topic.name,
                module: {
                    id: topic.module.moduleId,
                    name: topic.module.name
                },
                length: topic.length,
                difficulty: topic.difficulty,
                createdAt: topic.createdAt,
                updatedAt: topic.updatedAt
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