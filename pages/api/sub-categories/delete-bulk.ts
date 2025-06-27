import { NextApiRequest, NextApiResponse } from 'next';
import { SubCategory } from '@/models/SubCategory';
import { connectToDatabase } from '@/lib/mongodb';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';

interface SuccessResult {
    identifier: string;
}

interface FailedResult {
    identifier: string;
    reason: string;
}

interface BulkResults {
    success: SuccessResult[];
    failed: FailedResult[];
}

// Deleting all by sub category name or id
async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { subCategoryNames, subCategoryIds } = req.body;

        if (subCategoryNames && subCategoryIds)
            return res.status(400).json({ message: 'Both subCategoryNames and subCategoryIds cannot be provided. Provide only one.' });


        if (!subCategoryNames && !subCategoryIds)
            return res.status(400).json({ message: 'At least one subcategory name or id is required' });

        const identifiers = subCategoryNames || subCategoryIds;

        const results: BulkResults = {
            success: [],
            failed: []
        };

        try {
            await SubCategory.deleteMany({
                $or: identifiers.flatMap((identifier: string) => ([
                    { subCategoryId: identifier },
                    { name: identifier }
                ]))
            })

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            results.failed.push(...results.success.map(s => ({
                identifier: s.identifier,
                reason: message
            })));
            results.success = [];
        }

        return res.status(207).json({
            message: 'Bulk subcategory deletion completed',
            results
        });

    } catch (error: unknown) {
        console.error('Error deleting subcategories in bulk:', error);
        return res.status(500).json({
            message: 'Error deleting subcategories in bulk',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(isAdmin(handler)); 