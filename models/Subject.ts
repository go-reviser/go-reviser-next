import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ISubject extends Document {
    subjectId: string;
    name: string;
}

const SubjectSchema: Schema = new Schema({
    subjectId: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        trim: true,
        unique: true,
        required: true
    }
}, { timestamps: true });

export default mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema); 