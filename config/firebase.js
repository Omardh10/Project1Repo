const admin = require("firebase-admin");
const { initializeApp, cert } = require("firebase-admin/app");
const serviceAccount = require("./serviceAccountKey.json");

// 1. تهيئة تطبيق Firebase Admin باستخدام الوظائف المباشرة
initializeApp({
  credential: cert(serviceAccount)
});

console.log("Firebase Admin Initialized Successfully");

// 2. تصدير admin لاستخدامه في باقي المشروع
module.exports = admin;