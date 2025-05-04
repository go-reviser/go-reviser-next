import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await connectToDatabase();

        const { name, email, password } = req.body;

        // Check if all required fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await User.create({
            name,
            email,
            passwordHash: hashedPassword
        });

        // Don't send password in response
        const user = {
            userId: newUser.userId,
            name: newUser.name,
            email: newUser.email
        };

        return res.status(201).json({ message: 'User created successfully', user });
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}