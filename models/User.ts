import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { SubscriptionStatus } from '@/constants/enums';

export interface IUser extends Document {
    userId: string;
    name?: string;
    email: string;
    passwordHash?: string;
    createdAt: Date;
    subscriptionStatus: typeof SubscriptionStatus.FREE | typeof SubscriptionStatus.PREMIUM;
    profilePictureURL?: string;
    lastLogin?: Date;
    mobileNumber?: string;
    isAdmin?: boolean;
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
        enum: [SubscriptionStatus.FREE, SubscriptionStatus.PREMIUM],
        default: SubscriptionStatus.FREE,
    },
    profilePictureURL: {
        type: String,
        validate: {
            validator: function (url: string) {
                return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i.test(url);
            },
            message: (msg: { value: string }) => `${msg.value} is not a valid image URL!`
        }
    },
    lastLogin: {
        type: Date,
    },
    mobileNumber: {
        type: Number,
        validate: {
            validator: function (num: string) {
                return /^[0-9]{10,15}$/.test(num);
            },
            message: (msg: { value: string }) => `${msg.value} is not a valid mobile number`
        }
    },
    isAdmin: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 