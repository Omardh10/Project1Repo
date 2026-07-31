const express = require('express');
const { CreateCategory, GetCategories, DeleteCategory } = require('../controller/CategoryController');
const { verifytoken } = require('../middlware/VerifyTokens');
const router = express.Router();

router.post('/newcategory', verifytoken, CreateCategory);
router.get('/', GetCategories);
router.delete('/:id', verifytoken, DeleteCategory);

module.exports = router;
