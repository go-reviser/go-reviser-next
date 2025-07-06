import mongoose, { Schema, Document, Types, Model } from 'mongoose';
import { ISubject } from './Subject';
import { v4 as uuidv4 } from 'uuid';

export interface IQuestionCategory extends Document {
    questionCategoryId: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    subject: Types.ObjectId | ISubject;
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
        subject: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
            required: true
        }
    },
    {
        timestamps: true
    }
);

const QuestionCategory: Model<IQuestionCategory> = mongoose.models.QuestionCategory || mongoose.model<IQuestionCategory>('QuestionCategory', questionCategorySchema);

export default QuestionCategory;
export { QuestionCategory };