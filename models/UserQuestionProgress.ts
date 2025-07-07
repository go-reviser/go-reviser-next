import mongoose, { Schema, Document, Types, Model } from 'mongoose';
import { IUser } from './User';
import { IQuestion } from './Question';

export interface IUserQuestionProgress extends Document {
    user: Types.ObjectId | IUser;
    question: Types.ObjectId | IQuestion;
    timeSpent: number; // in seconds
    isCompleted: boolean;
    toRevise: boolean;
    remarks: string;
    attemptedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userQuestionProgressSchema = new Schema<IUserQuestionProgress>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        question: {
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        timeSpent: {
            type: Number,
            default: 0
        },
        isCompleted: {
            type: Boolean,
            default: true
        },
        toRevise: {
            type: Boolean,
            default: false
        },
        remarks: {
            type: String,
            default: ''
        },
        attemptedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Create a compound index to ensure a user can't submit multiple attempts for the same question
userQuestionProgressSchema.index({ user: 1, question: 1 }, { unique: true });

const UserQuestionProgress: Model<IUserQuestionProgress> = mongoose.models.UserQuestionProgress || mongoose.model<IUserQuestionProgress>('UserQuestionProgress', userQuestionProgressSchema);

export default UserQuestionProgress;
export { UserQuestionProgress };