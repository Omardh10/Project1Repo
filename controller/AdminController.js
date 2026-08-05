const asynchandler = require("express-async-handler");
const { Teacher } = require("../models/Teacher"); 
const { User } = require("../models/User"); 
const { Course } = require("../models/Course");

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

    teacher.stetus = 'accepted';
    await teacher.save();

    return   res.status(200).json({
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
if( course.status == 'approved'){
 return res.status(200).json({
        message: " هذه الدورة موافق عليها",
     
    });
}
    course.status = 'approved';
    await course.save();
 

    const teacher =  await Teacher.findById(course.teacher_id);
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