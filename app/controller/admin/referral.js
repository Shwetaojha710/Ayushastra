const Helper = require("../../helper/helper");
const Order = require("../../model/order");
const referral_master = require("../../model/referral_master");
const registered_user = require("../../model/registeredusers");
const { Op, fn, col, Sequelize } = require("sequelize");
// const sequelize=require(Sequelize)
const UserMonthPoints = require("../../model/user_month_points");
exports.addReferral = async (req, res) => {
  try {
    const {
      like,
      share,
      new_register,
      prakrati_bonus,
      immunity_bonus,
      referrer,
      referee,
    } = req.body;

    if (
      !like ||
      !share ||
      !new_register ||
      !prakrati_bonus ||
      !immunity_bonus ||
      !referrer ||
      !referee
    ) {
      return Helper.response(false, "All Fields required", {}, res, 401);
    }
    const existing = await referral_master.findOne({
      where: {
        like,
        share,
        new_register,
        prakrati_bonus,
        immunity_bonus,
        referrer_bonus: referrer,
        referee_bonus: referee,
      },
    });
    if (existing) {
      return Helper.response(false, "Data Already Exists", {}, res, 404);
    }
    const CreateReferral = await referral_master.create({
      like,
      share,
      new_register,
      prakrati_bonus,
      immunity_bonus,
      referrer_bonus: referrer,
      referee_bonus: referee,
      createdBy: req.users?.id || null,
    });

    // if (!created) {
    //   await settings.update({
    //     registration_bonus,
    //     like,
    //     share,
    //     new_register,
    //     prakrati_bonus,
    //     immunity_bonus,
    //     referrer_bonus,
    //     referee_bonus,
    //     updatedBy: req.users?.id || null,
    //   });
    // }

    return Helper.response(
      true,
      "Referral settings created successfully",
      CreateReferral,
      res,
      200
    );
  } catch (err) {
    return Helper.response(false, err.message, {}, res, 500);
  }
};

exports.getReferralSettings = async (req, res) => {
  try {
    const settings = await referral_master.findAll({
      order: [["createdAt", "desc"]],
      raw: true,
    });
    if (!settings)
      return Helper.response(
        false,
        "Referral settings not configured yet",
        {},
        res,
        404
      );

    return Helper.response(
      true,
      "Referral settings fetched successfully",
      settings,
      res,
      200
    );
  } catch (err) {
    console.log(err, "error getting referral");

    return Helper.response(false, err.message, {}, res, 500);
  }
};

exports.updateReferral = async (req, res) => {
  try {
    const {
      registration_bonus,
      like,
      share,
      new_register,
      prakrati_bonus,
      immunity_bonus,
      referrer,
      referee,
      id,
    } = req.body;

    if (!id) {
      return Helper.response(false, "Id is Required", {}, res, 401);
    }

    const updateReferral = await referral_master.findOne({
      where: {
        id,
      },
    });

    if (updateReferral) {
      await updateReferral.update({
        registration_bonus,
        like,
        share,
        new_register,
        prakrati_bonus,
        immunity_bonus,
        referrer_bonus: referrer,
        referee_bonus: referee,
        updatedBy: req.users?.id,
      });
      data = updateReferral;
    }

    return Helper.response(
      true,
      "Referral Updated Successfully",
      data,
      res,
      200
    );
  } catch (err) {
    return Helper.response(false, err.message, {}, res, 500);
  }
};

exports.deleteReferral = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return Helper.response(false, "Id is Required", {}, res, 404);
    }

    const ExistsReferral = await referral_master.findOne({
      where: {
        id,
      },
    });
    if (ExistsReferral) {
      return Helper.response(false, "No Data Found", {}, res, 200);
    }
    const deleteReferral = await referral_master.destroy({
      where: {
        id,
      },
    });

    return Helper.response(
      true,
      "Referral Deleted successfully",
      deleteReferral,
      res
    );
  } catch (err) {
    console.log(err);

    return Helper.response(false, err.message, {}, res, 500);
  }
};

exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.users?.id || req.body.user_id; // get logged-in user or passed user_id
    if (!userId) {
      return Helper.response(false, "user_id is required", {}, res, 400);
    }

    const currentMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const currentMonthEnd = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    );

    const totalReferrals = await registered_user.count({
      where: { referred_by: userId, isDeleted: false },
    });

    const referralsThisMonth = await registered_user.count({
      where: {
        referred_by: userId,
        createdAt: {
          [Op.between]: [currentMonthStart, currentMonthEnd],
        },
        isDeleted: false,
      },
    });

    // Get all referral user IDs
    const referralUsers = await registered_user.findAll({
      attributes: ["id"],
      where: { referred_by: userId, isDeleted: false },
      raw: true,
    });

    const referralIds = referralUsers.map((r) => r.id);

    let ordersThisMonth = 0;
    let orderValueThisMonth = 0;

    if (referralIds.length > 0) {
      const orders = await Order.findAll({
        attributes: [
          [fn("COUNT", col("id")), "totalOrders"],
          [fn("SUM", col("total_amount")), "totalValue"],
        ],
        where: {
          user_id: { [Op.in]: referralIds },
          user_type: "registered_user",
          createdAt: {
            [Op.between]: [currentMonthStart, currentMonthEnd],
          },
        },
        raw: true,
      });

      ordersThisMonth = parseInt(orders[0]?.totalOrders || 0);
      orderValueThisMonth = parseFloat(orders[0]?.totalValue || 0);
    }

    // Total Incentive This Month (example: 5% of order value)
    const totalIncentiveThisMonth = (orderValueThisMonth * 0.05).toFixed(2);
    const ayu_cash = await registered_user.findOne({
      where: {
        id: userId,
      },
    });
    const monthlyAyuCash = await UserMonthPoints.findOne({
      attributes: [[fn("SUM", col("ayu_points")), "totalAyuCash"]],
      where: {
        parent_id: userId,
        type: "redeemed",
      },
      raw: true,
    });
    
    const totalAyucashPoint=(ayu_cash?.ayucash_balance - monthlyAyuCash?.totalAyuCash<0) ? 0:ayu_cash?.ayucash_balance - monthlyAyuCash?.totalAyuCash

    // Final Response
    const stats = [
      {
        id: 6,
        title: "AyuCash Points",
        value: `${
         totalAyucashPoint ?? 0
        }`,
        icon: "bi-cash-stack",
        color: "#dc6424",
      },
      {
        id: 1,
        title: "Total Direct Referrals",
        value: totalReferrals,
        icon: "bi-people",
        color: "#a99213",
      },
      {
        id: 2,
        title: "Referrals This Month",
        value: referralsThisMonth,
        icon: "bi-calendar3-event",
        color: "#8e3416",
      },
      {
        id: 3,
        title: "Orders This Month (By Referrals)",
        value: ordersThisMonth,
        icon: "bi-bag-check",
        color: "#aea266",
      },
      {
        id: 4,
        title: "Order Value This Month (By Referrals)",
        value: `${orderValueThisMonth.toLocaleString("en-IN")}`,
        icon: "bi-currency-rupee",
        color: "#618045",
      },
      {
        id: 5,
        title: "Total Incentive This Month",
        value: `0`,
        icon: "bi-cash-stack",
        color: "#384632",
      },
    ];
    
    return Helper.response(true, "Data Found Successfully", stats, res, 200);
  } catch (error) {
    console.log(error, "error: user dahboard");

    return Helper.response(false, error?.message, {}, res, 500);
  }
};

// exports.getReferralList = async (req, res) => {
//   try {
//     const userId = req.users?.id || req.body.user_id;
//     const { type } = req.body;

//     if (!userId) {
//       return Helper.response(false, "user_id is required", {}, res, 400);
//     }

//     const user = await registered_user.findOne({
//       where: { id: userId },
//       raw: true,
//     });

//     if (!user) {
//       return Helper.response(false, "User not found", {}, res, 404);
//     }

//     const month = new Date().getMonth() + 1;
//     const year = new Date().getFullYear();

//     // Full name literal
//     const fullNameLiteral = Sequelize.literal(`first_name || ' ' || last_name`);

