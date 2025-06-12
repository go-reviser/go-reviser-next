import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { sendEmail } from '@/lib/sendEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) {
        // Always respond with success to prevent email enumeration
        return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate token and expiry
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = expires;
    await user.save();

    // Send email (mocked)
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    // TODO: Send email with nodemailer or other service
    console.log(`Password reset link (mock): ${resetUrl}`);

    await sendEmail({
        to: email,
        subject: 'Reset your password',
        html: `
            <p>You requested a password reset for your account.</p>
            <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>If you did not request this, you can ignore this email.</p>
        `,
    });

    return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
} 