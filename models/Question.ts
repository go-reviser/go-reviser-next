import mongoose, { Schema, model, Document, Types, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IQuestionTag } from './QuestionTag';
import { ISubCategory } from './SubCategory';
import { IQuestionCategory } from './QuestionCategory';
import { IExamBranches } from './ExamBranches';

export interface IQuestion extends Document {
    questionId: string;
    questionNumber: number;
    title: string;
    content: string;
    subCategory: Types.ObjectId | ISubCategory;
    subCategoryName: string; // Added field for subcategory name
    questionCategory: Types.ObjectId | IQuestionCategory;
    questionCategoryName: string; // Added field for category name
    subjectName: string; // Added field for subject name
    tags: Types.Array<Types.ObjectId | IQuestionTag>;
    examBranches: Types.Array<Types.ObjectId | IExamBranches>;
    year?: number; // Added year attribute
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
    link?: string;
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
        questionNumber: {
            type: Number,
            required: true
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
        subCategory: {
            type: Schema.Types.ObjectId,
            ref: 'SubCategory',
            required: true
        },
        subCategoryName: {
            type: String,
            required: true
        },
        questionCategory: {
            type: Schema.Types.ObjectId,
            ref: 'QuestionCategory',
            required: true
        },
        questionCategoryName: {
            type: String,
            required: true
        },
        subjectName: {
            type: String,
            required: true
        },
        tags: [{
            type: Schema.Types.ObjectId,
            ref: 'QuestionTag'
        }],
        examBranches: [{
            type: Schema.Types.ObjectId,
            ref: 'ExamBranches'
        }],
        year: {
            type: Number,
            required: true
        },
        // For MCQ (single answer)
        correctAnswer: {
            type: String,
            default: null
        },
        // For MSQ (multiple answers)
        correctAnswers: {
            type: [String],
            default: null
        },
        // For NAT (numerical answer)
        numericalAnswer: {
            type: Number,
            default: null
        },
        // For NAT with range
        numericalAnswerRange: {
            min: {
                type: Number,
                default: null
            },
            max: {
                type: Number,
                default: null
            }
        },
        link: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret._id;
                return ret;
            },
            virtuals: true
        },
        toObject: {
            transform: (doc, ret) => {
                delete ret._id;
                return ret;
            },
            virtuals: true
        }
    }
);

// Add validation to ensure the questionCategory matches the subcategory's category
questionSchema.pre('save', async function (this: IQuestion, next: (err?: Error) => void) {
    if (this.subCategory && this.questionCategory) {
        const SubCategory = model('SubCategory');
        const subCategory = await SubCategory.findById(this.subCategory);

        if (subCategory && !subCategory.questionCategories.some((category: IQuestionCategory) => category.toString() === this.questionCategory.toString())) {
            next(new Error('The specified questionCategory does not match the subcategory\'s category'));
            return;
        }
    }
    next();
});

// Populate category and subcategory names before saving
questionSchema.pre('save', async function (this: IQuestion, next: (err?: Error) => void) {
    try {
        // Get subcategory name
        if (this.subCategory && (!this.subCategoryName || this.isModified('subCategory'))) {
            const SubCategory = model('SubCategory');
            const subCategory = await SubCategory.findById(this.subCategory);
            if (subCategory) {
                this.subCategoryName = subCategory.name;
            }
        }

        // Get category name and subject name
        if (this.questionCategory && (!this.questionCategoryName || !this.subjectName || this.isModified('questionCategory'))) {
            const QuestionCategory = model('QuestionCategory');
            const category = await QuestionCategory.findById(this.questionCategory).populate('subject');
            if (category) {
                this.questionCategoryName = category.name;
                if (category.subject && typeof category.subject !== 'string') {
                    this.subjectName = category.subject.name;
                }
            }
        }

        next();
    } catch (error) {
        next(error instanceof Error ? error : new Error(String(error)));
    }
});

// Extract year from tags
questionSchema.pre('save', async function (this: IQuestion, next: (err?: Error) => void) {
    if (this.tags && this.tags.length > 0) {
        // Get all tag names
        const QuestionTag = model('QuestionTag');
        const tagDocs = await QuestionTag.find({ _id: { $in: this.tags } });
        const tagNames = tagDocs.map(tag => tag.name);

        let yearFound = false;
        let yearTag = '';
        let yearValue = '';

        // Look for a tag containing a 4-digit number
        for (const tagName of tagNames) {
            // Extract first 4-digit number from the tag
            const match = tagName.match(/\d{4}/);
            if (match) {
                this.year = parseInt(match[0]);
                yearFound = true;
                yearTag = tagName;
                yearValue = match[0];
                break;
            }
        }

        // If no year found, throw an error
        if (!yearFound) {
            next(new Error('No year tag found. Question must have a tag containing a 4-digit number.'));
            return;
        }

        // Validate that the year tag exists in one of the examBranches' examTagNames
        if (this.examBranches && this.examBranches.length > 0) {
            const ExamBranches = model('ExamBranches');
            const examBranchDocs = await ExamBranches.find({ _id: { $in: this.examBranches } });

            // Check if the year tag exists in any of the exam branches' examTagNames
            const yearTagExistsInExamBranch = examBranchDocs.some(branch =>
                branch.examTagNames.some((examTag: string) => examTag.includes(yearValue))
            );

            if (!yearTagExistsInExamBranch) {
                next(new Error(`The year tag "${yearTag}" must exist in at least one of the selected exam branches' tag names.`));
                return;
            }
        } else {
            next(new Error('Question must be associated with at least one exam branch.'));
            return;
        }
    } else {
        next(new Error('Question must have at least one tag with a year.'));
        return;
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
            if (this.numericalAnswerRange.min > this.numericalAnswerRange.max) {
                next(new Error('NAT range min must be less than or equal to max'));
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
        { _id: this.subCategory },
        { $inc: { questionCount: -1 } }
    );
});

// Create compound indexes for faster queries based on denormalized fields
questionSchema.index({ subjectName: 1, questionCategoryName: 1, subCategoryName: 1, year: 1 });

// Additional indexes for common query patterns
questionSchema.index({ subjectName: 1 });
questionSchema.index({ questionCategoryName: 1 });
questionSchema.index({ subCategoryName: 1 });
questionSchema.index({ year: 1 });
questionSchema.index({ examBranches: 1 });

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', questionSchema);

export default Question;
export { Question };