const express = require('express');
const { getQuestion } = require('../controller/common/common');
const router = express.Router();
router.post('/get-questions',getQuestion)

module.exports = router