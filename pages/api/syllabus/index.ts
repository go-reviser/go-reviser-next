import { connectToDatabase } from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/lib/authMiddleware";
import Topic from "@/models/Topic";
import Module from "@/models/Module";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const subjects = await Subject.find().select('name subjectId').lean();

        for (const subject of subjects) {
            const modules = await Module.find({ subjectId: subject.subjectId }).select('name moduleId').lean();

            for (const moduleElem of modules) {
                const topics = await Topic.find({ moduleId: moduleElem.moduleId }).select('name topicId').lean();
                moduleElem.topics = topics;
            }

            subject.modules = modules;
        }

        return res.status(201).json({ message: 'Fetched whole syllabus of GATE CSE', subjects });
    } catch (err) {
        console.error('Error fetching syllabus:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default withAuth(handler);