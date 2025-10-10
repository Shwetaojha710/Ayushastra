const banner = require("../../../model/banner");

exports.getPublicBanner = async (req, res) => {
  try {
    const bannerData = await banner.findAll({
      order: [["id", "desc"]],
      raw: true,
    });
    if (bannerData.length == 0) {
      return Helper.response(false, "No Data Found", {}, res, 200);
    }
    if (bannerData.length > 0) {
      return Helper.response(
        true,
        "Data Found Successfully",
        bannerData,
        res,
        200
      );
    }
  } catch (error) {
    return Helper.response(false, error?.message, {}, res, 500);
  }
};