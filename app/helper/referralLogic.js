const referral_master = require("../model/referral_master");
const registered_user = require("../model/registeredusers");
const UserMonthPoints = require("../model/user_month_points");

const applyReferralLogic = async ({
  newUser,
  referralCode,
  transaction,
}) => {
  // 1️⃣ Get latest referral master config
  const referralMaster = await referral_master.findOne({
    order: [["createdAt", "desc"]],
    transaction,
  });

  const newRegisterBonus = Number(referralMaster?.new_register || 500);
  const refereeBonus = Number(referralMaster?.referee_bonus || 250);
  const referrerBonus = Number(referralMaster?.referrer_bonus || 250);

  let referrerUser = null;
  let newUserBalance = newRegisterBonus; // default = 500

  // 2️⃣ If referral code provided
  if (referralCode) {
    referrerUser = await registered_user.findOne({
      where: {
        referral_code: referralCode,
        isDeleted: false,
      },
      transaction,
    });

    // If valid referrer found
    if (referrerUser) {
      newUserBalance = newRegisterBonus + refereeBonus; // 500 + 250 = 750
    }
  }

  // 3️⃣ Update NEW USER balance & referred_by
  await newUser.update(
    {
      ayucash_balance: newUserBalance,
      referred_by: referrerUser?.id || null,
    },
    { transaction }
  );

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  // 4️⃣ Insert user_month_points + update referrer balance
  if (referrerUser) {
    // Entry for NEW USER (referee)
    await UserMonthPoints.create(
      {
        parent_id: referrerUser.id,
        child_id: newUser.id,
        month,
        year,
        ayu_points: refereeBonus, // 250
      },
      { transaction }
    );

    // 🔥 UPDATE REFERRER AYUCASH BALANCE (+250)
    await registered_user.update(
      {
        ayucash_balance:
          Number(referrerUser.ayucash_balance || 0) + referrerBonus,
      },
      {
        where: { id: referrerUser.id },
        transaction,
      }
    );
  } else {
    // Entry for NEW USER without referral
    await UserMonthPoints.create(
      {
        parent_id: newUser.id,
        child_id: null,
        month,
        year,
        ayu_points: newRegisterBonus, // 500
      },
      { transaction }
    );
  }

  return true;
};

module.exports = { applyReferralLogic };

