const multer = require('multer');
const config = require('../config');

const memoryStorage = multer.memoryStorage();

const makeFilter = (allowed) => (req, file, cb) => {
  if (allowed.includes(file.mimetype)) return cb(null, true);
  const err = new Error(`Invalid file type. Allowed: ${allowed.join(', ')}`);
  err.statusCode = 400;
  cb(err, false);
};

/** Accepts JPEG, PNG, WEBP — stores in memory as buffer. */
const imageUpload = multer({
  storage: memoryStorage,
  fileFilter: makeFilter(config.upload.allowedImageTypes),
  limits: { fileSize: config.upload.maxFileSize },
});

/** Accepts PDF only — stores in memory as buffer. */
const pdfUpload = multer({
  storage: memoryStorage,
  fileFilter: makeFilter(config.upload.allowedPdfTypes),
  limits: { fileSize: config.upload.maxPdfSize },
});

/** Accepts images + PDF — used by OCR endpoints. */
const anyUpload = multer({
  storage: memoryStorage,
  fileFilter: makeFilter([
    ...config.upload.allowedImageTypes,
    ...config.upload.allowedPdfTypes,
  ]),
  limits: { fileSize: config.upload.maxPdfSize },
});

module.exports = { imageUpload, pdfUpload, anyUpload };
