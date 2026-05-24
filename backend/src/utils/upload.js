const multer = require('multer');
const path = require('path');
const config = require('../config');
const asyncHandler = require('./asyncHandler');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.upload.uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = config.upload.allowedImageTypes;
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error(
      `Invalid file type. Allowed: ${allowed.join(', ')}`
    );
    err.statusCode = 400;
    cb(err, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

module.exports = upload;
