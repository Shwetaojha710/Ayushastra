const Helper = require("../../helper/helper");
const sequelize = require("../../connection/connection");
const { col } = require("sequelize");
const prakritiQuiz = require("../../model/prakriti_quiz");
const PrakaritiAnswer = require("../../model/prakriti_answer");
const PrakritiQuestion = require("../../model/prakriti_question");
const PrakritiCategory = require("../../model/prakriti_category");
const PrakritiOption = require("../../model/prakriti_option");
const User = require("../../model/user");
const PrakritiUserResult = require("../../model/prakriti_user_result");
const PrakritiRecommendation = require("../../model/prakriti_recommendations");
// const { options } = require("../../routes/public");
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

// exports.submitprakritiQuiz = async (req, res) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const { answers, data, result } = req.body;

//     if (!answers || Object.keys(answers).length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Answers are required" });
//     }

//     const answerArray = Object.values(answers);

//     const scoreMap = {
//       Never: 1,
//       Rarely: 2,
//       Often: 3,
//       Always: 4,
//       NEVER: 1,
//       NORMAL: 3,
//       "Very Strong": 4,
//       Overweight: 2,
//     };

//     let totalScore = 0;

//     const quiz = await prakritiQuiz.create(
//       {
//         mobile: data?.mobileNumber,
//         fullName: data?.fullName,
//         email: data?.email.toLowerCase(),
//         quiz_type: "Immunity - Mind Body Type 2",
//         total_score: 0,
//         percentage: 0,
//         result_label: result || "Pending",
//       },
//       { transaction }
//     );

//     for (const ans of answerArray) {
//       const score = scoreMap[ans.Answer] || 0;
//       totalScore += score;

//       await PrakaritiAnswer.create(
//         {
//           quiz_id: quiz.id,
//           question_id: ans.questionId,
//           selected_option: ans.Answer,
//           question_text: ans?.question,
//           score: score,
//         },
//         { transaction }
//       );
//     }

//     const maxScore = answerArray.length * 4;
//     const percentage = ((totalScore / maxScore) * 100).toFixed(2);

//     let resultLabel = result;

//     await quiz.update(
//       {
//         total_score: totalScore,
//         percentage,
//         result_label: resultLabel,
//       },
//       { transaction }
//     );

//     await transaction.commit();
//     return Helper.response(
//       true,
//       "Prakirity Quiz submitted successfully",
//       {
//         quiz_id: quiz.id,
//         fullName: data?.fullName || null,
//         email: data?.email || null,
//         mobile: data?.mobileNumber || data?.mobileNumber || null,
//         total_score: totalScore,
//         percentage,
//         result_label: resultLabel,
//       },
//       res,
//       200
//     );
//   } catch (error) {
//     await transaction.rollback();
//     console.error("Error saving Prakirity quiz:", error);
//     return Helper.response(false, error?.message, {}, res, 200);
//   }
// };

