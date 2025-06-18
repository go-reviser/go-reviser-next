import { connectToDatabase } from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/lib/authMiddleware";
import { isAdmin } from "@/lib/isAdminMiddleware";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const subjects = await Subject.find();

        const subjectsData = [];

        for(const subject of subjects) {
            subjectsData.push({
                name: subject.name,
                id: subject.subjectId
            })
        }

        return res.status(201).json({ message: 'All subjects', subjectsData });
    } catch (err) {
        console.error('Error fetching all subjects:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default withAuth(isAdmin(handler));