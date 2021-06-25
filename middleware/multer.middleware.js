const { diskStorage } = require("multer");
const multer = require("multer");

const storage = diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "./public/uploads");
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now()+ '-' + file.originalname + '.xlsx')
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024*1024*50  // max file size 50mb
    }
})

module.exports = upload;