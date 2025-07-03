import QuestionCategory from "./QuestionCategory";
import SubCategory from "./SubCategory";
import QuestionTag from "./QuestionTag";
import Subject from "./Subject";
import Module from "./Module";
import Question from "./Question";
import Topic from "./Topic";
import User from "./User";
import UserQuestionProgress from "./UserQuestionProgress";
import UserTopicProgress from "./UserTopicProgress";

const connectToAll = async () => {
    await Promise.all([
        Module.find({}),
        Question.find({}),
        QuestionCategory.find({}),
        QuestionTag.find({}),
        SubCategory.find({}),
        Subject.find({}),
        Topic.find({}),
        User.find({}),
        UserQuestionProgress.find({}),
        UserTopicProgress.find({})
    ]);
}

export default connectToAll;