const cloudinaryService = require('../services/cloudinaryService');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');

/**
 * POST /api/v1/uploads/profile-image
 * Upload or replace the authenticated user's profile image.
 * Multipart field name: "image"
 */
const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) return apiResponse.error(res, 'No image file provided', 400);
  const result = await cloudinaryService.uploadProfileImage(
    req.file.buffer,
    req.user._id.toString()
  );
  apiResponse.success(res, { image: result }, 'Profile image uploaded');
});

/**
 * POST /api/v1/uploads/note-image
 * Upload a note image (scan, whiteboard photo, etc.).
 * Multipart field name: "image"
 */
const uploadNoteImage = asyncHandler(async (req, res) => {
  if (!req.file) return apiResponse.error(res, 'No image file provided', 400);
  const result = await cloudinaryService.uploadNoteImage(
    req.file.buffer,
    req.user._id.toString()
  );
  apiResponse.success(res, { image: result }, 'Note image uploaded');
});

/**
 * POST /api/v1/uploads/pdf
 * Upload a PDF study document.
 * Multipart field name: "file"
 */
const uploadPdf = asyncHandler(async (req, res) => {
  if (!req.file) return apiResponse.error(res, 'No PDF file provided', 400);
  const result = await cloudinaryService.uploadPdf(req.file.buffer, req.user._id.toString());
  apiResponse.success(res, { file: result }, 'PDF uploaded');
});

/**
 * DELETE /api/v1/uploads/:publicId
 * Delete a previously uploaded resource by its Cloudinary public_id.
 * Query param: resourceType = 'image' | 'raw'  (default: 'image')
 */
const deleteUpload = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const { resourceType = 'image' } = req.query;
  await cloudinaryService.deleteResource(decodeURIComponent(publicId), resourceType);
  apiResponse.success(res, null, 'Resource deleted');
});

module.exports = { uploadProfileImage, uploadNoteImage, uploadPdf, deleteUpload };
