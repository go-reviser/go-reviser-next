import { IQuestionTag, QuestionTag } from '@/models/QuestionTag';
import { QuestionCategory } from '@/models/QuestionCategory';
import { SubCategory } from '@/models/SubCategory';
import { Question } from '@/models/Question';
import { Types, Document } from 'mongoose';

interface QuestionBaseData {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    answer?: string | string[] | number;
    link?: string;
    isActive?: boolean;
}

// New bulk operations functions
export interface BulkQuestionData {
    questionObj: Record<string, unknown>;
    tagIds: Types.ObjectId[];
    subCategory: Document | null;
}

export async function processBulkQuestions(
    questionsData: QuestionBaseData[]
): Promise<{
    processedQuestions: BulkQuestionData[];
    errors: { error: string; link?: string }[];
}> {
    const processedQuestions: BulkQuestionData[] = [];
    const errors: { error: string; link?: string }[] = [];

    // Get all categories and tags first to minimize DB calls
    const categoryNames = [...new Set(questionsData.map(q => q.category.toLowerCase().split(' ').join('-')))];
    const allCategories = await QuestionCategory.find({ name: { $in: categoryNames } });

    // Extract all tag names
    const allTagNames = [...new Set(questionsData.flatMap(q => q.tags || []))];
    const existingTags = await QuestionTag.find({ name: { $in: allTagNames } });

    // Create missing tags in bulk
    const existingTagNames = existingTags.map(tag => tag.name);
    const missingTagNames = allTagNames.filter(name => !existingTagNames.includes(name));

    let newTags: Document[] = [];
    if (missingTagNames.length > 0) {
        newTags = await QuestionTag.insertMany(
            missingTagNames.map(name => ({ name, questions: [] }))
        );
    }

    // Combine existing and new tags
    const allTags = [...existingTags, ...newTags];

    // Get question count once for numbering
    const baseQuestionNumber = 100000 + (await Question.countDocuments()) * 3;

    // Process each question
    for (let i = 0; i < questionsData.length; i++) {
        const data = questionsData[i];
        const { title, content, category, tags, answer, isActive, link } = data;

        // Find the category
        const categoryName = category.toLowerCase().split(' ').join('-');
        const questionCategory = allCategories.find(c => c.name === categoryName);

        if (!questionCategory) {
            errors.push({
                error: `Question category '${category}' not found`,
                link
            });
            continue;
        }

        // Get tag IDs
        const tagIds: Types.ObjectId[] = [];
        if (Array.isArray(tags) && tags.length > 0) {
            for (const tagName of tags) {
                const tag = allTags.find(t => (t as IQuestionTag).name === tagName);
                if (tag) {
                    tagIds.push(tag._id as Types.ObjectId);
                }
            }
        }

        // Find subcategory
        const subCategory = await SubCategory.findOne({
            $and: [
                { name: { $in: tags } },
                { name: { $ne: questionCategory.name } },
                { questionCategories: { $in: questionCategory._id } }
            ]
        });

        // Determine question type
        const isMSQ = tags?.includes('multiple-selects');
        const isNAT = tags?.includes('numerical-answers');
        const isDescriptive = tags?.includes('descriptive');

        // Create question object
        const questionObj: Record<string, unknown> = {
            title,
            content,
            subCategory: subCategory?._id,
            questionCategory: questionCategory._id,
            tags: tagIds,
            isActive: isActive || true,
            link,
            questionNumber: baseQuestionNumber + i * 3 + Math.floor(Math.random() * 3)
        };

        // Set answer based on type
        let error = null;

        if (isDescriptive) {
            // No answer fields for descriptive questions
        } else if (isNAT) {
            if (typeof answer === 'number') {
                questionObj.numericalAnswerRange = {
                    min: answer,
                    max: answer
                };
            } else if (typeof answer === 'string') {
                if (answer.includes(':')) {
                    const [min, max] = answer.split(':').map(parseFloat);
                    if (!isNaN(min) && !isNaN(max)) {
                        questionObj.numericalAnswerRange = { min, max };
                    } else {
                        error = 'Invalid numerical answer range format. Expected "min:max"';
                    }
                } else if (!isNaN(parseFloat(answer))) {
                    const exactValue = parseFloat(answer);
                    questionObj.numericalAnswerRange = {
                        min: exactValue,
                        max: exactValue
                    };
                } else {
                    error = 'Invalid numerical answer format. Expected a number or "min:max"';
                }
            } else {
                error = 'Numerical answer questions require a valid number or range';
            }
        } else if (isMSQ) {
            if (!answer) {
                error = 'Multiple select questions require at least one correct answer';
            } else {
                questionObj.correctAnswers = Array.isArray(answer) ? answer : null;
            }
        } else {
            if (!answer) {
                error = 'Single choice questions require a correct answer';
            } else {
                questionObj.correctAnswer = answer as string || null;
            }
        }

        if (error) {
            errors.push({ error, link });
            continue;
        }

        processedQuestions.push({
            questionObj,
            tagIds,
            subCategory
        });
    }

    return { processedQuestions, errors };
}

export async function createBulkQuestions(processedQuestions: BulkQuestionData[]) {
    if (processedQuestions.length === 0) {
        return [];
    }

    // Insert all questions in bulk
    const questionDocs = processedQuestions.map(q => q.questionObj);
    const newQuestions = await Question.insertMany(questionDocs);

    // Prepare tag updates
    const tagUpdates = new Map<string, Types.ObjectId[]>();

    for (let i = 0; i < processedQuestions.length; i++) {
        const { tagIds } = processedQuestions[i];
        const questionId = newQuestions[i]._id;

        for (const tagId of tagIds) {
            const tagIdStr = tagId.toString();
            if (!tagUpdates.has(tagIdStr)) {
                tagUpdates.set(tagIdStr, []);
            }
            tagUpdates.get(tagIdStr)!.push(questionId as Types.ObjectId);
        }
    }

    // Update tags in bulk
    const tagUpdateOperations = Array.from(tagUpdates.entries()).map(([tagIdStr, questionIds]) => {
        return {
            updateOne: {
                filter: { _id: new Types.ObjectId(tagIdStr) },
                update: { $push: { questions: { $each: questionIds } } }
            }
        };
    });

    if (tagUpdateOperations.length > 0) {
        await QuestionTag.bulkWrite(tagUpdateOperations);
    }

    // Update subcategory counts
    const subCategoryCounts = new Map<string, number>();

    for (const { subCategory } of processedQuestions) {
        if (subCategory) {
            const subCatId = (subCategory._id as Types.ObjectId).toString();
            subCategoryCounts.set(subCatId, (subCategoryCounts.get(subCatId) || 0) + 1);
        }
    }

    const subCategoryUpdateOperations = Array.from(subCategoryCounts.entries()).map(([subCatId, count]) => {
        return {
            updateOne: {
                filter: { _id: new Types.ObjectId(subCatId) },
                update: { $inc: { questionCount: count } }
            }
        };
    });

    if (subCategoryUpdateOperations.length > 0) {
        await SubCategory.bulkWrite(subCategoryUpdateOperations);
    }

    return newQuestions;
} 