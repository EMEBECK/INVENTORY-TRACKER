const express = require('express');
const router = express.Router();
const {
  getActivityReports,
  getReportByDate,
  verifyActivityPassword
} = require('../controllers/inventoryController');

router.get('/reports', getActivityReports);
router.get('/report/:date', getReportByDate);
router.post('/verify-password', verifyActivityPassword);
router.post('/change-password', require('../controllers/inventoryController').changeActivityPassword);

module.exports = router;
