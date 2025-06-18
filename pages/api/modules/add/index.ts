import { connectToDatabase } from "@/lib/mongodb";
import Subject from "@/models/Subject";
import Module from '@/models/Module';
import { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/lib/authMiddleware";
import { isAdmin } from "@/lib/isAdminMiddleware";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        let { moduleName, subjectName } = req.body;

        moduleName = moduleName.trim();
        subjectName = subjectName.trim();

        const subject = await Subject.findOne({ name: subjectName });


        if (!moduleName) {
            return res.status(400).json({ message: `Please enter module name` });
        }

        if (!subject) {
            return res.status(400).json({ message: `Subject ${subjectName} does not exist` });
        }

        if(await Module.findOne({ name: moduleName, subject: subject._id }))
            return res.status(400).json({message: `Module ${moduleName} already exists in ${subject.name}`});

        const moduleCreated = await Module.create({
            name: moduleName,
            subject: subject._id
        })


        return res.status(201).json({ message: `New module ${moduleCreated.name} added successfully in ${subject.name}` });
    } catch (err) {
        console.error('Adding new module error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export default withAuth(isAdmin(handler));