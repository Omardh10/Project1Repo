const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { ConnectToDb } = require("./utils/db");
const userroute = require("./routes/users");
const courseroute = require('./routes/courses');
const courseviewlogroute = require('./routes/courseviewlogs');
const enrollmentroute = require('./routes/enrollments');
const examroute = require('./routes/exams');
const parentroute = require('./routes/parents');
const quastionroute = require('./routes/quastions');
const reportroute = require('./routes/reports');
const childaccount = require('./routes/childaccount')
const reviewsroute = require('./routes/reviews');
const studenntroute = require('./routes/students');
const teacherroute = require('./routes/teachers');
const transctionroute = require('./routes/transctions');
const stdanswerroute = require('./routes/stdanswer');
const modelcourseroute = require('./routes/modelcourses');
const admin = require('./routes/admin')
const {routerOtp} = require('./routes/otp')
const discount = require('./routes/discount')
// const quastionroute = require('./routes/quastions')
require("dotenv").config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());
app.use(cors());

ConnectToDb();



app.use('/api/users', userroute)
app.use('/api/admin', admin)
app.use('/api/courses', courseroute)
app.use('/api/categories', require('./routes/catogary'))
app.use('/api/courseviewlogs', courseviewlogroute)
app.use('/api/enrollments', enrollmentroute)
app.use('/api/exams', examroute)
app.use('/api/parents', parentroute)
app.use('/api/reports', reportroute)
app.use('/api/reviews', reviewsroute)
app.use('/api/students', studenntroute)
app.use('/api/teachers', teacherroute)
app.use('/api/transctions', transctionroute)
app.use('/api/childaccount',childaccount)
// app.use('/api/quastions', quastionroute)
app.use('/api/studentanswers', stdanswerroute)
app.use('/api/modelcourses', modelcourseroute)
app.use('/api/otp', routerOtp)

// 1. معالج الصفحات غير الموجودة (404)
app.use((req, res, next) => {
    const error = new Error("This page is not Found");
    error.status = 404;
    next(error);
});

// 2. معالج الأخطاء العام (Global Error Handler)
app.use((error, req, res, next) => {
    // التحقق مما إذا كانت الاستجابة قد أُرسلت بالفعل للعميل
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.status || 500;
    res.status(statusCode).json({ message: error.message });
});

server.listen(process.env.PORT || 2500, () => {
    console.log(`Server is running on port ${process.env.PORT || 2500}`);
});