//     // ---------------------------------------------------------
//     // Get All Direct Referrals
//     // ---------------------------------------------------------
//     const referredUsers = await registered_user.findAll({
//       where: { referred_by: userId, isDeleted: false },
//       attributes: [
//         "id",
//         [fullNameLiteral, "name"],
//         "email",
//         "mobile",
//         "profile_image",
//         "createdAt",
//       ],
//       raw: true,
//     });

//     const referralIds = referredUsers.map((x) => x.id);

//     // ---------------------------------------------------------
//     // Fetch Orders for referral users
//     // ---------------------------------------------------------
//     const orderData = await Order.findAll({
//       where: { user_id: { [Op.in]: referralIds } },
//       attributes: [
//         "user_id",
//         [fn("COUNT", col("id")), "orderCount"],
//         [fn("SUM", col("total_amount")), "totalValue"],
//       ],
//       group: ["user_id"],
//       raw: true,
//     });

//     const orderMap = {};
//     orderData.forEach((o) => {
//       orderMap[o.user_id] = {
//         orders: Number(o.orderCount),
//         value: Number(o.totalValue),
//       };
//     });

//     // ---------------------------------------------------------
//     // Fetch AYU Points from user_month_points
//     // ---------------------------------------------------------
//     const pointRecords = await UserMonthPoints.findAll({
//       where: { parent_id: userId },
//       raw: true,
//     });

//     // Build AYU point map (child-wise)
//     const ayuPointMap = {};
//     pointRecords.forEach((p) => {
//       if (!p.child_id) return;
//       if (!ayuPointMap[p.child_id]) ayuPointMap[p.child_id] = 0;

//       ayuPointMap[p.child_id] += Number(p.ayu_points);
//     });

//     // Build child full name map
//     const childNames = {};
//     for (const p of pointRecords) {
//       if (p.child_id) {
//         const c = await registered_user.findOne({
//           where: { id: p.child_id },
//           attributes: ["first_name", "last_name"],
//           raw: true,
//         });
//         childNames[p.child_id] = `${c.first_name} ${c.last_name}`;
//       }
//     }

//     let finalList = [];

//     // ---------------------------------------------------------
//     // 1 AYU CASH BALANCE BREAKUP
//     // ---------------------------------------------------------
//     if (type === "AyuCash Balance") {
//       pointRecords.forEach((p) => {
//         if (!p.child_id) {
//           // Self Bonus
//           finalList.push({
//             type: "Register Bonus",
//             month: p.month,
//             year: p.year,
//             points: p.ayu_points,
//           });
//         } else {
//           finalList.push({
//             type: "Referral Bonus",
//             child_user: childNames[p.child_id],
//             month: p.month,
//             year: p.year,
//             points: p.ayu_points,
//           });
//         }
//       });

//       return Helper.response(true, "AyuCash list", finalList, res, 200);
//     }

//     // ---------------------------------------------------------
//     // 2 TOTAL DIRECT REFERRALS
//     // ---------------------------------------------------------
//     if (type === "Total Direct Referrals") {
//       finalList = referredUsers.map((u) => ({
//         id: u.id,
//         name: u.name,
//         email: u.email,
//         mobile: u.mobile,
//         profile_image: u.profile_image,
//         // joined_on: Helper.formatDate(u.createdAt),
//         points: ayuPointMap[u.id] || 0,
//       }));

//       return Helper.response(true, "Referral users list", finalList, res, 200);
//     }

//     // ---------------------------------------------------------
//     // 3 REFERRALS THIS MONTH
//     // ---------------------------------------------------------
//     // ---------------------------------------------------------
//     if (type === "Referrals This Month") {
//       const list = referredUsers
//         .filter((u) => new Date(u.createdAt).getMonth() + 1 === month)
//         .map((u) => ({
//           id: u.id,
//           name: u.name,
//           email: u.email,
//           mobile: u.mobile,
//           profile_image: u.profile_image,
//           points: ayuPointMap[u.id] || 0,
//           month_orders: orderMap[u.id]?.orders || 0,
//           order_value: orderMap[u.id]?.value || 0,
//           incentive: ((orderMap[u.id]?.value || 0) * 0.05).toFixed(2),
//         }));

