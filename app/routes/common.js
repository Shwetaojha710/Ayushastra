const express = require('express');
const { getQuestion } = require('../controller/common/common');
const { createBulkOrder, updateBulkOrder, deleteBulkOrder, listBulkOrders } = require('../controller/admin/blukorder');
const router = express.Router();
router.post('/get-questions',getQuestion)
router.post('/create-bulkOrder',createBulkOrder)
router.post('/update-bulkOrder',updateBulkOrder)
router.post('/delete-bulkOrder',deleteBulkOrder)
router.post('/list-bulkOrder',listBulkOrders)

module.exports = router