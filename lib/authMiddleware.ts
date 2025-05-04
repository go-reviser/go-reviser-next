import { NextApiRequest, NextApiResponse } from 'next';
import { extractTokenFromHeader, verifyToken } from './auth';
import User, { IUser } from '@/models/User';

type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

// Interface for authenticated request with user information
export interface AuthenticatedRequest extends NextApiRequest {
    user?: IUser;
}

// Middleware to verify authentication token and attach user to request
export function withAuth(handler: NextApiHandler) {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
        try {
            // Get the token from the Authorization header
            const authHeader = req.headers.authorization;
            const token = extractTokenFromHeader(authHeader);

            if (!token) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            // Verify the token
            const decoded = verifyToken(token);
            if (!decoded) {
                return res.status(401).json({ message: 'Invalid or expired token' });
            }

            // Find the user from the database
            const user = await User.findOne({ userId: decoded.userId });
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Attach the user to the request
            req.user = user;

            // Call the original handler
            return handler(req, res);
        } catch (error) {
            console.error('Authentication error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
} 