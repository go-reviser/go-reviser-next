import { connectToDatabase } from "@/lib/mongodb";
import Module from '@/models/Module';
import { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/lib/authMiddleware";
import { isAdmin } from "@/lib/isAdminMiddleware";
import Topic from "@/models/Topic";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        let { data } = req.body;

        const createdData = [];

        for (const elem of data) {
            let { topicName, moduleName } = elem;
            topicName = topicName.trim();
            moduleName = moduleName.trim();

            const moduleData = await Module.findOne({ name: moduleName });

            if (!moduleData)
                return res.status(400).json({
                    msg: `Please correct the data, unable to add ${topicName} because module - ${moduleName} does not exist.`
                });

            if (await Topic.findOne({ name: topicName, moduleId: moduleData.moduleId }))
                return res.status(400).json({
                    msg: `Please correct the data, unable to add ${topicName} because it already exists in module - ${moduleName}`
                });

            const topic = await Topic.create({ name: topicName, moduleId: moduleData.moduleId });

            createdData.push(
                {
                    name: topic.name,
                    topicId: topic.topicId,
                    moduleId: topic.moduleId
                }
            );

        }

        return res.status(201).json({ 
            message: `New topics added successfully as requested`, 
            createdData: createdData
        });
    } catch (err) {
        console.error('Adding new module error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default withAuth(isAdmin(handler));