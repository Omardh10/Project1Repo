const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { ChiledAccount } = require('../models/ChiledAccount')
const { validatecreatechildaccount, validateupdatechildaccount } = require("../models/ChiledAccount");
const { Parent } = require('../models/Parent')


const CreateChildAccount = asynchandler(async (req, res) => {
    if (req.user.role !== 'parent') {
        return res.status(403).json({ message: "فقط الآباء يمكنهم إنشاء حسابات للأبناء" });
    }
    const parent = await Parent.findOne({ userId: req.user.id });
    if (!parent) {
        return res.status(404).json({ message: "حساب الأب غير موجود في قاعدة البيانات" });
    }
    const { name, age } = req.body;
    const { error } = validatecreatechildaccount({ 
        name, 
        age, 
        parent_id: parent._id.toString()
    });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const childAccount = new ChiledAccount({
        name,
        parent_id: parent._id, 
        age,
        courses: []
    });
    
    await childAccount.save();

    return res.status(201).json({
        status: "success",
        message: "تم إنشاء حساب الطفل بنجاح",
        new_child_account: childAccount
    });
});

const GetChildAccountsByFather = asynchandler(async (req, res) => {
    const parent = await Parent.findOne({ userId: req.user.id });
    const childAccounts = await ChiledAccount.find({ parent_id: parent._id }).populate('parent_id');
    res.status(200).json({ message: "Child accounts retrieved successfully", child_accounts: childAccounts })
})

const PostImageChildAccount = asynchandler(async (req, res) => {

    if (!req.file) {
        return res.status(404).json({ message: "no image provided" })
    }
    const pathimg = await path.join(__dirname, `../images/${req.file.filename}`)
    const result = await UploadFile(pathimg);
    const parent = await Parent.findOne({ userId: req.user.id });
    const child = await ChiledAccount.findOne({ parent_id: parent._id });
    if (child.profilephoto.publicId !== null) {
        await RemoveImage(child.profilephoto.publicId);
    }
    child.profilephoto = {
        url: result.secure_url,
        publicId: result.public_id
    }
    await child.save();

    return res.status(201).json({ message: "image uploaded seccussfully", profilephoto: { url: result.secure_url, publicId: result.public_id } });
    fs.unlinkSync(pathimg);
})

const GetChildAccounts = asynchandler(async (req, res) => {
    const childAccounts = await ChiledAccount.find().populate('parent_id');
    res.status(200).json({ message: "Child accounts retrieved successfully", child_accounts: childAccounts })
})

const UpdateChildAccount = asynchandler(async (req, res) => {
    const { error } = validateupdatechildaccount(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let childAccount = await ChiledAccount.findById(req.params.id);
    if (!childAccount) {
        return res.status(404).json({ message: "Child account not found" })
    }
    if (req.user.role == 'parent') {
        if (childAccount.parent_id.toString() !== req.user._id.toString()) {
            childAccount = await ChiledAccount.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.status(200).json({ message: "Child account updated successfully", updated_child_account: childAccount })
        } else {
            return res.status(403).json({ message: "You are not authorized to update this child account" })
        }
    }
})

const GetChildAccount = asynchandler(async (req, res) => {
    const childAccount = await ChiledAccount.findById(req.params.id).populate('parent_id');
    if (!childAccount) {
        return res.status(404).json({ message: "Child account not found" })
    }
    res.status(200).json({ message: "Child account retrieved successfully", child_account: childAccount })
})

const DeleteChildAccount = asynchandler(async (req, res) => {
    let childAccount = await ChiledAccount.findById(req.params.id);
    if (!childAccount) {
        return res.status(404).json({ message: "Child account not found" })
    }
    if (req.user.role == 'parent' || req.user.role == 'admin') {
        if (childAccount.parent_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {

            await ChiledAccount.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: "Child account deleted successfully" })
        } else {
            return res.status(403).json({ message: "You are not authorized to delete this child account" })
        }
    }
})

module.exports = {
    CreateChildAccount,
    GetChildAccounts,
    UpdateChildAccount,
    GetChildAccount,
    DeleteChildAccount,
    GetChildAccountsByFather,
    PostImageChildAccount
}