//       return Helper.response(true, "Referrals this month", list, res, 200);
//     }

//     // -------------------------------------------------------------
//     // 4 ORDERS THIS MONTH (By Referrals)
//     // -------------------------------------------------------------
//     if (type === "Orders This Month (By Referrals)") {
//       finalList = referredUsers.map((u) => ({
//         id: u.id,
//         name: `${u.first_name} ${u.last_name}`,
//         month_orders: orderMap[u.id]?.orders || 0,
//       }));

//       return Helper.response(
//         true,
//         "Orders this month by referrals",
//         finalList,
//         res,
//         200
//       );
//     }

//     // -------------------------------------------------------------
//     // 5 ORDER VALUE THIS MONTH
//     // -------------------------------------------------------------
//     if (type === "Order Value This Month (By Referrals)") {
//       finalList = referredUsers.map((u) => ({
//         id: u.id,
//         name: `${u.first_name} ${u.last_name}`,
//         order_value: orderMap[u.id]?.value || 0,
//       }));

//       return Helper.response(
//         true,
//         "Order value this month",
//         finalList,
//         res,
//         200
//       );
//     }

//     // -------------------------------------------------------------
//     // 6️⃣ TOTAL INCENTIVE THIS MONTH
//     // -------------------------------------------------------------
//     if (type === "Total Incentive This Month") {
//       finalList = referredUsers.map((u) => ({
//         id: u.id,
//         name: `${u.first_name} ${u.last_name}`,
//         incentive: (orderMap[u.id]?.value || 0) * 0.05,
//       }));

//       return Helper.response(
//         true,
//         "Incentives this month",
//         finalList,
//         res,
//         200
//       );
//     }

//     return Helper.response(false, "Invalid type", {}, res, 400);
//   } catch (error) {
//     console.log("Error:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

