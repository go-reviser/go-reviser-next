import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '@/models/User';

// JWT secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Token expiration time (in seconds)
const TOKEN_EXPIRY_STRING = process.env.JWT_TOKEN_EXPIRY_TIME;

// Add a check for JWT_SECRET at startup
if (!JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}

if (!TOKEN_EXPIRY_STRING) {
    console.warn('WARNING: JWT_TOKEN_EXPIRY_TIME is not defined. Using default of 1 hour.');
}

// Determine token expiry: use environment variable or default to '1h'
// jwt.sign expects string (e.g., "1h", "2 days") or number (seconds)
const TOKEN_EXPIRY: string | number = TOKEN_EXPIRY_STRING || '1h';

export interface TokenPayload {
    userId: string;
    email: string;
    name: string;
    isAdmin: boolean;
}

// Generate JWT token
export function generateToken(user: IUser): string {
    const payload: TokenPayload = {
        userId: user.userId,
        name: user.name || '',
        email: user.email,
        isAdmin: user.isAdmin || false
    };

    // JWT_SECRET is guaranteed to be a string here due to the check above
    return jwt.sign(payload, JWT_SECRET!, { expiresIn: TOKEN_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
    try {
        // JWT_SECRET is guaranteed to be a string here
        const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;

        // Type guard to ensure decoded object matches TokenPayload structure
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'email' in decoded && 'name' in decoded && 'isAdmin' in decoded) {
            return decoded as TokenPayload;
        }
        console.log("Token payload structure mismatch");
        return null;
    } catch (_error) { // _error remains unused
        console.log("Unable to verify token", _error instanceof Error ? _error.message : '');
        return null;
    }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("Invalid token format");
        return null;
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
} 