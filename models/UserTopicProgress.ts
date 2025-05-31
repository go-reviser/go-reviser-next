import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IUserTopicProgress extends Document {
    progressId: string;
    userId: string;
    topicId: string;
    isCompleted: boolean;
    toRevise: boolean;
}

const UserTopicProgressSchema: Schema = new Schema({
    progressId: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
    },
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    topicId: {
        type: String,
        required: true,
        ref: 'Topic'
    },
    isCompleted: {
        type: Boolean,
        default: false,
        required: true
    },
    toRevise: {
        type: Boolean,
        default: false,
        required: true
    }
}, { timestamps: true });

// Create compound index for userId and topicId for faster lookups and enforcing uniqueness
UserTopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

export default mongoose.models.UserTopicProgress ||
    mongoose.model<IUserTopicProgress>('UserTopicProgress', UserTopicProgressSchema);