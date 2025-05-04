import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IUser extends Document {
    userId: string;
    name?: string;
    email: string;
    passwordHash?: string;
    createdAt: Date;
    subscriptionStatus: 'Free' | 'Premium';
    profilePictureURL?: string;
    lastLogin?: Date;
    mobileNumber?: number;
}

const UserSchema: Schema = new Schema({
    userId: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    subscriptionStatus: {
        type: String,
        enum: ['Free', 'Premium'],
        default: 'Free',
    },
    profilePictureURL: {
        type: String,
    },
    lastLogin: {
        type: Date,
    },
    mobileNumber: {
        type: Number,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 