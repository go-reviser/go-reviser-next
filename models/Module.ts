import mongoose, { Schema, Document, Types } from 'mongoose';
import { ISubject } from './Subject';
import { v4 as uuidv4 } from 'uuid';

export interface IModule extends Document {
    moduleId: string;
    subject: Types.ObjectId | ISubject;
    name: string;
}

const ModuleSchema: Schema = new Schema({
    moduleId: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true,
    },
    subject: {
        type: Schema.Types.ObjectId,
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
