const express = require("express");
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const Notification = require('../models/Notifications'); 

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const users = {};
app.use(cors());

const SendNotification = async (userId, message, data) => {
    try {
         const savedNotify = await Notification.create({ userId, message, data });
        const newNotification = new Notification({
            userId,
            message,
            data
        });
         savedNotify = await newNotification.save();

        if (users[userId]) {
            io.to(users[userId]).emit('notification', {
                id: savedNotify._id || savedNotify.id, 
                message: savedNotify.message,
                data: savedNotify.data,
                isRead: savedNotify.isRead,
                timestamp: savedNotify.createdAt
            });
        }
    } catch (error) {
        console.error("خطأ أثناء حفظ أو إرسال الإشعار:", error);
    }
};

io.on('connection', (socket) => {
    console.log('user connected', socket.id);
    const userId = socket.handshake.query.userId;
    if (userId !== undefined) users[userId] = socket.id;
    io.emit('GetOnlineUsers', Object.keys(users));

    socket.on('disconnect', () => {
        console.log('user disconnected');
        delete users[userId];
        io.emit('GetOnlineUsers', Object.keys(users));
    });
});

module.exports = { io, server, SendNotification, app };
