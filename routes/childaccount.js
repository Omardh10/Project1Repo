const express = require('express');
const { GetChildAccounts, GetChildAccount,CreateChildAccount, UpdateChildAccount, DeleteChildAccount, GetChildAccountsByFather, PostImageChildAccount } = require('../controller/ChiledAccountController');
const { verifytoken } = require('../middlware/VerifyTokens');
const { uploadphoto } = require('../middlware/upload');
const router = express.Router();

// Get All Child Accounts
router.get('/', GetChildAccounts);


router.get('/byfather', verifytoken, GetChildAccountsByFather);

// Get Single Child Account
router.get('/:id', GetChildAccount);

// Create New Child Account
router.post('/newchildaccount', verifytoken, CreateChildAccount);

router.post('/upload-image-childaccount', verifytoken, uploadphoto.single('image'), PostImageChildAccount);

// Update Child Account
router.patch('/:id', verifytoken, UpdateChildAccount);

// Delete Child Account
router.delete('/:id', verifytoken, DeleteChildAccount);

module.exports = router;