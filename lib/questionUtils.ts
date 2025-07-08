import { IQuestionTag, QuestionTag } from '@/models/QuestionTag';
import { QuestionCategory } from '@/models/QuestionCategory';
import { SubCategory } from '@/models/SubCategory';
import { Question } from '@/models/Question';
import { Types, Document } from 'mongoose';
import mongoose from 'mongoose';
import { IExamBranches } from '@/models/ExamBranches';

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
    questionsData: QuestionBaseData[], examBranches: IExamBranches[]
): Promise<{
    processedQuestions: BulkQuestionData[];
    errors: { error?: string; yearError?: string; link?: string }[];
    inActiveTagsErrors: { inActiveTags: string[]; link?: string }[];
}> {
    const examBranchTags: Record<string, string[]> = {};

    for (const examBranch of examBranches)
        examBranchTags[examBranch.name] = examBranch.examTagNames;

    const processedQuestions: BulkQuestionData[] = [];
    const errors: { error?: string; yearError?: string; link?: string }[] = [];
    let inActiveTags: string[] = [];
    const inActiveTagsErrors: { inActiveTags: string[]; link?: string }[] = [];

    console.log("Getting categories and tags");

    // Get all categories and tags first to minimize DB calls
    const categoryNames = [...new Set(questionsData.map(q => q.category.toLowerCase().split(' ').join('-')))];
    const allCategories = await QuestionCategory.find({ name: { $in: categoryNames } });

    // Extract all tag names
    const allTagNames = [...new Set(questionsData.flatMap(q => q.tags || []))];
    const existingTags = await QuestionTag.find({ name: { $in: allTagNames } });

    // Create missing tags in bulk
    const existingTagNames = existingTags.map(tag => tag.name);
    const missingTagNames = allTagNames.filter(name => !existingTagNames.includes(name));

    console.log("Getting missing tags");

    let newTags: Document[] = [];
    if (missingTagNames.length > 0) {
        newTags = await QuestionTag.insertMany(
            missingTagNames.map(name => ({ name, questions: [] }))
        );
    }

    console.log("Combining existing and new tags");

    // Combine existing and new tags
    const allTags = [...existingTags, ...newTags];

    console.log("Getting question count");

    // Get question count once for numbering
    const baseQuestionNumber = 100000 + (await Question.countDocuments()) * 3;

    // Process each question
    //TODO: We need to optimize it
    for (let i = 0; i < questionsData.length; i++) {
        if (i % 50 == 0)
            console.log("Processing question", i, "of", questionsData.length);

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

        // Get subject for the category
        const subject = await mongoose.model('Subject').findById(questionCategory.subject);
        if (!subject) {
            errors.push({
                error: `Subject not found for category '${category}'`,
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

            inActiveTags = tags.filter(tag => !(allTags.find(t => (t as IQuestionTag).name === tag)?.isActive));
            if (inActiveTags.length > 0) {
                inActiveTagsErrors.push({
                    inActiveTags,
                    link
                });
                continue;
            }
        }

        // Find subcategory
        let subCategory = await SubCategory.findOne({
            $and: [
                { name: { $in: tags } },
                { name: { $ne: questionCategory.name } },
                { questionCategories: { $in: questionCategory._id } }
            ]
        });

        if (!subCategory)
            subCategory = await SubCategory.findOne({
                $and: [
                    { name: { $in: questionCategory.name } },
                    { questionCategories: { $in: questionCategory._id } }
                ]
            });

        if (!subCategory) {
            errors.push({
                error: `Subcategory not found for question '${title}'`,
                link
            });
            continue;
        }

        // Determine question type
        const isMSQ = tags?.includes('multiple-selects');
        const isNAT = tags?.includes('numerical-answers');
        const isDescriptive = tags?.includes('descriptive');

        // Extract year from tags if available
        let year = null;
        if (Array.isArray(tags)) {
            for (const tag of tags) {
                // Extract first 4-digit number from the tag
                const match = tag.match(/\d{4}/);
                if (match) {
                    if (examBranchTags['gatecse'].includes(tag)) {
                        year = parseInt(match[0]);
                        break;
                    }
                }
            }
        }

        // Create question object
        const questionObj: Record<string, unknown> = {
            title,
            content,
            subCategory: subCategory?._id,
            subCategoryName: subCategory?.name,
            questionCategory: questionCategory._id,
            questionCategoryName: questionCategory.name,
            subjectName: subject.name,
            tags: tagIds,
            isActive: isActive || true,
            link,
            questionNumber: baseQuestionNumber + (i + 1) * 3 + Math.floor(Math.random() * 3)
        };

        // Check if year was found
        if (year) {
            questionObj.year = year;
        } else {
            errors.push({
                yearError: `No year tag (containing a 4-digit number) found for question '${title}'`,
                link
            });
            continue; // Skip this question and continue with the next one
        }

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
            questionObj.correctAnswer = answer as string || "N/A";
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

    console.log("Processed questions in bulk");

    return { processedQuestions, errors, inActiveTagsErrors };
}

export async function createBulkQuestions(processedQuestions: BulkQuestionData[]) {
    if (processedQuestions.length === 0) {
        return [];
    }

    console.log("Creating questions in bulk");

    // Insert all questions in bulk
    const questionDocs = processedQuestions.map(q => q.questionObj);
    const newQuestions = await Question.insertMany(questionDocs);

    console.log("Created questions in bulk");

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