const express = require('express');
const { verifytokenandisAdmin, verifytoken, verifytokenandonlyuser, verifytokenandauthorization } = require('../middlware/VerifyTokens');
const { GetUsers, GetUser, RegisterUser, LoginUser, UpdateUser, DeleteUser, PostImageUser, CheckEmailUser } = require('../controller/UserController');
const { uploadphoto } = require('../middlware/upload');
const router = express.Router();

// Get All Users 
router.get('/profile', verifytokenandisAdmin, GetUsers)

// Get Single User
router.get('/profile/:id', GetUser)

// Register New User
router.post('/auth/register', RegisterUser)

// Login Old User
router.post('/auth/login',verifytoken, LoginUser)

// Update User
router.patch('/profile/:id', verifytokenandonlyuser, UpdateUser)

// Delete User
router.delete('/profile/:id', verifytokenandauthorization, DeleteUser)

// Post Image Usera
router.post('/profile/profile-photo-upload', verifytoken, uploadphoto.single('image'), PostImageUser)

// Check Email User
router.get('/checkemail', CheckEmailUser)




module.exports = router;

