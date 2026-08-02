const express = require('express');
const router = express.Router();
const { GetPendingTeachers, AcceptTeacher, RejectTeacher, RejectCourse, AcceptCourse } = require('../controller/AdminController');
const { verifytokenandisAdmin } = require('../middlware/VerifyTokens'); 
const { Course } = require('../models/Course');
  const { Admin } = require('../models/Admin');

router.get('/teachers/pending', verifytokenandisAdmin, GetPendingTeachers);


router.put('/teachers/accept/:id', verifytokenandisAdmin, AcceptTeacher);


router.put('/teachers/reject/:id', verifytokenandisAdmin, RejectTeacher);

router.get('/courses/pending', verifytokenandisAdmin, async (req, res) => {
    const pendingCourses = await Course.find({ status: 'pending' });
    res.status(200).json({ status: "success", pendingCourses });
});

router.post('/createadmin', verifytokenandisAdmin, async (req, res) => {
  

    const newAdmin = await Admin.create({
        userId: req.user.id,
        platform_fee_precentage: req.body.platform_fee_precentage
    });
    await newAdmin.save();
    res.status(201).json({ status: "success", admin: newAdmin });
});
router.put('/course/accept/:id', verifytokenandisAdmin, AcceptCourse );

router.put('/percentage', verifytokenandisAdmin, async (req, res) => {
    const admin = await Admin.findOne();
    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }
    admin.platform_fee_precentage = req.body.platform_fee_precentage;
    await admin.save();
    res.status(200).json({ status: "success", admin });
});

router.put('/course/reject/:id', verifytokenandisAdmin,RejectCourse );

module.exports = router;