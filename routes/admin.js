const express = require('express');
const router = express.Router();
const { GetPendingTeachers, AcceptTeacher, RejectTeacher, RejectCourse, AcceptCourse } = require('../controller/AdminController');
const { verifytokenandisAdmin } = require('../middlware/VerifyTokens'); 
const { Course } = require('../models/Course');
  const { Admin } = require('../models/Admin');
  const { User } = require('../models/User');
  const {sendEmail} = require('../routes/otp');

router.get('/teachers/pending', verifytokenandisAdmin, GetPendingTeachers);


router.put('/teachers/accept/:id', verifytokenandisAdmin, AcceptTeacher);


router.put('/teachers/reject/:id', verifytokenandisAdmin, RejectTeacher);

router.get('/courses/pending', verifytokenandisAdmin, async (req, res) => {
    const pendingCourses = await Course.find({ status: 'pending' }).populate('userId').populate('category');
    return res.status(200).json({ status: "success", pendingCourses });
});

router.put('/course/accept/:id', verifytokenandisAdmin, AcceptCourse );

router.put('/percentage', verifytokenandisAdmin, async (req, res) => {
    const admin = await Admin.findOne();
    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }
    admin.platform_fee_precentage = req.body.platform_fee_precentage;
    await admin.save();
    const teachers = await User.find({ role: 'teacher' })

    if (!teachers || teachers.length === 0) return;

    const teacherShare = 100 - admin.platform_fee_precentage;
    const subject = 'تحديث مهم: تعديل نسبة رسوم المنصة';

    // 4. الإرسال لكل مدرس خلف الكواليس دون إيقاف الـ Response
    const emailPromises = teachers.map(teacher => {
      const teacherName =  'عزيزي المعلم';

      const htmlContent = `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0d6efd;">مرحباً ${teacherName}،</h2>
          <p>نود إعلامك بأنه تم تحديث نسبة رسوم منصة افق  للعمليات الجديدة.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-right: 4px solid #0d6efd; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>نسبة المنصة الجديدة:</strong> ${admin.platform_fee_precentage}%</p>
            <p style="margin: 5px 0;"><strong>حصة المعلم من المبيعات:</strong> ${teacherShare}%</p>
          </div>

          <p>يمكنك مراجعة كافة تفاصيل كورساتك وأرباحك من خلال لوحة التحكم الخاصة بك.</p>
          <p>مع تحيات،<br>فريق منصة افق</p>
        </div>
      `;

 
      return sendEmail(subject, htmlContent, teacher._id);
    });

 
    Promise.allSettled(emailPromises).then(results => {
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      console.log(`تم إرسال الإيميلات بنجاح إلى ${successCount} من أصل ${teachers.length} مدرس`);
    });
    res.status(200).json({ status: "success", admin });
});

router.put('/course/reject/:id', verifytokenandisAdmin,RejectCourse );

module.exports = router;