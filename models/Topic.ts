import { Difficulty } from '@/constants/enums';
import mongoose, { Schema, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IModule } from './Module';

export interface ITopic extends Document {
    topicId: string;
    name: string;
    module: Types.ObjectId | IModule;
    length?: number;
    difficulty?: Difficulty;
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
    module: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Module'
    },
    length: {
        type: Number,
    },
    difficulty: {
        type: String,
        enum: Object.values(Difficulty),
        default: Difficulty.MEDIUM,
        required: true
    }
}, { timestamps: true });

export default mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema); 