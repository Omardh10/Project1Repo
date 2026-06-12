const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatregister, validatlogin, validatupdateuser, User } = require("../models/User");
const { RemoveImage, UploadFile } = require("../utils/cloudinary");

const RegisterUser = asynchandler(async (req, res) => {
    const { fullname, email, password, Gender, birthdate, role } = req.body;

    const { error } = validatregister(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message }); // إضافة return ضرورية هنا
    }

    const olduser = await User.findOne({ email: email });
    if (olduser) {
        return res.status(400).json({ message: "this user already registered" }); // إضافة return ضرورية هنا
    }

    // شرط الأمان: السماح للأدمن حصراً بإنشاء حسابات الأساتذة والطلاب
    if ((role === 'student' || role === 'teacher') && (!req.user || req.user.role !== 'admin')) {
        return res.status(403).json({ message: "Only administrators can create teacher and student accounts" });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    let newuser = new User({
        fullname,
        email,
        password: hashpassword,
        Gender,
        birthdate,
        role
    });

    await newuser.save(); 

    if (role === 'student') {
        await Student.create({
            user_id: newuser._id,
            points_balance: 0,
            enrolled_courses_count: 0
        });
    } else if (role === 'teacher') {
        await Instructor.create({
            user_id: newuser._id,
            total_students: 0,
            total_courses: 0,
            status: 'pending'
        });
    } else if (role === 'parent') {
        await Parent.create({
            user_id: newuser._id
        });
    }

    const token = jwt.sign({ id: newuser._id, role: newuser.role }, process.env.JWT_KEY);

    res.status(201).json({ status: "success", user: newuser, token: token });
});
const LoginUser = asynchandler(async (req, res) => {
    const { email, password } = req.body;

    const { error } = validatlogin(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(400).json({ message: "invalid email or password" });
    }

    const matchedpassword = await bcrypt.compare(password, user.password);
    if (!matchedpassword) {
        return res.status(400).json({ message: "invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_KEY);

    res.status(200).json({
        userId: user._id,
        fullname: user.fullname,
        token: token
    });
});

const GetUsers = asynchandler(async (req, res) => {

    const users = await User.find({}, { "__v": false, "password": false })

})

const GetUser = asynchandler(async (req, res) => {

    const user = await User.findById(req.params.id).select("-password").select("-token")
    if (!user) {
        return res.status(403).json({ message: "user not found" });
    }
    else {
        return res.status(200).json({ status: "success", user })
    }
})

const PostImageUser = asynchandler(async (req, res) => {

    if (!req.file) {
        return res.status(404).json({ message: "no image provided" })
    }
    //get the path:
    const pathimg = await path.join(__dirname, `../images/${req.file.filename}`)
    const result = await UploadFile(pathimg);
    const user = await User.findById(req.user.id);
    if (user.profilephoto.publicId !== null) {
        await RemoveImage(user.profilephoto.publicId);
    }
    user.profilephoto = {
        url: result.secure_url,
        publicId: result.public_id
    }
    await user.save();

    return res.status(201).json({ message: "image uploaded seccussfully", profilephoto: { url: result.secure_url, publicId: result.public_id } });
    fs.unlinkSync(pathimg);
})

const UpdateUser = asynchandler(async (req, res) => {

    const { error } = validatupdateuser(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    const user = await User.findById(req.params.id)
    if (!user) {
        return res.status(404).json({ message: "user not found" });
    }
    else {
        if (req.body.password) {
            const hashpassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashpassword;
        }
        const updateuser = await User.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                fullname: req.body.username,
                birthdate: req.body.birthdate,
                password: req.body.password,
                bio: req.body.bio,
                Gender: req.body.Gender,
                status: req.body.status,
                role: req.body.role
            }
        }, { new: true })
        return res.status(202).json({ status: "success", user: updateuser })
    }
})

const DeleteUser = asynchandler(async (req, res) => {

    const user = await User.findById(req.params.id)
    if (!user) {
        return res.status(403).json({ message: "user not found" });
    }
    else {
        await RemoveImage(user.profilephoto.publicId)
        await User.deleteOne({ _id: req.params.id })
        return res.status(201).json({ message: "deleted seccussfuly ... " })
    }
})

const CheckEmailUser = asynchandler(async (req, res) => {

    const email = req.query.email
    const olduser = await User.findOne({ email: email })
    if (olduser) {
        return res.status(200).json({ message: "user is old user" })
    } else if (!olduser) {
        return res.status(200).json({ message: "user allowed" })
    }
})



module.exports = {
    RegisterUser,
    GetUsers,
    GetUser,
    LoginUser,
    UpdateUser,
    DeleteUser,
    PostImageUser,
    CheckEmailUser,
}