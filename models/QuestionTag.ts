import { Schema, Document, Types, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IQuestion } from './Question';
import mongoose from 'mongoose';

export interface IQuestionTag extends Document {
    questionTagId: string;
    name: string;
    questions: Types.Array<Types.ObjectId | IQuestion>;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
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
        questions: [{
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        }],
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const QuestionTag: Model<IQuestionTag> = mongoose.models.QuestionTag || mongoose.model<IQuestionTag>('QuestionTag', questionTagSchema);

export default QuestionTag;
export { QuestionTag };