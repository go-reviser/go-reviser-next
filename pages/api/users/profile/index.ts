import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/authMiddleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // req.user is available because of the auth middleware
        const user = req.user;

        // If user is not defined (should not happen due to middleware)
        if (!user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Return user profile information
        const userProfile = {
            userId: user.userId,
            name: user.name,
            email: user.email,
            subscriptionStatus: user.subscriptionStatus,
            profilePictureURL: user.profilePictureURL,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        };

        return res.status(200).json({ user: userProfile });
    } catch (error) {
        console.error('Profile error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Wrap the handler with the authentication middleware
export default withAuth(handler); 