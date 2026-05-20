const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { imageUpload, pdfUpload } = require('../utils/multerMemory');
const { protect } = require('../middlewares/auth');
const { validateDeleteUpload } = require('../validators/uploadValidator');

// All upload endpoints require a valid JWT
router.use(protect);

/**
 * POST /api/v1/uploads/profile-image
 * Replace the current user's avatar on Cloudinary.
 * Accepts: JPEG, PNG, WEBP  |  Max: 10 MB
 * Multipart field: "image"
 */
router.post('/profile-image', imageUpload.single('image'), uploadController.uploadProfileImage);

/**
 * POST /api/v1/uploads/note-image
 * Store a scanned note or whiteboard photo on Cloudinary.
 * Accepts: JPEG, PNG, WEBP  |  Max: 10 MB
 * Multipart field: "image"
 */
router.post('/note-image', imageUpload.single('image'), uploadController.uploadNoteImage);

/**
 * POST /api/v1/uploads/pdf
 * Upload a PDF study document to Cloudinary (resource_type: raw).
 * Accepts: PDF  |  Max: 20 MB
 * Multipart field: "file"
 */
router.post('/pdf', pdfUpload.single('file'), uploadController.uploadPdf);

/**
 * DELETE /api/v1/uploads/:publicId
 * Remove a previously uploaded resource from Cloudinary.
 * Query: resourceType = 'image' | 'raw'  (default: 'image')
 * Note: publicId must be URL-encoded if it contains slashes.
 */
router.delete('/:publicId', validateDeleteUpload, uploadController.deleteUpload);

module.exports = router;
