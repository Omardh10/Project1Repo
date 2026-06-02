const express = require('express');
const { GetTransactions, GetTransaction, CreateTransaction, UpdateTransaction, DeleteTransaction } = require('../controller/TransactionController');
const router = express.Router();

// Get All Transactions
router.get('/', GetTransactions)

// Get Single Transaction
router.get('/:id', GetTransaction)

// Create New Transaction
router.post('/newtransaction', CreateTransaction)

// Update Transaction
router.patch('/:id', UpdateTransaction)

// Delete Transaction
router.delete('/:id', DeleteTransaction)



module.exports = router;

