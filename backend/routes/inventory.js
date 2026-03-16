const express = require('express');
const router = express.Router();
const {
  getInventory,
  getCategories,
  createItem,
  updateStock,
  getItemById,
  updateItem
} = require('../controllers/inventoryController');

router.route('/')
  .get(getInventory)
  .post(createItem);

router.route('/categories')
  .get(getCategories);

router.route('/:id')
  .get(getItemById)
  .put(updateItem);

router.route('/:id/stock')
  .post(updateStock);

module.exports = router;
