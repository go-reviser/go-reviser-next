import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IQuestionCategory } from './QuestionCategory';

export interface IQuestionTag extends Document {
    questionTagId: string;
    name: string;
    questionCategoryId: Types.ObjectId | IQuestionCategory;
    createdAt: Date;
    updatedAt: Date;
}

const questionTagSchema = new Schema<IQuestionTag>(
    {
        questionTagId: {
            type: String,
            default: uuidv4,
            unique: true,
            required: true,
        },
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        questionCategoryId: {
            type: Schema.Types.ObjectId,
            ref: 'QuestionCategory',
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const QuestionTag = model<IQuestionTag>('QuestionTag', questionTagSchema); 