import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IExamBranches extends Document {
    examBranchId: string;
    name: string;
    description?: string;
    examTagNames: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ExamBranchesSchema: Schema = new Schema({
    examBranchId: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    examTagNames: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const ExamBranches: Model<IExamBranches> = mongoose.models.ExamBranches || mongoose.model<IExamBranches>('ExamBranches', ExamBranchesSchema);

export default ExamBranches;
export { ExamBranches }; 