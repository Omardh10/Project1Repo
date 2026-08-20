const { Server } = require("socket.io");
const Notification = require('../models/Notifications'); // تأكد من صحة المسار
const {User} = require('../models/User'); 

let io;
const users = {};

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        const userId = socket.handshake.query.userId;
        
        if (userId && userId !== "null" && userId !== "undefined") {
            users[userId] = socket.id;
        }

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            if (userId && users[userId]) {
                delete users[userId];
            }
        });
    });
};

const SendNotification = async (userId, message, data = {}) => {
    try {
        // 1. حفظ الإشعار في قاعدة البيانات
        const newNotification = new Notification({ userId, message, data });
        const savedNotify = await newNotification.save();

        // 2. الإرسال اللحظي عبر Socket.io (إذا كان التطبيق مفتوحاً والمستخدم متصل)
        if (io && users[userId]) {
            io.to(users[userId]).emit('notification', {
                id: savedNotify._id || savedNotify.id,
                message: savedNotify.message,
                data: savedNotify.data,
                isRead: savedNotify.isRead,
                timestamp: savedNotify.createdAt
            });
            console.log(`Socket Notification sent to: ${userId}`);
        }

    } catch (error) {
        console.error("خطأ أثناء إرسال الإشعار:", error);
    }
};

module.exports = { initSocket, SendNotification };