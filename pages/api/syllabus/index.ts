import { connectToDatabase } from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/lib/authMiddleware";
import Topic from "@/models/Topic";
import Module from "@/models/Module";

// Response types (for API response)
interface SyllabusResponse {
    id: string;
    name: string;
    modules: {
        id: string;
        name: string;
        topics: {
            id: string;
            name: string;
        }[];
    }[];
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        // Fetch all data with type assertions for Mongoose responses
        const allSubjects = await Subject.find()
            .select('name subjectId _id')
            .lean();

        const allModules = await Module.find()
            .select('name moduleId subject _id')
            .lean();

        const allTopics = await Topic.find()
            .select('name topicId module _id')
            .lean();

        // Transform the data to match our desired response format
        const formattedSubjects: SyllabusResponse[] = allSubjects.map(subject => ({
            id: subject.subjectId,
            name: subject.name,
            modules: allModules
                .filter(module => module.subject?.toString() === subject._id?.toString())
                .map(module => ({
                    id: module.moduleId,
                    name: module.name,
                    topics: allTopics
                        .filter(topic => topic.module?.toString() === module._id?.toString())
                        .map(topic => ({
                            id: topic.topicId,
                            name: topic.name
                        }))
                }))
        }));

        return res.status(200).json({
            message: 'Fetched whole syllabus of GATE CSE',
            subjects: formattedSubjects
        });
    } catch (err) {
        console.error('Error fetching syllabus:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default withAuth(handler);