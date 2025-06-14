import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IQuestionCategory } from './QuestionCategory';

export interface ISubCategory extends Document {
    subCategoryId: string;
    name: string;
    questionCategoryIds: IQuestionCategory[];
    createdAt: Date;
    updatedAt: Date;
}

const subCategorySchema = new Schema<ISubCategory>(
    {
        subCategoryId: {
            type: String,
            default: uuidv4,
            unique: true,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        questionCategoryIds: [{
            type: Schema.Types.ObjectId,
            ref: 'QuestionCategory',
            required: true
        }]
    },
    {
        timestamps: true
    }
);

// Create a compound index for unique name
subCategorySchema.index({ name: 1 }, { unique: true });

export const SubCategory = model<ISubCategory>('SubCategory', subCategorySchema);