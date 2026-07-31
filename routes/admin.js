const express = require('express');
const router = express.Router();
const { GetPendingTeachers, AcceptTeacher, RejectTeacher, RejectCourse, AcceptCourse } = require('../controller/AdminController');
const { verifytokenandisAdmin } = require('../middlware/VerifyTokens'); 


router.get('/teachers/pending', verifytokenandisAdmin, GetPendingTeachers);


router.put('/teachers/accept/:id', verifytokenandisAdmin, AcceptTeacher);


router.put('/teachers/reject/:id', verifytokenandisAdmin, RejectTeacher);


router.put('/course/accept/:id', verifytokenandisAdmin, AcceptCourse );


router.put('/course/reject/:id', verifytokenandisAdmin,RejectCourse );

module.exports = router;