import { connectToDatabase } from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/lib/authMiddleware";
import { isAdmin } from "@/lib/isAdminMiddleware";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { subjects } = req.body;

        console.log(subjects);

        if (!subjects) {
            return res.status(400).json({ message: 'Atleast 1 subject required' });
        }

        await Subject.deleteMany();

        const subjectsCreated = [];

        for (const subject of subjects) {
            const subjectCreated = await Subject.create({
                name: subject
            });
            subjectsCreated.push({
                subjectId: subjectCreated.subjectId,
                name: subjectCreated.name
            });
        }

        return res.status(201).json({ message: 'old subjects removed and new subjects created successfully', subjectsCreated });
    } catch (err) {
        console.error('replacing new subjects error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default withAuth(isAdmin(handler));