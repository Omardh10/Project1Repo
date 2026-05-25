const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatecreatechildaccount, validateupdatechildaccount } = require("../models/ChiledAccount");

const CreateChildAccount = asynchandler(async (req, res) => {
    const { student_id, parent_id, age_group } = req.body;

    const { error } = validatecreatechildaccount(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    if (req.user.role == 'parent') {
        const childAccount = new ChiledAccount({
            student_id,
            parent_id,
            age_group
        })
        await childAccount.save()
        res.status(201).json({ message: "Child account created successfully", new_child_account: childAccount })
    }
})


const GetChildAccounts = asynchandler(async (req, res) => {
    const childAccounts = await ChiledAccount.find().populate('student_id').populate('parent_id');
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
    const childAccount = await ChiledAccount.findById(req.params.id).populate('student_id').populate('parent_id');
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
    DeleteChildAccount
}