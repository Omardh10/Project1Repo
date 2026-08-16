const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const {Student} = require('../models/Student');
const { Discount} = require('../models/Discount');
const { verifytoken } = require('../middlware/VerifyTokens');

const generateCode = () => {
    return `DISC-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
};

// POST /api/redeem
router.post('/redeem',verifytoken, async (req, res) => {
    try {
        const {  discountPercentage, pointsRequired } = req.body;

        
        if ( !discountPercentage || !pointsRequired) {
            return res.status(400).json({ message: 'جميع البيانات مطلوبة' });
        }


        const student = await Student.findOne({userId: req.user.id});
        if (!student) {
            return res.status(404).json({ message: 'الطالب غير موجود' });
        }

        if (student.points_balance < pointsRequired) {
            return res.status(400).json({ 
                message: `رصيد النقاط غير كافٍ. رصيدك الحالي: ${student.points_balance}` 
            });
        }

        student.points_balance -= pointsRequired;
        await student.save();

        const newDiscount = new Discount({
            code: generateCode(),
            discount_percentage: discountPercentage
        });
        await newDiscount.save();
        
        student.Discount_codes.push(newDiscount)
        return res.status(201).json({
            message: 'تم استبدال النقاط وإنشاء كود الخصم بنجاح',
            code: newDiscount.code,
            discount_percentage: newDiscount.discount_percentage,
            remaining_points: student.points_balance
        });

    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ في الخادم', error: error.message });
    }
});

module.exports = router;