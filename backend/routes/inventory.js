const express = require('express');
const router = express.Router();
const {
  getInventory,
  createItem,
  updateStock
} = require('../controllers/inventoryController');

router.route('/')
  .get(getInventory)
  .post(createItem);

router.route('/:id/stock')
  .post(updateStock);

module.exports = router;
