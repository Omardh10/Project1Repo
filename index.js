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
const reviewsroute = require('./routes/reviews');
const studenntroute = require('./routes/students');
const teacherroute = require('./routes/teachers');
const transctionroute = require('./routes/transctions');
require("dotenv").config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());
app.use(cors());

ConnectToDb();



app.use('/api/users', userroute)
app.use('/api/courses', courseroute)
app.use('/api/courseviewlogs', courseviewlogroute)
app.use('/api/enrollments', enrollmentroute)
app.use('/api/exams', examroute)
app.use('/api/parents', parentroute)
app.use('/api/reports', reportroute)
app.use('/api/reviews', reviewsroute)
app.use('/api/students', studenntroute)
app.use('/api/teachers', teacherroute)
app.use('/api/transctions', transctionroute)


app.use((req, res, next) => {
    const error = new Error("This page is not Found")
    res.status(404)
    next(error);
})

app.use((error, req, res, next) => {
    res.status(401).json({ message: error.message });
})




server.listen(process.env.PORT || 2500, () => {
    console.log(`port is ${process.env.PORT}`);

})
