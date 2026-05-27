const express = require('express');
const { GetExams, GetExam, CreateExam, UpdateExam, DeleteExam } = require('../controller/ExamController');
const { GetParents, GetParent, CreateParent, UpdateParent, DeleteParent } = require('../controller/ParentController');
const router = express.Router();

// Get All Parents
router.get('/parents', GetParents)

// Get Single Parent
router.get('/parent/:id', GetParent)

// Create New Parent
router.post('/newparent', CreateParent)

// Update Parent
router.patch('/parent/:id', UpdateParent)

// Delete Parent
router.delete('/parent/:id', DeleteParent)



module.exports = router;

