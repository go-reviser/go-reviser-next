import { NextApiRequest, NextApiResponse } from 'next';
import User, { IUser } from '@/models/User';
import { connectToDatabase } from './mongodb';

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

// Interface for authenticated request with user information
export interface AuthenticatedRequest extends NextApiRequest {
    user?: IUser;
}

// Middleware to verify authentication token and attach user to request
export function isAdmin(handler: NextApiHandler) {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
        try {
            // Get the token from the Authorization header
            await connectToDatabase();

            req.user = await User.findOne({ userId: req.user?.userId });

            if (!req.user || !req.user.isAdmin)
                return res.status(401).json({ message: 'Unauthorized' });

            return handler(req, res);
        } catch (error) {
            console.error('Authentication error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
}