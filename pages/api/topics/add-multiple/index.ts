import { connectToDatabase } from "@/lib/mongodb";
import Module from '@/models/Module';
import { NextApiResponse } from "next";
import { withAuth, AuthenticatedRequest } from "@/lib/authMiddleware";
import { isAdmin } from "@/lib/isAdminMiddleware";
import Topic from "@/models/Topic";
import { Difficulty } from "@/constants/enums";

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { data } = req.body;

        const createdData = [], incorrectData = [];

        for (const elem of data) {
            let { topicName, moduleName, difficulty } = elem;
            topicName = topicName.trim();
            moduleName = moduleName.trim();
            difficulty = difficulty?.trim();

            const moduleData = await Module.findOne({ name: moduleName });

            if (!moduleData) {
                incorrectData.push({ msg: `Module - ${moduleName} does not exist. Please create one` });
                continue;
            }

            if (await Topic.findOne({ name: topicName, module: moduleData._id })) {
                incorrectData.push({
                    msg: `Please correct the data, Topic - ${topicName} already exists in module - ${moduleName}.`
                });
                continue;
            }

            if (difficulty && !Object.values(Difficulty).includes(difficulty as Difficulty)) {
                incorrectData.push({
                    msg: `Either the difficulty can be empty or any one of ${Object.values(Difficulty)}.`
                });
            }
        }

        if (incorrectData.length !== 0) {
            return res.status(400).json({
                message: "Data is incorrect",
                incorrectData
            });
        }

        for (const elem of data) {
            let { topicName, moduleName, difficulty } = elem;
            topicName = topicName.trim();
            moduleName = moduleName.trim();
            difficulty = difficulty?.trim();

            const moduleData = await Module.findOne({ name: moduleName });

            const topic = await Topic.create({ name: topicName, module: moduleData._id, difficulty: difficulty });

            createdData.push(
                {
                    name: topic.name,
                    topicId: topic.topicId,
                    module: topic.module,
                    difficulty: topic.difficulty
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