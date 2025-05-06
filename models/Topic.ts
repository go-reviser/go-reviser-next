import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITopic extends Document {
    topicId: string;
    name: string;
    moduleId: string;
    length?: number;
}

const TopicSchema: Schema = new Schema({
    topicId: {
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
    moduleId: {
        type: String,
        required: true,
        ref: 'Module'
    },
    length: {
        type: Number,
    }
}, { timestamps: true });

export default mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema); 