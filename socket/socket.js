const { Server } = require("socket.io");
const Notification = require('../models/Notifications'); // تأكد من صحة المسار
const {User} = require('../models/User'); 
const admin = require('../config/firebase'); 

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

        // 3. الإرسال عبر Firebase FCM (Push Notification)
        const user = await User.findById(userId);
        if (user && user.fcmToken) {
            // تجهيز الـ data وتحويل جميع القيم إلى Strings
            const stringifiedData = {
                notificationId: String(savedNotify._id || savedNotify.id),
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            };

            if (data && typeof data === 'object') {
                Object.keys(data).forEach(key => {
                    stringifiedData[key] = typeof data[key] === 'object' 
                        ? JSON.stringify(data[key]) 
                        : String(data[key]);
                });
            }

            const fcmPayload = {
                token: user.fcmToken,
                notification: {
                    title: 'تطبيق أُفُق',
                    body: message
                },
                data: stringifiedData
            };

            try {
                await admin.messaging().send(fcmPayload);
                console.log(`FCM Push Notification sent to token: ${user.fcmToken}`);
            } catch (fcmError) {
                console.error("FCM Send Error:", fcmError.message);
                // إذا كان التوكن منتهياً أو غير صالح، قم بحذفه من قاعدة البيانات
                if (
                    fcmError.code === 'messaging/invalid-registration-token' ||
                    fcmError.code === 'messaging/registration-token-not-registered'
                ) {
                    await User.findByIdAndUpdate(userId, { $unset: { fcmToken: 1 } });
                    console.log(`Removed invalid FCM token for user: ${userId}`);
                }
            }
        }

    } catch (error) {
        console.error("خطأ أثناء إرسال الإشعار:", error);
    }
};

module.exports = { initSocket, SendNotification };