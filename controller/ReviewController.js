const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatecreatereview, validateupdatereview } = require("../models/Review");


const CreateReview = asynchandler(async (req, res) => {
    const { error } = validatecreatereview(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    const NewReview = Review.create({
        course_id: req.body.course_id,
        student_id: req.body.student_id,
        rating: req.body.rating,
        comment: req.body.comment
    })
    await NewReview.save();
    res.status(201).json({ status: "success", review: NewReview });
})

const GetReview = asynchandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ status: "success", review });
})

const UpdateReview = asynchandler(async (req, res) => {
    const { error } = validateupdatereview(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    let review = await Review.findById(req.params.id);
    if (!review) {
        return res.status(404).json({ message: "Review not found" });
    }
    if (review.student_id.userId.toString() == req.user.id || req.user.role == "admin") {
        review = await Review.findByIdAndUpdate(req.params.id, {
            $set: {
                course_id: req.body.course_id,
                student_id: req.body.student_id,
                rating: req.body.rating,
                comment: req.body.comment
            }
        }, { new: true });
        res.status(200).json({ status: "success", review });
    } else {
        return res.status(403).json({ message: "You are not authorized to update this review" });
    }
})

const GetReviews = asynchandler(async (req, res) => {
    const reviews = await Review.find();
    res.status(200).json({ status: "success", reviews });
})

const DeleteReview = asynchandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        return res.status(404).json({ message: "Review not found" });
    }
    if (review.student_id.userId.toString() == req.user.id || req.user.role == "admin") {
        await Review.findByIdAndDelete(req.params.id);
        res.status(200).json({ status: "success", message: "Review deleted successfully" });
    } else {
        return res.status(403).json({ message: "You are not authorized to delete this review" });
    }
})

module.exports = {
    CreateReview,
    GetReview,
    UpdateReview,
    GetReviews,
    DeleteReview
}
