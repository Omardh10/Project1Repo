const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const verifytoken = (req, res, next) => {

    const authtoken = req.headers.authorization;
    if (authtoken) {
        const token = authtoken.split(" ")[1];        //    Authorization && authorization    //
        try {
            const decoded = jwt.verify(token, process.env.JWT_KEY)
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(400).json({ message: "invalid token ..." })
        }
    } else {
        return res.status(406).json({ message: "no token provided" })
    }
}
const verifytokenandisAdmin = (req, res, next) => {
    verifytoken(req, res, () => {
        if (req.user.role.admin) {
            next();
        } else {
            return res.status(500).json({ message: "you are not allowd you are not Admin ... " })
        }
    })
}
const verifytokenandonlyuser = (req, res, next) => {
    verifytoken(req, res, () => {
        if (req.user.id === req.params.id) {
            next();
        } else {
            return res.status(500).json({ message: "you are not allowd only user himself ... " })
        }
    })
}
const verifytokenandauthorization = (req, res, next) => {
    verifytoken(req, res, () => {
        if (req.user.id === req.params.id || req.user.role.admin) {
            next();
        } else {
            return res.status(500).json({ message: "you are not allowd ... " })
        }
    })
}
module.exports = {
    verifytoken,
    verifytokenandisAdmin,
    verifytokenandonlyuser,
    verifytokenandauthorization
};

