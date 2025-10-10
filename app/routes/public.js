const express = require("express");
const { getPublicBanner } = require("../controller/admin/public");
const router = express.Router();


router.get("/public-banner",getPublicBanner)

module.exports = router;
