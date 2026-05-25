const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatecreateparent, validateupdateparent } = require("../models/Parent");


const CreateParent = asynchandler(async (req, res) => {

    const { error } = validatecreateparent(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    const NewParent = Parent.create({
        userId: req.body.userId
    })
    await NewParent.save();
    res.status(201).json({ status: "success", parent: NewParent });
    
})


const GetParent = asynchandler(async (req, res) => {
    const parent = await Parent.findById(req.params.id);
    if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
    }
    res.status(200).json({ status: "success", parent });

})

const UpdateParent = asynchandler(async (req, res) => {
  
    let parent = await Parent.findById(req.params.id);
    if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
    }
    const { error } = validateupdateparent(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    parent = await Parent.findByIdAndUpdate(req.params.id, {
        $set: {
            userId: req.body.userId
        }
    }, { new: true })
    res.status(202).json({ status: "success", parent })
})

const GetParents = asynchandler(async (req, res) => {

    const parents = await Parent.find();
    res.status(200).json({ status: "success", parents })
})

const DeleteParent = asynchandler(async (req, res) => {
    let parent = await Parent.findById(req.params.id);
    if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
    }
    await Parent.deleteOne({ _id: req.params.id });
    res.status(200).json({ status: "success", message: "Parent deleted successfully" })

})

module.exports = {
    CreateParent,
    GetParent,
    UpdateParent,
    GetParents,
    DeleteParent
}