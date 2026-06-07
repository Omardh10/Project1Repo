const express = require('express');
const { verifytoken } = require('../middlware/VerifyTokens');
const { GetQuastions, GetQuastion, DeleteQuastion, UpdateQuastion, CreateQuastion } = require('../controller/QuastionController');
const router = express.Router();

// Get All Questions
router.get('/', verifytoken, GetQuastions)

// Get Single Question
router.get('/:id', GetQuastion)

// Create New Question
router.post('/newquestion', verifytoken, CreateQuastion)

// Update Question
router.patch('/:id', verifytoken, UpdateQuastion)

// Delete Question
router.delete('/:id', verifytoken, DeleteQuastion)




module.exports = router;

