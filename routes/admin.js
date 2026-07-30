const express = require('express');
const router = express.Router();
const { GetPendingTeachers, AcceptTeacher, RejectTeacher } = require('../controllers/adminController');
const { verifyTokenAndAdmin } = require('../middlware/VerifyTokens'); 


router.get('/teachers/pending', verifyTokenAndAdmin, GetPendingTeachers);


router.put('/teachers/accept/:id', verifyTokenAndAdmin, AcceptTeacher);


router.put('/teachers/reject/:id', verifyTokenAndAdmin, RejectTeacher);

module.exports = router;