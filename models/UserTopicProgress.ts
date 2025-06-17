import mongoose, { Schema, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IUser } from './User';
import { ITopic } from './Topic';

export interface IUserTopicProgress extends Document {
    progressId: string;
    user: Types.ObjectId | IUser;
    topic: Types.ObjectId | ITopic;
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
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    topic: {
        type: Schema.Types.ObjectId,
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
UserTopicProgressSchema.index({ user: 1, topic: 1 }, { unique: true });

export default mongoose.models.UserTopicProgress ||
    mongoose.model<IUserTopicProgress>('UserTopicProgress', UserTopicProgressSchema);