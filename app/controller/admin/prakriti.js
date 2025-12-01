const Helper = require("../../helper/helper");
const sequelize = require("../../connection/connection");
const { col } = require("sequelize");
const prakritiQuiz = require("../../model/prakriti_quiz");
const PrakaritiAnswer = require("../../model/prakriti_answer");
const SCORE_MAP = { never: 0, rarely: 1, often: 2, always: 3 };

// exports.submitprakritiQuiz = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { userId, answers } = req.body;
//     if (!answers || !Array.isArray(answers) || answers.length === 0) {
//         return Helper.response(false,'Answers required.',{},res,200)
//     }

//     let totalScore = 0;
//     const processed = answers.map(a => {
//       const key = a.answer.trim().toLowerCase();
//       const score = SCORE_MAP[key] ?? 0;
//       totalScore += score;
//       return { question_id: a.questionId, selected_option: a.answer, score };
//     });

//     const maxScore = answers.length * 3;
//     const percentage = (totalScore / maxScore) * 100;
//     const label =
//       percentage <= 25 ? 'Low immunity' :
//       percentage <= 50 ? 'Below average' :
//       percentage <= 75 ? 'Good' : 'Excellent';

//     const quiz = await prakritiQuiz.create({
//       user_id: userId || null,
//       total_score: totalScore,
//       percentage,
//       result_label: label,
//     }, { transaction: t });

//     for (const ans of processed) {
//       await PrakaritiAnswer.create({ quiz_id: quiz.id, ...ans }, { transaction: t });
//     }

//     await t.commit();
//     return Helper.response(true,'Quiz submitted successfully.', { quizId: quiz.id, result: label, percentage },res,200)

//   } catch (err) {
//     await t.rollback();
//     console.error(err,"immunity quiz");
//     return Helper.response(false,err?.message,{},res,500)
//   }
// };

exports.submitprakritiQuiz = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { answers, data, result } = req.body;

    if (!answers || Object.keys(answers).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Answers are required" });
    }

    const answerArray = Object.values(answers);

    const scoreMap = {
      Never: 1,
      Rarely: 2,
      Often: 3,
      Always: 4,
      NEVER: 1,
      NORMAL: 3,
      "Very Strong": 4,
      Overweight: 2,
    };

    let totalScore = 0;

    const quiz = await prakritiQuiz.create(
      {
        mobile: data?.mobileNumber,
        fullName: data?.fullName,
        email: data?.email.toLowerCase(),
        quiz_type: "Immunity - Mind Body Type 2",
        total_score: 0,
        percentage: 0,
        result_label: result || "Pending",
      },
      { transaction }
    );

    for (const ans of answerArray) {
      const score = scoreMap[ans.Answer] || 0;
      totalScore += score;

      await PrakaritiAnswer.create(
        {
          quiz_id: quiz.id,
          question_id: ans.questionId,
          selected_option: ans.Answer,
          question_text: ans?.question,
          score: score,
        },
        { transaction }
      );
    }

    const maxScore = answerArray.length * 4;
    const percentage = ((totalScore / maxScore) * 100).toFixed(2);

    let resultLabel = result;

    await quiz.update(
      {
        total_score: totalScore,
        percentage,
        result_label: resultLabel,
      },
      { transaction }
    );

    await transaction.commit();
    return Helper.response(
      true,
      "Prakirity Quiz submitted successfully",
      {
        quiz_id: quiz.id,
        fullName: data?.fullName || null,
        email: data?.email || null,
        mobile: data?.mobileNumber || data?.mobileNumber || null,
        total_score: totalScore,
        percentage,
        result_label: resultLabel,
      },
      res,
      200
    );
  } catch (error) {
    await transaction.rollback();
    console.error("Error saving Prakirity quiz:", error);
    return Helper.response(false, error?.message, {}, res, 200);
  }
};

exports.getPrakritiResults = async (req, res) => {
  try {
    // pagination setup
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    // Fetch all quizzes with pagination
    let { count, rows: quizzes } = await prakritiQuiz.findAndCountAll({
      order: [["createdAt", "DESC"]],
      offset,
      limit,
      raw: true,
      attributes: [
        "id",
        "mobile",
        "email",
        "fullName",
        "total_score",
        "percentage",
        [col("result_label"), "result"],
        "createdAt",
      ],
    });

    if (!quizzes.length) {
      return Helper.response(false, "No Prakirity results found", {}, res, 404);
    }

    // Format dates using your Helper.dateFormat function
    quizzes = quizzes.map((quiz) => ({
      ...quiz,
      date: Helper.dateFormat(quiz.createdAt),
    }));
    // // Fetch all quiz IDs
    // const quizIds = quizzes.map(q => q.id);

    // // Fetch answers for all quizzes in one go
    // const answers = await PrakaritiAnswer.findAll({
    //   where: { quiz_id: quizIds },
    //   attributes: ["quiz_id", "question_id", "selected_option", "score"],
    //   raw: true,
    // });

    // // Group answers by quiz_id
    // const answersByQuiz = answers.reduce((acc, ans) => {
    //   if (!acc[ans.quiz_id]) acc[ans.quiz_id] = [];
    //   acc[ans.quiz_id].push(ans);
    //   return acc;
    // }, {});

    // Combine quizzes + their answers
    // const resultData = quizzes.map(q => ({
    //   ...q,
    //   answers: answersByQuiz[q.id] || [],
    // }));

    // Pagination metadata
    const totalPages = Math.ceil(count / limit);

    return Helper.response(
      true,
      "Prakirity results fetched successfully",
      {
        currentPage: page,
        totalPages,
        totalRecords: count,
        pageSize: limit,
        results: quizzes,
      },
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching Prakirity results:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.getPrakritiAnswer = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return Helper.response(false, "Id Is Required!", {}, res, 200);
    }

    const answers = await PrakaritiAnswer.findAll({
      where: { quiz_id: id },
      attributes: [
        "quiz_id",
        "question_id",
        [col("question_text"), "question"],
        "selected_option",
        "score",
      ],
      raw: true,
    });

    return Helper.response(
      true,
      "Prakirity results fetched successfully",
      answers,
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching Prakirity results:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};
