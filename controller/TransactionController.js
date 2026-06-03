const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatecreatetransaction, validatupdatetransaction, Transaction } = require("../models/Transaction");


const CreateTransaction = asynchandler(async (req, res) => {
    const { error } = validatecreatetransaction(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    const NewTransaction = Transaction.create({
        student_id: req.body.student_id,
        course_id: req.body.course_id,
        amount: req.body.amount,
        platform_fee: req.body.platform_fee,
        instructor_earnings: req.body.instructor_earnings
    })
    await NewTransaction.save();
    res.status(201).json({ status: "success", transaction: NewTransaction });
})

const GetTransaction = asynchandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ status: "success", transaction });
})

const UpdateTransaction = asynchandler(async (req, res) => {
    const { error } = validatupdatetransaction(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
    }
    if (transction.student_id.userId.toString() == req.user.id || req.user.role == 'admin') {
        transaction = await Transaction.findByIdAndUpdate(req.params.id, {
            $set: {
                student_id: req.body.student_id,
                course_id: req.body.course_id,
                amount: req.body.amount,
                platform_fee: req.body.platform_fee,
                instructor_earnings: req.body.instructor_earnings
            }
        }, { new: true });
        res.status(200).json({ status: "success", transaction });
    } else {
        res.status(403).json({ status: "error", message: "You are not authorized" })
    }
})

const GetTransactions = asynchandler(async (req, res) => {
    const transactions = await Transaction.find();
    if (req.user.role == 'admin' || req.user.role == 'teacher') {
        res.status(200).json({ status: "success", transactions });
    } else { res.status(403).json({ status: "error", message: "You are not authorized" }) }
})

const DeleteTransaction = asynchandler(async (req, res) => {
    const transction = await Transaction.findById(req.params.id);
    if (!transction) {
        return res.status(404).json({ status: 'failed', message: "this transction not found" })
    }
    if (transction.student_id.userId.toString() == req.user.id || req.user.role == 'admin') {
        await Transaction.deleteOne({ _id: req.params.id })
    } else { res.status(403).json({ status: "error", message: "You are not authorized to delete it" }) }
})

module.exports = {
    CreateTransaction,
    GetTransaction,
    UpdateTransaction,
    GetTransactions,
    DeleteTransaction
}
