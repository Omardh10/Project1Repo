const express = require('express');
const routerOtp = express.Router();
const nodemailer = require('nodemailer');
const { User } = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const otpStore = new Map();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


routerOtp.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'البريد الإلكتروني مطلوب' });
  }


  const otpCode = Math.floor(1000 + Math.random() * 9000).toString();


  otpStore.set(email, {
    otp: otpCode,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const mailOptions = {
    from: `"فريق الدعم" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'رمز التحقق الخاص بك (OTP)',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto;">
        <h2 style="color: #1976d2;">رمز التحقق</h2>
        <p style="font-size: 16px; color: #555;">استخدم الرمز التالي لتأكيد حسابك. الرمز صالِح لمدة 5 دقائق فقط:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1976d2; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="font-size: 12px; color: #888;">إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'فشل إرسال البريد الإلكتروني' });
  }
});

const sendEmail = async (subject, htmlContent,userId) => {
    const user = await User.findById(userId);
  const mailOptions = {
    from: `"فريق الدعم" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

routerOtp.post('/verify-otp', async (req, res) => {
  const { email, otpCode } = req.body;

  const record = otpStore.get(email);
  console.log(record)

  if (!record) {
    return res.status(400).json({ success: false, message: 'لم يتم طلب رمز لهذا البريد أو انتهت الجلسة' });
  }


  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ success: false, message: 'انتهت صلاحية الرمز، يرجى طلب رمز جديد' });
  }

  // مطابقة الرمز
  if (record.otp === otpCode) {
    otpStore.delete(email); // حذف الرمز بعد الاستخدام الناجح
    const user = await User.findOne({ email: email });
    if (user) {
      user.isAccount = true;
      await user.save();
    }
    return res.status(200).json({ success: true, message: 'تم التحقق بنجاح!' });
  } else {
    return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح' });
  }
});


routerOtp.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'البريد الإلكتروني مطلوب' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'البريد الإلكتروني غير مسجل لدينا' });
    }

    // توليد كلمة مرور عشوائية مؤقتة (8 خانات تتكون من حروف وأرقام)
    const randomPassword = crypto.randomBytes(4).toString('hex');

    // تشفير كلمة المرور الجديدة قبل التخزين
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user.password = hashedPassword;
    await user.save();

    // إعداد قالب الإيميل
    const resetMailOptions = {
      from: `"فريق الدعم - منصة أفق" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'إعادة تعيين كلمة المرور',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: auto; line-height: 1.6;">
          <h2 style="color: #e74c3c; text-align: center;">كلمة المرور المؤقتة</h2>
          <p>مرحباً بك،</p>
          <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في منصة أفق.</p>
          <p>كلمة المرور الجديدة المؤقتة هي:</p>
          <div style="background-color: #f8f9fa; border: 1px dashed #e74c3c; padding: 12px; text-align: center; font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #2c3e50; margin: 15px 0;">
            ${randomPassword}
          </div>
          <p style="color: #c0392b; font-weight: bold;">تنبيه مهم: يرجى تسجيل الدخول وتغيير كلمة المرور فوراً من إعدادات حسابك للحفاظ على أمان حسابك.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">إذا لم تطلب تغيير كلمة المرور، يرجى التواصل مع الدعم الفني فوراً.</p>
        </div>
      `,
    };

    await transporter.sendMail(resetMailOptions);

    res.status(200).json({ success: true, message: 'تم إرسال كلمة المرور الجديدة إلى بريدك الإلكتروني' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' });
  }
});

module.exports = {routerOtp, sendEmail};