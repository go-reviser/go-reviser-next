import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { email, password } = req.body;

        // Check if all required fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find the user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login time
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = generateToken(user);

        // Return user information (excluding password)
        const userResponse = {
            userId: user.userId,
            name: user.name,
            email: user.email,
            subscriptionStatus: user.subscriptionStatus,
            profilePictureURL: user.profilePictureURL
        };

        return res.status(200).json({
            message: 'Login successful',
            user: userResponse,
            token
        });
    } catch (err) {
        console.error('Signin error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
} 