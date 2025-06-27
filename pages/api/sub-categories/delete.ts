import { NextApiRequest, NextApiResponse } from 'next';
import { SubCategory } from '@/models/SubCategory';
import { connectToDatabase } from '@/lib/mongodb';
import { withAuth } from '@/lib/authMiddleware';
import { isAdmin } from '@/lib/isAdminMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { uuid, name } = req.body;

        if (uuid && name) {
            return res.status(400).json({ message: 'Both subcategory uuid and name cannot be provided. Provide only one.' });
        }

        if (!uuid && !name) {
            return res.status(400).json({ message: 'Subcategory uuid or name is required' });
        }

        const query = uuid 
            ? { subCategoryId: uuid }
            : { name: name };

        const subcategory = await SubCategory.findOne(query);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }

        await SubCategory.deleteOne(query);

        return res.status(200).json({
            message: 'Subcategory deleted successfully',
            deletedSubCategory: uuid || name
        });

    } catch (error: unknown) {
        console.error('Error deleting subcategory:', error);
        return res.status(500).json({
            message: 'Error deleting subcategory',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export default withAuth(isAdmin(handler)); 