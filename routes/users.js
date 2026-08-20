const express = require('express');
const { verifytokenandisAdmin, verifytoken, verifytokenandonlyuser, verifytokenandauthorization } = require('../middlware/VerifyTokens');
const { GetUsers, GetUser, RegisterUser, LoginUser, UpdateUser, DeleteUser, PostImageUser, CheckEmailUser, GoogleLogin } = require('../controller/UserController');
const { uploadphoto } = require('../middlware/upload');
const {User} =  require('../models/User')
const router = express.Router();

// Get All Users 
router.get('/profile', verifytokenandisAdmin, GetUsers)

// Get Single User
router.get('/profile/:id', GetUser)

// Register New User
router.post('/auth/register', RegisterUser)

router.put("/update-fcm-token", verifytoken, async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, {
        $set: { fcmToken: req.body.fcmToken }
    });
    res.status(200).json({ message: "FCM Token updated successfully" });
});

// Login Old User
router.post('/auth/login', LoginUser)

// Update User
router.put('/profile/:id', UpdateUser)

// Delete User
router.delete('/profile/:id', verifytokenandauthorization, DeleteUser)

// Post Image Usera
router.post('/profile/profile-photo-upload', verifytoken, uploadphoto.single('image'), PostImageUser)

// Check Email User
router.get('/checkemail', CheckEmailUser)

router.post('/google-login', GoogleLogin);




module.exports = router;

