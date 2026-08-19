const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const asynchandler = require("express-async-handler");
const {Student} = require('../models/Student');
const { Discount} = require('../models/Discount');
const { verifytoken } = require('../middlware/VerifyTokens');
const {SendNotification} =  require('../socket/socket')

const generateCode = () => {
    return `DISC-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
};

router.get('/check-code/:code',async (req,res)=>{
    const codee = await Discount.findOne({code:req.params.code})
    if(!codee){
        return res.status(404).json({message: "code not found"})
    }
    return res.status(200).json({message:"code founded",precentege:codee.discount_precentage})
})
// POST /api/redeem
router.post('/redeem',verifytoken, async (req, res) => {
    try {
        const { pointsRequired } = req.body;
        let discountPercentage= 0;

        
        if ( !pointsRequired) {
            return res.status(400).json({ message: 'جميع البيانات مطلوبة' });
        }
       if(pointsRequired == 50){
        discountPercentage=10
       }else if(pointsRequired==75){
        discountPercentage=15
       }else if(pointsRequired == 25){
        discountPercentage=5
       }
       else if(pointsRequired == 100){
         discountPercentage=20
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
            discount_precentage: discountPercentage
        });
        await newDiscount.save();
        
        student.Discount_codes.push(newDiscount)
            await SendNotification(req.user.id, `تم استبدال ${pointsRequired} نقطة مقابل كود خصم ${discountPercentage}`, { pointsAdded: 20 });
        return res.status(200).json({
            message: 'تم استبدال النقاط وإنشاء كود الخصم بنجاح',
            code: newDiscount.code,
            discount_percentage: discountPercentage,
            remaining_points: student.points_balance
        });

    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ في الخادم', error: error.message });
    }
});

module.exports = router;