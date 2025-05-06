import { connectToDatabase } from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/lib/authMiddleware";
import { isAdmin } from "@/lib/isAdminMiddleware";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { subject } = req.body;

        console.log(subject);

        if (!subject || typeof subject !== 'string') {
            return res.status(400).json({ message: 'Add 1 subject only' });
        }

        if (await Subject.findOne({ name: subject })) {
            return res.status(400).json({ message: 'Subject already exists' });
        }

        const subjectCreated = await Subject.create({
            name: subject
        });

        return res.status(201).json({ message: 'new subject added successfully', subjectCreated });
    } catch (err) {
        console.error('replacing new subjects error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default withAuth(isAdmin(handler));