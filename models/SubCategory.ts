import mongoose, { Schema, model, Document, Types, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IQuestionCategory } from './QuestionCategory';

export interface ISubCategory extends Document {
    subCategoryId: string;
    name: string;
    questionCategories: Types.ObjectId[] | IQuestionCategory[];
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
        questionCategories: [{
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

// Ensure questionCategories array has unique values
subCategorySchema.path('questionCategories').validate(function (value: Types.ObjectId[]) {
    // Convert ObjectIds to strings for comparison
    const stringIds = value.map(id => id.toString());
    // Check if the array has duplicates by comparing with Set size
    return stringIds.length === new Set(stringIds).size;
}, 'questionCategories must contain unique values');

const SubCategory: Model<ISubCategory> = mongoose.models.SubCategory || mongoose.model<ISubCategory>('SubCategory', subCategorySchema); 

export default SubCategory;
export {SubCategory};