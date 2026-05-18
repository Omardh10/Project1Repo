const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatregister, validatlogin, validatupdateuser, User } = require("../models/User");
const { UploadImage, RemoveImage } = require("../utils/cloudinary");

const RegisterUser = asynchandler(async (req, res) => {

    const { fullname, email, password, Gender, birthdate, role } = req.body;

    const { error } = validatregister(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message })
    }
    const olduser = await User.findOne({ email: email })
    if (olduser) {
        res.status(400).json({ message: "this user already registered" })
    }
    const hashpassword = await bcrypt.hash(password, 10)

    let newuser = new User({
        fullname,
        email,
        password: hashpassword,
        Gender,
        birthdate,
        role
    })
    const token = jwt.sign({ id: newuser._id, role: newuser.role.admin }, process.env.JWT_KEY)
    newuser.token = token;
    newuser.save();
    res.status(201).json({ status: "success", user: newuser });
})

const LoginUser = asynchandler(async (req, res) => {

    const { email, password } = req.body;
    const { error } = validatlogin(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    const user = await User.findOne({ email: email })
    if (!user) {
        return res.status(400).json({ message: "invalid email or password" })
    }
    const matchedpassword = await bcrypt.compare(password, user.password)
    if (!matchedpassword) {
        return res.status(400).json({ message: "invalid email or password" })
    }
    if (user && matchedpassword) {
        const token = jwt.sign({ id: user._id, role: user.role.admin }, process.env.JWT_KEY)
        user.token = token;
        // user.save();
        res.status(200).json({ userId: user._id, username: user.username, token: token, });
    }
})

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

    // console.log(req.file);
    if (!req.file) {
        res.status(404).json({ message: "no image provided" })
    }
    //get the path:
    const pathimg = await path.join(__dirname, `../images/${req.file.filename}`)
    const result = await UploadImage(pathimg);
    const user = await User.findById(req.user.id);
    if (user.profilephoto.publicId !== null) {
        await RemoveImage(user.profilephoto.publicId);
    }
    user.profilephoto = {
        url: result.secure_url,
        publicId: result.public_id
    }
    await user.save();

    res.status(201).json({ message: "image uploaded seccussfully", profilephoto: { url: result.secure_url, publicId: result.public_id } });
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