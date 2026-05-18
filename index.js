const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { ConnectToDb } = require("./utils/db");
const userroute = require("./routes/users");
require("dotenv").config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.json());
app.use(cors());

ConnectToDb();



app.use('/api/users', userroute)


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
