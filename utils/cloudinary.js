const cloudinary = require('cloudinary').v2; // يفضل استخدام .v2 دائماً
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadFile = async (filetoupload, resourceType = 'auto') => {
    try {
        const data = await cloudinary.uploader.upload(filetoupload, { 
            resource_type: resourceType 
        });
        return data;
    } catch (error) {
        console.error("Cloudinary Upload Error Details:", error);
        throw error; // 👈 مهم جداً: رمي الخطأ ليتعامل معه الـ catch في الـ Controller
    }
};

const RemoveImage = async (imagepublicid) => {
    try {
        const result = await cloudinary.uploader.destroy(imagepublicid);
        return result;
    } catch (error) {
        throw error;
    }
};

const RemovePDF = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        return result;
    } catch (error) {
        throw error;
    }
};

const RemoveVideo = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    UploadFile,
    RemoveImage,
    RemovePDF,
    RemoveVideo
};