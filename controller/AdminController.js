const asynchandler = require("express-async-handler");
const { Teacher } = require("../models/Teacher");
const { User } = require("../models/User");
const { Course } = require("../models/Course");
const { sendEmail } = require("../routes/otp");

const GetPendingTeachers = asynchandler(async (req, res) => {
    const pendingTeachers = await Teacher.find({ stetus: 'pending' })
        .populate('userId', 'fullname email profilephoto');

    return res.status(200).json({
        status: "success",
        count: pendingTeachers.length,
        teachers: pendingTeachers
    });
});

const AcceptTeacher = asynchandler(async (req, res) => {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }
    const teacherApprovalHtml = `
  <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #2c3e50; text-align: center;">تهانينا! تم قبولك كمعلم في منصة أفق 🎉</h2>
    <p>أهلاً بك في عائلة <strong>منصة أفق</strong>،</p>
    <p>يسعدنا إبلاغك بأنه قد تم مراجعة طلبك والموافقة عليه لتصبح معلماً معتمداً لدينا.</p>
    <p>يمكنك الآن تسجيل الدخول إلى حسابك والبدء في رفع دوراتك التعليمية ومشاركة شغفك ومعرفتك مع طلابنا.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://ofuqlms.com/dashboard" style="background-color: #3498db; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">الانتقال إلى لوحة التحكم</a>
    </div>
    <p>نتمنى لك رحلة تعليمية ممتعة وملهمة معنا.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 0.85em; color: #777; text-align: center;">فريق دعم منصة أفق</p>
  </div>
`;

    teacher.stetus = 'accepted';
    await teacher.save();
    sendEmail('تم قبول طلبك كمعلم', teacherApprovalHtml, teacher.userId);

    return res.status(200).json({
        status: "success",
        message: "تمت الموافقة على المدرس بنجاح",
        teacher
    });
});


const RejectTeacher = asynchandler(async (req, res) => {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.stetus = 'rejected';
    await teacher.save();
    const rejectionReason = "عدم استيفاء بعض الشروط المطلوبة للمؤهلات والخبرة.";

    const teacherRejectionHtml = `
  <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #e74c3c; text-align: center;">تحديث بشأن طلب الانضمام كمعلم</h2>
    <p>مرحباً بك،</p>
    <p>نشكر اهتمامك بالانضمام إلى <strong>منصة أفق</strong> ورغبتك في مشاركة معرفتك مع طلابنا.</p>
    <p>بعد مراجعة طلبك والمستندات المقدمة، نأسف لإبلاغك بأنه تعذر قبول طلبك في الوقت الحالي.</p>
    
    ${rejectionReason ? `
    <div style="background-color: #fdf2f2; border-right: 4px solid #e74c3c; padding: 12px; margin: 20px 0; border-radius: 4px;">
      <strong>سبب عدم القبول:</strong> ${rejectionReason}
    </div>
    ` : ''}

    <p>يمكنك التقديم مرة أخرى مستقبلاً بعد تحديث ملفك الشخصي أو استيفاء الشروط المطلوبة.</p>
    <p>نتمنى لك كل التوفيق في مسيرتك المهنية.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 0.85em; color: #777; text-align: center;">فريق دعم منصة أفق</p>
  </div>
`;
    sendEmail('تحديث بشأن طلب الانضمام كمعلم - منصة أفق', teacherRejectionHtml, teacher.userId);
    return res.status(200).json({
        status: "success",
        message: "تم رفض طلب المدرس",
        teacher
    });
});


const AcceptCourse = asynchandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    if (course.status == 'approved') {
        return res.status(200).json({
            message: " هذه الدورة موافق عليها",

        });
    }
    course.status = 'approved';
    await course.save();

    const courseApprovalHtml = `
  <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #27ae60; text-align: center;">تمت الموافقة على نشر دورتك التدريبية 🚀</h2>
    <p>مرحباً بك،</p>
    <p>يسعدنا إعلامك بأن دورتك التدريبية بعنوان: <strong>"${course.title}"</strong> قد تم مراجعتها والموافقة عليها من قبل الفريق المختص.</p>
    <p>الدورة الآن متاحة ومباشرة على منصة أفق ويمكن للطلاب التسجيل فيها والبدء في التعلم.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://ofuqlms.com/courses" style="background-color: #27ae60; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">عرض الدورة على المنصة</a>
    </div>
    <p>نشكر جهودك في إثراء المحتوى التعليمي على المنصة.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 0.85em; color: #777; text-align: center;">فريق دعم منصة أفق</p>
  </div>
`;
    sendEmail('تمت الموافقة على نشر دورتك التدريبية', courseApprovalHtml, course.userId);

    const teacher = await Teacher.findById(course.teacher_id);
    teacher.total_courses++
    teacher.save();
    res.status(200).json({
        status: "success",
        message: "تمت الموافقة على الدورة بنجاح",
        course
    });
});


const RejectCourse = asynchandler(async (req, res) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return res.status(404).json({ message: "Teacher not found" });
    }

    course.stetus = 'rejected';
    await course.save();


    const courseRejectionReason = "الصوت غير واضح في بعض الفيديوهات، ويرجى إضافة وصف تفصيلي للمحاور.";

    const courseRejectionHtml = `
  <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #e74c3c; text-align: center;">تحديث بشأن الدورة التدريبية</h2>
    <p>مرحباً بك،</p>
    <p>نشكرك على إعداد دورتك التدريبية بعنوان: <strong>"${course.title}"</strong> ورغبتك في نشرها على منصة أفق.</p>
    <p>بعد مراجعة المحتوى الخاص بالدورة من قبل الفريق المختص، نأسف لإبلاغك بأنه لم يتم قبول نشر الدورة بوضعها الحالي وذلك للأسباب التالية:</p>

    <div style="background-color: #fdf2f2; border-right: 4px solid #e74c3c; padding: 12px; margin: 20px 0; border-radius: 4px;">
      <strong>ملاحظات مراجعة الدورة:</strong><br />
      ${courseRejectionReason}
    </div>

    <p>يرجى تعديل الملاحظات المذكورة أعلاه ثم إعادة تقديم الدورة للمراجعة مرة أخرى من لوحة التحكم.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://ofuqlms.com/dashboard/courses" style="background-color: #e74c3c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">تعديل الدورة الآن</a>
    </div>

    <p>نقدر جهودك وننتظر تعديلاتك لنشر الدورة في أقرب وقت.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 0.85em; color: #777; text-align: center;">فريق دعم منصة أفق</p>
  </div>
`;
    sendEmail('تحديث بشأن مراجعة دورتك التدريبية - منصة أفق', courseRejectionHtml, course.userId);
    res.status(200).json({
        status: "success",
        message: "تم رفض طلب الكورس",
        course
    });
});


module.exports = {
    GetPendingTeachers,
    AcceptTeacher,
    RejectTeacher,
    AcceptCourse,
    RejectCourse
};