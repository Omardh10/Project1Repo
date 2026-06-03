const express = require('express');
const { GetTransactions, GetTransaction, CreateTransaction, UpdateTransaction, DeleteTransaction } = require('../controller/TransactionController');
const router = express.Router();
const { verifytoken } = require('../middlware/VerifyTokens');
// Get All Transactions
router.get('/',verifytoken, GetTransactions)

// Get Single Transaction
router.get('/:id', GetTransaction)

// Create New Transaction
router.post('/newtransaction',verifytoken, CreateTransaction)

// Update Transaction
router.patch('/:id',verifytoken, UpdateTransaction)

// Delete Transaction
router.delete('/:id',verifytoken, DeleteTransaction)



module.exports = router;

