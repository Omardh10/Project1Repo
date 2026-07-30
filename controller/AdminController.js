const asynchandler = require("express-async-handler");
const { Teacher } = require("../models/Teacher"); 
const { User } = require("../models/User"); 

const GetPendingTeachers = asynchandler(async (req, res) => {
    const pendingTeachers = await Teacher.find({ stetus: 'pending' })
        .populate('userId', 'fullname email profilephoto'); 

    res.status(200).json({
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

    res.status(200).json({
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

    res.status(200).json({
        status: "success",
        message: "تم رفض طلب المدرس",
        teacher
    });
});

module.exports = {
    GetPendingTeachers,
    AcceptTeacher,
    RejectTeacher
};