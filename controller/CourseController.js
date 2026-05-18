const asynchandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validatupdatecourse, Course } = require("../models/Course");

const CreateCourse = asynchandler(async (req, res) => {

    const{teacher_id , title , description , category , price , lessons }
     const { error } = validatupdatecourse(req.body);
    if (error) {
        return res.status(403).json({ message: error.details[0].message })
    }
    if(!req.file){
        res.status(404).json({ message: "no course provided" })
    }
    //get the path:
        const pathimg = await path.join(__dirname, `../images/${req.file.filename}`)
        const result = await UploadImage(pathimg);
   let NewCourse = Course.create({

    teacher_id, 
    title, 
    description, 
    category,
    price,
    lessons

   })
    await NewCourse.save();
    res.status(201).json({ status: "success", course: NewCourse });
})

const GetCourse = asynchandler(async (req, res) => {


})

const UpdateCourse = asynchandler(async (req, res) => {

    

})

const GetCourses = asynchandler(async (req, res) => {


})

const DeleteCourse = asynchandler(async (req, res) => {


})



module.exports = {
    
}