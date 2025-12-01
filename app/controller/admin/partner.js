const Helper = require("../../helper/helper");
const Partner = require("../../model/partner");

exports.createPartner = async (req, res) => {
  try {
    const { name, email, mobile, address, country, message, terms } = req.body;

    if (!name || !email || !mobile || !country || !message || !terms) {
      return Helper.response(false, "All Fields are required", {}, res, 404);
    }

    const partner = await Partner.create({
      name,
      email,
      mobile,
      address,
      country,
      message,
      terms,
    });

    return Helper.response(
      true,
      "Partner Registered Successfully",
      partner,
      res,
      200
    );
  } catch (error) {
    console.log("error:", error);

    return Helper.response(false, error?.message, {}, res, 500);
  }
};

exports.getPartnerList = async (req, res) => {
  try {
    const user = await Partner.findAll({
      order: [["createdAt", "desc"]],
      raw: true,
    });

    if (user.length == 0) {
      return Helper.response(false, "No Data Found", [], res, 200);
    }
    return Helper.response(true, "Data Found Successfully", user, res, 200);
  } catch (error) {
    console.error("Error list of Partner:", error);
    return Helper.response(false, error.message, {}, res, 500);
  }
};
