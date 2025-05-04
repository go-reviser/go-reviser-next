import jwt from 'jsonwebtoken';
import { IUser } from '@/models/User';

// JWT secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'vkqw1278*(*1bjk*())h1ne21!(#)';

// Token expiration time (in seconds)
const TOKEN_EXPIRY = '7d'; // 7 days

export interface TokenPayload {
    userId: string;
    email: string;
}

// Generate JWT token
export function generateToken(user: IUser): string {
    const payload: TokenPayload = {
        userId: user.userId,
        email: user.email
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (_error) {
        return null;
    }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
} 