const express = require('express');
const { verifytoken } = require('../middlware/VerifyTokens');
const { GetQuestions, GetQuestion, CreateQuestion, UpdateQuestion, DeleteQuestion } = require('../controller/QuastionController');
const router = express.Router();

// Get All Questions
router.get('/', verifytoken, GetQuestions)

// Get Single Question
router.get('/:id', GetQuestion)

// Create New Question
router.post('/newquestion', verifytoken, CreateQuestion)

// Update Question
router.patch('/:id', verifytoken, UpdateQuestion)

// Delete Question
router.delete('/:id', verifytoken, DeleteQuestion)




module.exports = router;