exports.getReferralList = async (req, res) => {
  try {
    const userId = req.users?.id || req.body.user_id;
    const { type } = req.body;

    if (!userId) {
      return Helper.response(false, "user_id is required", {}, res, 400);
    }

    const user = await registered_user.findOne({
      where: { id: userId },
      raw: true,
    });

    if (!user) {
      return Helper.response(false, "User not found", {}, res, 404);
    }

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    // Full name literal
    const fullNameLiteral = Sequelize.literal(`first_name || ' ' || last_name`);

    // ---------------------------------------------------------
    // Get All Direct Referrals
    // ---------------------------------------------------------
    const referredUsers = await registered_user.findAll({
      where: { referred_by: userId, isDeleted: false },
      attributes: [
        "id",
        [fullNameLiteral, "name"],
        "email",
        "mobile",
        "profile_image",
        "createdAt",
        "type",
      ],
      raw: true,
    });

    const referralIds = referredUsers.map((x) => x.id);

    // ---------------------------------------------------------
    // Fetch Orders for referral users
    // ---------------------------------------------------------
    const orderData = await Order.findAll({
      where: { user_id: { [Op.in]: referralIds } },
      attributes: [
        "user_id",
        [fn("COUNT", col("id")), "orderCount"],
        [fn("SUM", col("total_amount")), "totalValue"],
      ],
      group: ["user_id"],
      raw: true,
    });

    const orderMap = {};
    orderData.forEach((o) => {
      orderMap[o.user_id] = {
        orders: Number(o.orderCount),
        value: Number(o.totalValue),
      };
    });

    // ---------------------------------------------------------
    // Fetch AYU Points from user_month_points
    // ---------------------------------------------------------
    const pointRecords = await UserMonthPoints.findAll({
      where: { parent_id: userId },
      raw: true,
    });

    // Build AYU point map (child-wise)
    const ayuPointMap = {};
    pointRecords.forEach((p) => {
      if (!p.child_id) return;
      if (!ayuPointMap[p.child_id]) ayuPointMap[p.child_id] = 0;

      ayuPointMap[p.child_id] += Number(p.ayu_points);
    });

    // Build child full name map
    const childNames = {};
    for (const p of pointRecords) {
      if (p.child_id) {
        const c = await registered_user.findOne({
          where: { id: p.child_id },
          attributes: ["first_name", "last_name", "type"],
          raw: true,
        });
        // childNames[p.child_id] = `${c.first_name} ${c.last_name}`;
        childNames[p.child_id] = {
          name: `${c.first_name} ${c.last_name}`,
          type: c.type ?? "NA",
        };
      }
    }

    let finalList = [];

    // ---------------------------------------------------------
    // 1 AYU CASH BALANCE BREAKUP
    // ---------------------------------------------------------
    const ayuPoints = await UserMonthPoints.findAll({
      where: {
        [Op.or]: [{ parent_id: userId }, { child_id: userId }],
      },
      raw: true,
    });

    const list = ayuPoints.map((p) => ({
      id: p.id,
      month: p.month,
      year: p.year,
      type: p.child_id ? "Referral Bonus" : "Registration Bonus",
      child_id: p.child_id,
      points: p.ayu_points,
    }));

    if (type == "AyuCash Points") {
      if (pointRecords.length == 0) {
        list.forEach((p) => {
          // Self Bonus
          finalList.push({
            type: "Register Bonus",
            month: p.month,
            year: p.year,
            points: 500,
          });

          finalList.push({
            // type: "Referral Bonus",
            child_user: childNames[p.child_id].name,
            type: childNames[p.child_id]?.type ?? "NA",
            month: p.month,
            year: p.year,
            points: p.points,
          });
        });
      }
      pointRecords.forEach((p) => {
        if (!p.child_id) {
          // Self Bonus
          finalList.push({
            // type: "Register Bonus",
            child_user: "Self",
            type: childNames[p.child_id]?.type ?? "NA",
            month: p.month,
            year: p.year,
            points: p.ayu_points,
            ayu_cash_type: p.type,
          });
        } else {
          finalList.push({
            // type: "Referral Bonus",
            child_user: childNames[p.child_id].name,
            type: childNames[p.child_id].type ?? "NA",
            month: p.month,
            year: p.year,
            points: p.ayu_points,
            ayu_cash_type: p.type,
          });
        }
      });

      return Helper.response(true, "AyuCash list", finalList, res, 200);
    }

    // ---------------------------------------------------------
    // 2 TOTAL DIRECT REFERRALS
    // ---------------------------------------------------------
    if (type == "Total Direct Referrals") {
      finalList = referredUsers.map((u) => ({
        id: u.id,
        child_user: u?.name,
        email: u?.email,
        mobile: u?.mobile,
        profile_image: u?.profile_image,
        // profile_image: u?.profile_image,
        // joined_on: Helper.formatDate(u.createdAt),
        points: ayuPointMap[u.id] || 0,
      }));

      return Helper.response(true, "Referral users list", finalList, res, 200);
    }

    // ---------------------------------------------------------
    // 3 REFERRALS THIS MONTH
    // ---------------------------------------------------------
    // ---------------------------------------------------------
    if (type === "Referrals This Month") {
      const list = referredUsers
        .filter((u) => new Date(u.createdAt).getMonth() + 1 === month)
        .map((u) => ({
          id: u.id,
          child_user: u.name,
          email: u.email,
          mobile: u.mobile,
          profile_image: u.profile_image,
          points: ayuPointMap[u.id] || 0,
          month_orders: orderMap[u.id]?.orders || 0,
          points: orderMap[u.id]?.value || 0,
          incentive: ((orderMap[u.id]?.value || 0) * 0.05).toFixed(2),
        }));

      return Helper.response(true, "Referrals this month", list, res, 200);
    }

    // -------------------------------------------------------------
    // 4 ORDERS THIS MONTH (By Referrals)
    // -------------------------------------------------------------
    if (type == "Orders This Month (By Referrals)") {
      finalList = referredUsers.map((u) => ({
        id: u.id,
        child_user: u?.name ?? "NA",
        type: u?.type ?? "NA",
        points: orderMap[u.id]?.orders || 0,
      }));

      return Helper.response(
        true,
        "Orders this month by referrals",
        finalList,
        res,
        200
      );
    }

    // -------------------------------------------------------------
    // 5 ORDER VALUE THIS MONTH
    // -------------------------------------------------------------
    if (type === "Order Value This Month (By Referrals)") {
      finalList = referredUsers.map((u) => ({
        id: u.id,
        child_user: u.name ?? "NA",
        type: u?.type ?? "NA",
        points: orderMap[u.id]?.value || 0,
      }));

      return Helper.response(
        true,
        "Order value this month",
        finalList,
        res,
        200
      );
    }

    // -------------------------------------------------------------
    // 6️⃣ TOTAL INCENTIVE THIS MONTH
    // -------------------------------------------------------------
    if (type === "Total Incentive This Month") {
      finalList = referredUsers.map((u) => ({
        id: u.id,
        type: `${u?.type}` ?? "NA",
        name: `${u.first_name} ${u.last_name}`,
        incentive: (orderMap[u.id]?.value || 0) * 0.05,
      }));

      return Helper.response(
        true,
        "Incentives this month",
        finalList,
        res,
        200
      );
    }

    return Helper.response(false, "Invalid type", {}, res, 400);
  } catch (error) {
    console.log("Error:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};

// exports.getReferralList = async (req, res) => {
//   try {
//     const userId = req.users?.id || req.body.user_id;
//     const { type } = req.body;

//     if (!userId) {
//       return Helper.response(false, "user_id is required", {}, res, 400);
//     }

//     const user = await registered_user.findOne({
//       where: { id: userId },
//       raw: true
//     });

//     if (!user) {
//       return Helper.response(false, "User not found", {}, res, 404);
//     }

//     const month = new Date().getMonth() + 1;
//     const year = new Date().getFullYear();
//     const fullNameLiteral = Sequelize.literal(`first_name || ' ' || last_name`);

//     // -----------------------------------------------------------
//     // PART 1: USER'S CHILDREN (DIRECT REFERRALS)
//     // -----------------------------------------------------------
//     const directReferrals = await registered_user.findAll({
//       where: { referred_by: userId, isDeleted: false },
//       attributes: [
//         "id",
//         [fullNameLiteral, "name"],
//         "email",
//         "mobile",
//         "profile_image",
//         "createdAt",
//       ],
//       raw: true,
//     });

//     // -----------------------------------------------------------
//     // PART 2: USER'S PARENT (WHO REFERRED THIS USER)
//     // -----------------------------------------------------------
//     let parentUser = null;

//     if (user.referred_by) {
//       parentUser = await registered_user.findOne({
//         where: { id: user.referred_by },
//         attributes: ["id", [fullNameLiteral, "name"], "email", "mobile"],
//         raw: true
//       });
//     }

//     // -----------------------------------------------------------
//     // PART 3: USER'S AYU POINTS (both parent and child)
//     // -----------------------------------------------------------
//     const ayuPoints = await UserMonthPoints.findAll({
//       where: {
//         [Op.or]: [
//           { parent_id: userId },
//           { child_id: userId }
//         ]
//       },
//       raw: true
//     });

//     // -----------------------------------------------------------
//     // PROCESS BASED ON SELECTED TYPE
//     // -----------------------------------------------------------

//     // 🟩 1) AYU CASH BALANCE DETAILS
//     if (type == "AyuCash Balance") {
//       const list = ayuPoints.map(p => ({
//         id: p.id,
//         month: p.month,
//         year: p.year,
//         type: p.child_id ? "Referral Bonus" : "Registration Bonus",
//         child_id: p.child_id,
//         points: p.ayu_points
//       }));

//       return Helper.response(true, "AyuCash list", list, res, 200);
//     }

//     // 🟩 2) TOTAL DIRECT REFERRALS
//     if (type === "Total Direct Referrals") {
//       return Helper.response(true, "Direct referrals", directReferrals, res, 200);
//     }

//     // 🟩 3) USER SHOULD ALSO SEE HIS PARENT
//     if (type === "My Referrer") {
//       if (!parentUser)
//         return Helper.response(true, "No parent found", [], res, 200);

//       return Helper.response(true, "My referrer", parentUser, res, 200);
//     }

//     // 🟩 4) REFERRALS THIS MONTH
//     if (type === "Referrals This Month") {
//       const filtered = directReferrals.filter(u =>
//         new Date(u.createdAt).getMonth() + 1 === month
//       );

//       return Helper.response(true, "Referrals this month", filtered, res, 200);
//     }

//     return Helper.response(false, "Invalid type", {}, res, 400);

//   } catch (error) {
//     console.log("Referral List Error:", error);
//     return Helper.response(false, error.message, {}, res, 500);
//   }
// };

exports.calculateReferralIncentive = async (req, res) => {
  try {
    const userId = req.users?.id; // Mr X

    //  Validate partner eligibility
    const directUsers = await registered_user.count({
      where: { referred_by: userId },
    });
    if (directUsers < 10)
      return Helper.response(
        false,
        "Not enough direct referrals (min 10)",
        [],
        res,
        200
      );

    // Fetch all group users recursively (up to 3 levels)
    const levelAUsers = await registered_user.findAll({
      where: { referred_by: userId },
      attributes: ["id"],
    });
    const levelAIds = levelAUsers.map((u) => u.id);

    const levelBUsers = await registered_user.findAll({
      where: { referred_by: levelAIds },
      attributes: ["id"],
    });
    const levelBIds = levelBUsers.map((u) => u.id);

    const levelCUsers = await registered_user.findAll({
      where: { referred_by: levelBIds },
      attributes: ["id"],
    });
    const levelCIds = levelCUsers.map((u) => u.id);

    const totalGroupUsers = new Set([...levelAIds, ...levelBIds, ...levelCIds])
      .size;
    if (totalGroupUsers < 20)
      return Helper.response(
        false,
        "Not enough group users (min 20)",
        [],
        res,
        200
      );

    // 2️⃣ Check self-purchase ≥ 1000
    const selfPurchase = await Order.sum("total_amount", {
      where: {
        user_id: userId,
        createdAt: {
          [Op.between]: [Helper.startOfMonth(), Helper.endOfMonth()],
        },
      },
    });
    if (selfPurchase < 1000)
      return Helper.response(
        false,
        "Self purchase must be ≥ ₹1000",
        [],
        res,
        200
      );

    // 3️⃣ Calculate Group Purchases (AYUPOINTS)
    const calcGroupTurnover = async (ids) => {
      return await Order.sum("total_amount", {
        where: {
          user_id: ids,
          createdAt: {
            [Op.between]: [Helper.startOfMonth(), Helper.endOfMonth()],
          },
          total_amount: { [Op.gte]: 1000 }, // only valid users
        },
      });
    };

    const groupA = await calcGroupTurnover(levelAIds);
    const groupB = await calcGroupTurnover(levelBIds);
    const groupC = await calcGroupTurnover(levelCIds);

    // 4️⃣ Apply differential incentive %
    const groupIncentives = [
      { group: "A", turnover: groupA, levelPercent: 7, diffPercent: 13 },
      { group: "B", turnover: groupB, levelPercent: 15, diffPercent: 5 },
      { group: "C", turnover: groupC, levelPercent: 18, diffPercent: 2 },
    ];

    let totalIncentive = 0;
    for (const g of groupIncentives) {
      const incentive = (g.turnover * g.diffPercent) / 100;
      totalIncentive += incentive;
    }

    const totalTurnover = groupA + groupB + groupC;

    return Helper.response(
      true,
      "Referral incentive calculated successfully",
      {
        conditions: {
          directUsers,
          totalGroupUsers,
          selfPurchase,
        },
        groupSummary: groupIncentives.map((g) => ({
          ...g,
          incentive: (g.turnover * g.diffPercent) / 100,
        })),
        totalTurnover,
        totalIncentive,
      },
      res,
      200
    );
  } catch (error) {
    return Helper.response(
      false,
      "Error calculating incentive",
      { message: error.message },
      res,
      500
    );
  }
};
