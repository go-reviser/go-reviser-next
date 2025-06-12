import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, token, password } = req.body;
    if (!email || !token || !password) {
        return res.status(400).json({ message: 'Invalid request. Please try again. Email, token, and new password are required.' });
    }

    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the provided token and compare
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (
        user.resetPasswordToken !== tokenHash ||
        user.resetPasswordExpires < new Date()
    ) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password and clear reset fields
    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully.' });
} 