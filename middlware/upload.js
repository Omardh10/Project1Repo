// const multer = require('multer');
// const path = require('path');

// const photoStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, '../images'))
//     },
//     filename: function (req, file, cb) {
//         if (file) {
//             cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname)
//         } else {
//             cb(null, false)
//         }
//     }
// })

// /**********************/

// const uploadphoto = multer({
//     storage: photoStorage,
//     fileFilter: function (req, file, cb) {
//         if (file.mimetype.startsWith('image')) {
//             cb(null, true)
//         } else {
//             cb({ message: "just image alowded" }, false)
//         }
//     },
//     limits: { fileSize: 1024 * 1024 }
// })

// /**********************/
// // PDF Storage
// /**********************/
// const pdfStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, '../pdfs')) 
//     },
//     filename: function (req, file, cb) {
//         if (file) {
//             cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname)
//         } else {
//             cb(null, false)
//         }
//     }
// })

// const uploadPDF = multer({
//     storage: pdfStorage,
//     fileFilter: function (req, file, cb) {
//         if (file.mimetype === 'application/pdf') {
//             cb(null, true)
//         } else {
//             cb({ message: "Only PDF files are allowed" }, false)
//         }
//     },
//     limits: { fileSize: 5 * 1024 * 1024 } 
// })

// // Video Storage
// const videoStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, '../videos')) 
//     },
//     filename: function (req, file, cb) {
//         if (file) {
//             cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname)
//         } else {
//             cb(null, false)
//         }
//     }
// })

// const lessonStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         if (file.fieldname === 'video') {
//             cb(null, path.join(__dirname, '../videos'));
//         } else if (file.fieldname === 'pdf') {
//             cb(null, path.join(__dirname, '../pdfs'));
//         } else {
//             cb(new Error("حقل غير مدعوم"), false);
//         }
//     },
//     filename: function (req, file, cb) {
//         cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
//     }
// });

// const uploadLessonFiles = multer({
//     storage: lessonStorage,
//     fileFilter: function (req, file, cb) {
//         if (file.fieldname === 'video' && file.mimetype.startsWith('video')) {
//             cb(null, true);
//         } else if (file.fieldname === 'pdf' && file.mimetype === 'application/pdf') {
//             cb(null, true);
//         } else {
//             cb(new Error("نوع الملف غير مطابق للحقل المطلوب"), false);
//         }
//     },
//     limits: { fileSize: 100 * 1024 * 1024 }
// });

// const uploadVideo = multer({
//     storage: videoStorage,
//     fileFilter: function (req, file, cb) {
//         if (file.mimetype.startsWith('video')) {
//             cb(null, true)
//         } else {
//             cb({ message: "Only video files are allowed" }, false)
//         }
//     },
//     limits: { fileSize: 50 * 1024 * 1024 }
// })
// module.exports = {
//     photoStorage,
//     uploadphoto,
//     pdfStorage,
//     uploadPDF,
//     videoStorage,
//     uploadVideo,
//     uploadLessonFiles,
//     lessonStorage
// }



const multer = require('multer');
const path = require('path');
const fs = require('fs');

// دالة مساعدة لضمان وجود المجلد، وإنشائه إن لم يكن موجوداً
const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// 1. Photo Storage
const photoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '../images');
        ensureDirExists(dest);
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const cleanFileName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${new Date().toISOString().replace(/:/g, '-')}_${cleanFileName}`);
    }
});

const uploadphoto = multer({
    storage: photoStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new Error("مسموح برفع الصور فقط"), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

// 2. PDF Storage
const pdfStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '../pdfs');
        ensureDirExists(dest);
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const cleanFileName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${new Date().toISOString().replace(/:/g, '-')}_${cleanFileName}`);
    }
});

const uploadPDF = multer({
    storage: pdfStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error("مسموح برفع ملفات PDF فقط"), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

// 3. Video Storage
const videoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '../videos');
        ensureDirExists(dest);
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const cleanFileName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${new Date().toISOString().replace(/:/g, '-')}_${cleanFileName}`);
    }
});

const uploadVideo = multer({
    storage: videoStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('video')) {
            cb(null, true);
        } else {
            cb(new Error("مسموح برفع الفيديوهات فقط"), false);
        }
    },
    limits: { fileSize: 200 * 1024 * 1024 }
});

// 4. Lesson Storage (للجمع بين الفيديو والـ PDF في درس واحد)
const lessonStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest;
        if (file.fieldname === 'video') {
            dest = path.join(__dirname, '../videos');
        } else if (file.fieldname === 'pdf') {
            dest = path.join(__dirname, '../pdfs');
        } else {
            return cb(new Error("حقل غير مدعوم"), false);
        }
        ensureDirExists(dest);
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        // تنظيف اسم الملف من المسافات لتجنب المشاكل في السيرفر
        const cleanFileName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${new Date().toISOString().replace(/:/g, '-')}_${cleanFileName}`);
    }
});

const uploadLessonFiles = multer({
    storage: lessonStorage,
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'video' && file.mimetype.startsWith('video')) {
            cb(null, true);
        } else if (file.fieldname === 'pdf' && file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error("نوع الملف غير مطابق للحقل المطلوب"), false);
        }
    },
    limits: { fileSize: 200 * 1024 * 1024 } // زيادة الحجم ليدعم الفيديوهات
});

module.exports = {
    photoStorage,
    uploadphoto,
    pdfStorage,
    uploadPDF,
    videoStorage,
    uploadVideo,
    uploadLessonFiles,
    lessonStorage
};