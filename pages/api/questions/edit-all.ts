import { NextApiRequest, NextApiResponse } from 'next';
import { Question } from '@/models/Question';
import { connectToDatabase } from '@/lib/mongodb';
import { withAuth } from '@/lib/authMiddleware';

// Helper function to handle errors
const handleError = (res: NextApiResponse, error: unknown, message: string) => {
    console.error(`Error ${message}:`, error);
    return res.status(500).json({
        message: `Error ${message}`,
        error: error instanceof Error ? error.message : 'Unknown error'
    });
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectToDatabase();

        const questions = await Question.find({});

        let completed = 0;

        for (const question of questions) {
            if (completed % 50 == 0)
                console.log(completed + " completed out of " + questions.length);
            completed++;
            let newContent = '';

            let content = question.content;
            content = content.replaceAll('\\(', '$');
            content = content.replaceAll('\\)', '$');

            let count = 0, mathStart = false;

            for (let i = 0; i < content.length;) {
                if (content[i] == '$') {
                    if (i + 1 < content.length && content[i + 1] == '$') {
                        mathStart = !mathStart;

                        if (mathStart)
                            newContent += '\\[';
                        else
                            newContent += '\\]';

                        i += 2;

                    } else if (mathStart) {
                        newContent += content[i];
                        i++;
                    } else {
                        count++;
                        if (count % 2)
                            newContent += '\\(';
                        else
                            newContent += '\\)';

                        i++;
                    }
                } else {
                    newContent += content[i];
                    i++;
                }
            }

            question.content = newContent;

            await question.save();
        }

        return res.status(200);

    } catch (error: unknown) {
        return handleError(res, error, 'retrieving questions');
    }
}

export default withAuth(handler);
