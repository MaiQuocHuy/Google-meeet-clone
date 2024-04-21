const multer = require("multer");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname); // use the original name for the uploaded file
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