exports.submitprakritiQuiz = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { answers, userInfo } = req.body;

    if (!answers || !userInfo) {
      return Helper.response(false, "Invalid payload", {}, res, 400);
    }

    const optionIds = Object.values(answers);

    const options = await PrakritiOption.findAll({
      where: { id: optionIds },
      attributes: ["id", "dosha"],
      raw: true,
    });

    if (options.length !== optionIds.length) {
      return Helper.response(false, "Invalid option selected", {}, res, 400);
    }

    /* -----------------------------
       STEP 2: CALCULATE SCORES
    ----------------------------- */
    let score = { V: 0, P: 0, K: 0 };

    options.forEach((opt) => {
      score[opt.dosha] += 1;
    });

    /* -----------------------------
       STEP 3: PRAKRITI DECISION LOGIC
    ----------------------------- */
    const { V, P, K } = score;
    let prakritiType = "";

    if (Math.abs(V - P) <= 2 && Math.abs(P - K) <= 2 && Math.abs(V - K) <= 2) {
      prakritiType = "TRIDOSHA";
    } else if (V >= P + 3 && V >= K + 3) {
      prakritiType = "VATA";
    } else if (P >= V + 3 && P >= K + 3) {
      prakritiType = "PITTA";
    } else if (K >= V + 3 && K >= P + 3) {
      prakritiType = "KAPHA";
    } else {
      const sorted = Object.entries(score)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map((i) => i[0])
        .join("-");
      prakritiType = sorted; // V-P / P-K / V-K
    }

    /* -----------------------------
       STEP 4: SAVE USER (OPTIONAL)
    ----------------------------- */

    /* -----------------------------
       STEP 5: SAVE RESULT
    ----------------------------- */
    await PrakritiUserResult.create(
      {
        // user_id: user.id,
        name: userInfo.fullName,
        email: userInfo.email,
        mobile: userInfo.mobileNumber,
        v_score: V,
        p_score: P,
        k_score: K,
        prakriti_type: prakritiType,
        user_id: req?.users?.id,
      },
      { transaction: t }
    );

    const data = await Helper.getPrakritiRecommendations(prakritiType);

    await t.commit();

    return Helper.response(
      true,
      "Prakriti calculated successfully",
      {
        user: userInfo,
        score: {
          Vata: V,
          Pitta: P,
          Kapha: K,
        },
        prakriti_type: prakritiType,
        result: data,
      },
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error("Prakriti Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.getPrakritiResults = async (req, res) => {
  try {
    const user_id = req.users.id;
    let { page, limit } = req.body;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;
    let { count, rows: quizzes } = await PrakritiUserResult.findAndCountAll({
      // where: { user_id },
      attributes: [
        "id",
        [col("name"), "fullName"],
        "email",
        "mobile",
        [col("prakriti_type"), "result"],
        "k_score",
        "p_score",
        "v_score",
        [col("created_at"), "createdAt"],
      ],
      order: [["id", "DESC"]], // or created_at
      raw: true,
      limit,
      offset,
    });

    if (!quizzes) {
      return Helper.response(false, "Result not found", {}, res, 404);
    }
    quizzes = quizzes.map((quiz) => ({
      ...quiz,
      date: Helper.dateFormat(quiz.createdAt),
    }));
    // const recommendations = await PrakritiRecommendation.findAll({
    //   where: { prakriti_type: result.prakriti_type },
    //   raw: true,
    // });

    // const grouped = {};
    // recommendations.forEach(r => {
    //   if (!grouped[r.section]) grouped[r.section] = [];
    //   grouped[r.section].push({
    //     title: r.title,
    //     description: r.description,
    //   });
    // });
    const totalPages = Math.ceil(count / limit);
    return Helper.response(
      true,
      "Prakriti result fetched",
      // {
      //   score: {
      //     Vata: result.v_score,
      //     Pitta: result.p_score,
      //     Kapha: result.k_score,
      //   },
      //   prakriti_type: result.prakriti_type,
      //   guidance: grouped,
      // },
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
    console.error(error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

// exports.getPrakritiResults = async (req, res) => {
//   try {
//     // pagination setup
//     let { page, limit } = req.query;
//     page = parseInt(page) || 1;
//     limit = parseInt(limit) || 10;
//     const offset = (page - 1) * limit;

//     // Fetch all quizzes with pagination
//     let { count, rows: quizzes } = await prakritiQuiz.findAndCountAll({
//       order: [["createdAt", "DESC"]],
//       offset,
//       limit,
//       raw: true,
//       attributes: [
//         "id",
//         "mobile",
//         "email",
//         "fullName",
//         "total_score",
//         "percentage",
//         [col("result_label"), "result"],
//         "createdAt",
//       ],
//     });

//     if (!quizzes.length) {
//       return Helper.response(false, "No Prakirity results found", {}, res, 404);
//     }

//     // Format dates using your Helper.dateFormat function
//     quizzes = quizzes.map((quiz) => ({
//       ...quiz,
//       date: Helper.dateFormat(quiz.createdAt),
//     }));
//     // // Fetch all quiz IDs
//     // const quizIds = quizzes.map(q => q.id);

//     // // Fetch answers for all quizzes in one go
//     // const answers = await PrakaritiAnswer.findAll({
//     //   where: { quiz_id: quizIds },
//     //   attributes: ["quiz_id", "question_id", "selected_option", "score"],
//     //   raw: true,
//     // });

//     // // Group answers by quiz_id
//     // const answersByQuiz = answers.reduce((acc, ans) => {
//     //   if (!acc[ans.quiz_id]) acc[ans.quiz_id] = [];
//     //   acc[ans.quiz_id].push(ans);
//     //   return acc;
//     // }, {});

//     // Combine quizzes + their answers
//     // const resultData = quizzes.map(q => ({
//     //   ...q,
//     //   answers: answersByQuiz[q.id] || [],
//     // }));

//     // Pagination metadata
//     const totalPages = Math.ceil(count / limit);

//     return Helper.response(
//       true,
//       "Prakirity results fetched successfully",
//       {
//         currentPage: page,
//         totalPages,
//         totalRecords: count,
//         pageSize: limit,
//         results: quizzes,
//       },
//       res,
//       200
//     );
//   } catch (error) {
//     console.error("Error fetching Prakirity results:", error);
//     return Helper.response(false, error?.message, {}, res, 500);
//   }
// };

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

exports.CreatePrakiritQues = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      category_id,
      question,
      question_hint,
      option_one,
      option_two,
      option_three,
    } = req.body;

    if (
      !category_id ||
      !question ||
      !option_one /list-prakrity-questions||
      !option_two ||
      !option_three
    ) {
      return Helper.response(false, "Invalid payload", {}, res, 400);
    }

    const createdQuestion = await PrakritiQuestion.create(
      {
        prakriti_category_id: category_id,
        question,
        question_hint,
      },
      { transaction: t }
    );

    const optionData = [
      {
        question_id: createdQuestion.id,
        option_label: option_one,
        dosha: "V",
        value: 1,
      },
      {
        question_id: createdQuestion.id,
        option_label: option_two,
        dosha: "P",
        value: 1,
      },
      {
        question_id: createdQuestion.id,
        option_label: option_three,
        dosha: "K",
        value: 1,
      },
    ];

    await PrakritiOption.bulkCreate(optionData, { transaction: t });

    await t.commit();

    return Helper.response(
      true,
      "Prakriti question and options saved successfully",
      createdQuestion,
      res,
      201
    );
  } catch (error) {
    await t.rollback();
    console.error(error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.updatePrakritiQues = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      id,
      category_id,
      question,
      question_hint,
      status,
      option_one,
      option_two,
      option_three,
    } = req.body;

    if (!id) {
      return Helper.response(false, "Question id is required", {}, res, 400);
    }

    // ---------------- FIND QUESTION ----------------
    const prakritiQues = await PrakritiQuestion.findOne({
      where: { id },
      transaction: t,
    });

    if (!prakritiQues) {
      return Helper.response(false, "Question not found", {}, res, 404);
    }

    // ---------------- UPDATE QUESTION ----------------
    await prakritiQues.update(
      {
        prakriti_category_id:
          category_id ?? prakritiQues.prakriti_category_id,
        question: question ?? prakritiQues.question,
        question_hint: question_hint ?? prakritiQues.question_hint,
        status: status ?? prakritiQues.status,
        updatedBy: req.users?.id,
      },
      { transaction: t }
    );

    // ---------------- UPDATE OPTIONS ----------------
    const options = await PrakritiOption.findAll({
      where: { question_id: id },
      transaction: t,
    });

    for (const opt of options) {
      if (opt.dosha === "V" && option_one) {
        opt.option_label = option_one;
      }
      if (opt.dosha === "P" && option_two) {
        opt.option_label = option_two;
      }
      if (opt.dosha === "K" && option_three) {
        opt.option_label = option_three;
      }
      await opt.save({ transaction: t });
    }

    await t.commit();

    return Helper.response(
      true,
      "Prakriti question updated successfully",
      {},
      res,
      200
    );
  } catch (error) {
    await t.rollback();
    console.error("Update Prakriti Question Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};


exports.getPrakritiQuestionList = async (req, res) => {
  try {
    // const { category_id } = req.body;

    // const whereCondition = {};
    // if (category_id) {
    //   whereCondition.prakriti_category_id = category_id;
    // }

    const questions = await PrakritiQuestion.findAll({
      // where: whereCondition,
      attributes: [
        ["prakriti_category_id", "category_id"],
        "question",
        "question_hint",
        "status",
        "id",
      ],
      raw: true,
      order: [["id", "ASC"]],
    });
    const finalData = await Promise.all(
      questions.map(async (q) => {
        const option = q.id
          ? await PrakritiOption.findAll({
              where: {
                question_id: q?.id,
              },
              raw: true,
            })
          : null;

        // fetch category (ONLY if id exists)
        const category = q.category_id
          ? await PrakritiCategory.findOne({
              where: { id: q.category_id },
              attributes: ["category_name"],
              raw: true,
            })
          : null;
        return {
          category_id: q.category_id,
          id: q.id,
          category_name: category?.category_name ?? null,
          status: q?.status ?? null,
          question: q.question,
          question_hint: q.question_hint,
          option_one: option?.[0]?.option_label || null,
          option_two: option?.[1]?.option_label || null,
          option_three: option?.[2]?.option_label || null,
        };
      })
    );

    return Helper.response(
      true,
      "Prakriti questions fetched successfully",
      finalData,
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching prakriti questions:", error);
    return Helper.response(false, error.message, [], res, 500);
  }
};

exports.CreatePrakritiCategory = async (req, res) => {
  try {
    const { name, status = true } = req.body;

    if (!name) {
      return Helper.response(
        false,
        "PrakritiCategory is required",
        [],
        res,
        400
      );
    }
    const existingdepartment = await PrakritiCategory.findOne({
      where: { category_name: name },
    });
    if (existingdepartment) {
      return Helper.response(
        false,
        "PrakritiCategory name already exists",
        [],
        res,
        409
      );
    }

    const unit = await PrakritiCategory.create({
      category_name: name,
      status,
      createdBy: req.users.id,
    });
    return Helper.response(
      true,
      "PrakritiCategory added successfully",
      unit,
      res,
      201
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error adding PrakritiCategory",
      res,
      500
    );
  }
};

exports.getAllPrakritiCategory = async (req, res) => {
  try {
    const Units = await PrakritiCategory.findAll({
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No PrakritiCategory found", [], res, 404);
    }
    return Helper.response(
      true,
      "PrakritiCategory fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching PrakritiCategory",
      res,
      500
    );
  }
};

exports.getAllPrakritiCategoryDD = async (req, res) => {
  try {
    const Units = await PrakritiCategory.findAll({
      attributes: [
        [col("id"), "value"],
        [col("category_name"), "label"],
      ],
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    if (Units.length === 0) {
      return Helper.response(false, "No PrakritiCategory found", [], res, 404);
    }
    return Helper.response(
      true,
      "PrakritiCategory fetched successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error fetching PrakritiCategory",
      res,
      500
    );
  }
};

exports.updatePrakritiCategory = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    if (!id) {
      return Helper.response(false, "ID is required", [], res, 400);
    }
    // if (!name) {
    //   return Helper.response(false, "Salt name is required", [], res, 400);
    // }

    const Units = await PrakritiCategory.findByPk(id);
    if (!Units) {
      return Helper.response(false, "PrakritiCategory not found", [], res, 404);
    }

    Units.category_name = name || Units.category_name;
    Units.status = status;
    Units.updatedBy = req.users.id;
    await Units.save();
    return Helper.response(
      true,
      "PrakritiCategory updated successfully",
      Units,
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      error.message,
      "Error updating PrakritiCategory",
      res,
      500
    );
  }
};

// exports.CreatePrakritiCategory=async(req,res)=>{
//  try {

//    await PrakritiCategory.bulkCreate([
//    { category_name: "BODY FEATURES (Sharirik Prakriti)" },
//    { category_name: "MIND & PERSONALITY (Mansik Prakriti)" },
//    { category_name: "LIFESTYLE & HABITS" }
//    ]);

//   return Helper.response(true,"Prakriti Question Created Successfully",{},res,200)
//  } catch (error) {
//   console.error("Error fetching Prakirity results:", error);
//     return Helper.response(false, error?.message, {}, res, 500);
//  }
// }

exports.CreatePrakritiOption = async (req, res) => {
  try {
    await PrakritiOption.bulkCreate([
      { question_id: 1, option_label: "Thin / Lean", dosha: "V" },
      { question_id: 1, option_label: "Medium / Athletic", dosha: "P" },
      { question_id: 1, option_label: "Broad / Sturdy", dosha: "K" },
    ]);

    return Helper.response(
      true,
      "PrakritiOption Created Successfully",
      {},
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching PrakritiOption:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.getPrakritiQuestion = async (req, res) => {
  try {
    const categories = await PrakritiCategory.findAll({
      attributes: ["id", "category_name"],
      raw: true,
    });

    if (!categories.length) {
      return Helper.response(false, "No categories found", {}, res, 200);
    }

    const questions = await PrakritiQuestion.findAll({
      attributes: ["id", "prakriti_category_id", "question"],
      raw: true,
    });

    const options = await PrakritiOption.findAll({
      attributes: ["id", "question_id", "option_label", "dosha", "value"],
      raw: true,
    });

    const questionMap = {};
    questions.forEach((q) => {
      if (!questionMap[q.prakriti_category_id]) {
        questionMap[q.prakriti_category_id] = [];
      }
      questionMap[q.prakriti_category_id].push({
        id: q.id,
        question: q.question,
        options: [],
      });
    });

    const optionMap = {};
    options.forEach((o) => {
      if (!optionMap[o.question_id]) {
        optionMap[o.question_id] = [];
      }
      optionMap[o.question_id].push({
        id: o.id,
        option_label: o.option_label,
        dosha: o.dosha,
        value: o.value,
      });
    });

    Object.values(questionMap)
      .flat()
      .forEach((q) => {
        q.options = optionMap[q.id] || [];
      });

    const finalData = categories.map((cat) => ({
      category_id: cat.id,
      category_name: cat.category_name,
      questions: questionMap[cat.id] || [],
    }));

    return Helper.response(
      true,
      "Prakriti questions fetched successfully",
      finalData,
      res,
      200
    );
  } catch (error) {
    console.error("Error fetching Prakriti Questions:", error);
    return Helper.response(false, error?.message, {}, res, 500);
  }
};



exports.savePrakritiRecommendationBulk = async (req, res) => {
  try {
    const { prakriti_type, data, recommended_products } = req.body;

    if (!prakriti_type) {
      return Helper.response(false, "prakriti_type is required", {}, res, 400);
    }

    if (!Array.isArray(data) || !data.length) {
      return Helper.response(false, "data array is required", {}, res, 400);
    }

  
    const normalizedPrakriti = prakriti_type.toUpperCase().replace(/\s+/g, "-"); 

  
    const rows = data.map((item) => {
      if (!item.section) {
        throw new Error("section is required in data item");
      }

      return {
        prakriti_type: normalizedPrakriti,
        section: item.section.toUpperCase(), // AAHAR / VIHAR / CHIKITSA
        title: normalizedPrakriti,
        description: recommended_products
          ? JSON.stringify(recommended_products)
          : null,
        prefer: Array.isArray(item.prefer)
          ? JSON.stringify(item.prefer)
          : null,
        avoid: Array.isArray(item.avoid)
          ? JSON.stringify(item.avoid)
          : null,
      };
    });


    await PrakritiRecommendation.destroy({
      where: { prakriti_type: normalizedPrakriti },
    });

 
    await PrakritiRecommendation.bulkCreate(rows);

    return Helper.response(
      true,
      "Prakriti recommendations saved successfully",
      { total_sections: rows.length },
      res,
      201
    );
  } catch (error) {
    console.error("Bulk Save Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

exports.getPrakritiRecommendationByType = async (req, res) => {
  try {
      const data = await PrakritiRecommendation.findAll({
      order: [["prakriti_type", "ASC"], ["id", "ASC"]],
      raw: true,
    });

    if (!data.length) {
      return Helper.response(true, "No data found", [], res, 200);
    }

    // Safe JSON parse (handles old + new data)
    const safeParse = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;

      if (typeof value == "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return [value]; // fallback for plain text
        }
      }
      return [];
    };

    const result = {};

    data.forEach((item) => {
      const prakriti = item.prakriti_type?.toUpperCase().trim();
      const section = item.section?.toUpperCase().trim();

      if (!prakriti || !section) return;

      // Init prakriti
      if (!result[prakriti]) {
        result[prakriti] = {
          title: prakriti,
          AAHAR: [],
          VIHAR: [],
          CHIKITSA: [],
          status:item?.status??true
        };
      }

      if (!result[prakriti][section]) return;

      result[prakriti][section].push({
        title: item.title,
        description: safeParse(item.description),
        prefer: safeParse(item.prefer),
        avoid: safeParse(item.avoid),
      });
    });

    const finalResponse = Helper.mergePrakritiData(Object.values(result));

    return Helper.response(
      true,
      "All prakriti recommendations fetched successfully",
     finalResponse,
      res,
      200
    );
  } catch (error) {
    console.error("Fetch Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

