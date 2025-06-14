import { Schema, model, Document, Types } from 'mongoose';
import { ISubject } from './Subject';
import { v4 as uuidv4 } from 'uuid';

export interface IQuestionCategory extends Document {
    questionCategoryId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    subjectId: Types.ObjectId | ISubject;
}

const questionCategorySchema = new Schema<IQuestionCategory>(
    {
        questionCategoryId: {
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
        subjectId: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const QuestionCategory = model<IQuestionCategory>('QuestionCategory', questionCategorySchema); 