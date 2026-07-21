const multer = require('multer');
const path = require('path');

const photoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../images'))
    },
    filename: function (req, file, cb) {
        if (file) {
            cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname)
        } else {
            cb(null, false)
        }
    }
})

/**********************/

const uploadphoto = multer({
    storage: photoStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image')) {
            cb(null, true)
        } else {
            cb({ message: "just image alowded" }, false)
        }
    },
    limits: { fileSize: 1024 * 1024 }
})

/**********************/
// PDF Storage
/**********************/
const pdfStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../pdfs')) 
    },
    filename: function (req, file, cb) {
        if (file) {
            cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname)
        } else {
            cb(null, false)
        }
    }
})

const uploadPDF = multer({
    storage: pdfStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true)
        } else {
            cb({ message: "Only PDF files are allowed" }, false)
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } 
})

// Video Storage
const videoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../videos')) 
    },
    filename: function (req, file, cb) {
        if (file) {
            cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname)
        } else {
            cb(null, false)
        }
    }
})

const lessonStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'video') {
            cb(null, path.join(__dirname, '../videos'));
        } else if (file.fieldname === 'pdf') {
            cb(null, path.join(__dirname, '../pdfs'));
        } else {
            cb(new Error("حقل غير مدعوم"), false);
        }
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
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
    limits: { fileSize: 100 * 1024 * 1024 }
});

const uploadVideo = multer({
    storage: videoStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('video')) {
            cb(null, true)
        } else {
            cb({ message: "Only video files are allowed" }, false)
        }
    },
    limits: { fileSize: 50 * 1024 * 1024 }
})
module.exports = {
    photoStorage,
    uploadphoto,
    pdfStorage,
    uploadPDF,
    videoStorage,
    uploadVideo,
    uploadLessonFiles,
    lessonStorage
}