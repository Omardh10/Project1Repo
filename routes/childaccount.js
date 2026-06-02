const express = require('express');
const { GetChildAccounts, GetChildAccount, UpdateChildAccount, DeleteChildAccount } = require('../controller/ChiledAccountController');
const { verifytoken } = require('../middlware/VerifyTokens');
const router = express.Router();

// Get All Child Accounts
router.get('/', GetChildAccounts)

// Get Single Child Account
router.get('/:id', GetChildAccount)

// Create New Child Account
router.post('/newchildaccount', verifytoken, CreateChildAccount)

// Update Child Account
router.patch('/:id', verifytoken, UpdateChildAccount)

// Delete Child Account
router.delete('/:id', verifytoken, DeleteChildAccount)



module.exports = router;

