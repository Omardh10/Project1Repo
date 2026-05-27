const express = require('express');
const { GetTransactions, GetTransaction, CreateTransaction, UpdateTransaction, DeleteTransaction } = require('../controller/TransactionController');
const router = express.Router();

// Get All Transactions
router.get('/transactions', GetTransactions)

// Get Single Transaction
router.get('/transaction/:id', GetTransaction)

// Create New Transaction
router.post('/newtransaction', CreateTransaction)

// Update Transaction
router.patch('/transaction/:id', UpdateTransaction)

// Delete Transaction
router.delete('/transaction/:id', DeleteTransaction)



module.exports = router;

