const { Router } = require('express');
const { listProducts, createProduct } = require('../controllers/products');

const router = Router();
router.get('/', listProducts);
router.post('/', createProduct);

module.exports = router;
