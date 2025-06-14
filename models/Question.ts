import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IQuestionTag } from './QuestionTag';
import { ISubCategory } from './SubCategory';
import { IQuestionCategory } from './QuestionCategory';

export interface IQuestion extends Document {
    questionId: string;
    title: string;
    content: string;
    subCategoryId: Types.ObjectId | ISubCategory;
    questionCategoryId: Types.ObjectId | IQuestionCategory;
    tags: Types.Array<Types.ObjectId | IQuestionTag>;
    // For MCQ (single answer)
    correctAnswer?: string;
    // For MSQ (multiple answers)
    correctAnswers?: string[];
    // For NAT (numerical answer)
    numericalAnswer?: number;
    // For NAT with range
    numericalAnswerRange?: {
        min: number;
        max: number;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    // Helper methods
    hasMSQTag(): Promise<boolean>;
    hasNATTag(): Promise<boolean>;
    hasDescriptiveTag(): Promise<boolean>;
}

const questionSchema = new Schema<IQuestion>(
    {
        questionId: {
            type: String,
            default: uuidv4,
            unique: true,
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        subCategoryId: {
            type: Schema.Types.ObjectId,
            ref: 'SubCategory'
        },
        questionCategoryId: {
            type: Schema.Types.ObjectId,
            ref: 'QuestionCategory'
        },
        tags: [{
            type: Schema.Types.ObjectId,
            ref: 'QuestionTag'
        }],
        // For MCQ (single answer)
        correctAnswer: {
            type: String
        },
        // For MSQ (multiple answers)
        correctAnswers: {
            type: [String]
        },
        // For NAT (numerical answer)
        numericalAnswer: {
            type: Number
        },
        // For NAT with range
        numericalAnswerRange: {
            min: {
                type: Number
            },
            max: {
                type: Number
            }
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true
    }
);

// Add validation to ensure the questionCategoryId matches the subcategory's category
questionSchema.pre('save', async function (this: IQuestion, next: (err?: Error) => void) {
    if (this.subCategoryId && this.questionCategoryId) {
        const SubCategory = model('SubCategory');
        const subCategory = await SubCategory.findById(this.subCategoryId);

        if (subCategory && !subCategory.questionCategoryIds.some((category: IQuestionCategory) => category.toString() === this.questionCategoryId.toString())) {
            next(new Error('The specified questionCategoryId does not match the subcategory\'s category'));
            return;
        }
    }
    next();
});

// Helper methods to check question type based on tags
questionSchema.methods.hasMSQTag = async function (this: IQuestion): Promise<boolean> {
    const QuestionTag = model('QuestionTag');
    const msqTag = await QuestionTag.findOne({ name: 'multiple-selects' });
    return this.tags.some(tag => tag.toString() === msqTag?._id.toString());
};

questionSchema.methods.hasNATTag = async function (this: IQuestion): Promise<boolean> {
    const QuestionTag = model('QuestionTag');
    const natTag = await QuestionTag.findOne({ name: 'numerical-answers' });
    return this.tags.some(tag => tag.toString() === natTag?._id.toString());
};

questionSchema.methods.hasDescriptiveTag = async function (this: IQuestion): Promise<boolean> {
    const QuestionTag = model('QuestionTag');
    const descriptiveTag = await QuestionTag.findOne({ name: 'descriptive' });
    return this.tags.some(tag => tag.toString() === descriptiveTag?._id.toString());
};

// Add validation for answer fields based on question type
questionSchema.pre('save', async function (this: IQuestion, next: (err?: Error) => void) {
    if (!this.isActive) {
        next();
        return;
    }

    const [hasMSQ, hasNAT, hasDescriptive] = await Promise.all([
        this.hasMSQTag(),
        this.hasNATTag(),
        this.hasDescriptiveTag()
    ]);

    // Validate MCQ (single answer)
    if (!hasMSQ && !hasNAT && !hasDescriptive) {
        if (!this.correctAnswer) {
            next(new Error('MCQ must have a correct answer'));
            return;
        }
    }

    // Validate MSQ (multiple answers)
    if (hasMSQ) {
        if (!this.correctAnswers || this.correctAnswers.length === 0) {
            next(new Error('MSQ must have at least one correct answer'));
            return;
        }
    }

    // Validate NAT (numerical answer)
    if (hasNAT && !hasDescriptive) {
        if (!this.numericalAnswer && !this.numericalAnswerRange) {
            next(new Error('NAT must have either a numerical answer or a range'));
            return;
        }
        if (this.numericalAnswerRange) {
            if (!this.numericalAnswerRange.min || !this.numericalAnswerRange.max) {
                next(new Error('NAT range must have both min and max values'));
                return;
            }
            if (this.numericalAnswerRange.min >= this.numericalAnswerRange.max) {
                next(new Error('NAT range min must be less than max'));
                return;
            }
        }
    }

    // Validate descriptive questions
    if (hasDescriptive) {
        // Ensure no answer fields are set for descriptive questions
        if (this.correctAnswer || this.correctAnswers ||
            this.numericalAnswer || this.numericalAnswerRange) {
            next(new Error('Descriptive questions should not have any answer fields'));
            return;
        }
    }

    next();
});

// Handle question count decrement using post middleware
questionSchema.post('deleteOne', { document: true, query: false }, async function (this: IQuestion) {
    await model('SubCategory').updateOne(
        { _id: this.subCategoryId },
        { $inc: { questionCount: -1 } }
    );
});

export const Question = model<IQuestion>('Question', questionSchema); 