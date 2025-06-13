import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './User';
import { IQuestion } from './Question';

export interface IUserQuestionProgress extends Document {
    userId: Types.ObjectId | IUser;
    questionId: Types.ObjectId | IQuestion;
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
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        questionId: {
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        timeSpent: {
            type: Number,
            required: true,
            min: 0,
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
userQuestionProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export const UserQuestionProgress = model<IUserQuestionProgress>('UserQuestionProgress', userQuestionProgressSchema); 