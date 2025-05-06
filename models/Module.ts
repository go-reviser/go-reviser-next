import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IModule extends Document {
    moduleId: string;
    subjectId: string;
    name: string;
}

const ModuleSchema: Schema = new Schema({
    moduleId: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
    },
    subjectId: {
        type: String,
        required: true,
        ref: 'Subject',
    },
    name: {
        type: String,
        trim: true,
        required: true,
    }
}, { timestamps: true });

export default mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema);
