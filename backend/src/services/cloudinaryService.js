const cloudinary = require('cloudinary').v2;
const config = require('../config');

// ── Lazy singleton ─────────────────────────────────────────────────────────────
let _configured = false;

const getCloudinary = () => {
  if (_configured) return cloudinary;
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    const err = new Error('Cloudinary credentials are not configured');
    err.statusCode = 503;
    throw err;
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  _configured = true;
  return cloudinary;
};

// ── Core upload helper ─────────────────────────────────────────────────────────

/**
 * Upload a buffer to Cloudinary via an upload stream.
 * @param {Buffer} buffer
 * @param {object} options - Cloudinary upload_stream options
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });

// ── Public helpers ─────────────────────────────────────────────────────────────

/**
 * Upload (or replace) a user's profile image.
 * Applies face-aware cropping and auto-format optimisation.
 * @param {Buffer} buffer
 * @param {string} userId
 */
const uploadProfileImage = async (buffer, userId) => {
  const result = await uploadBuffer(buffer, {
    folder: 'ai-study-assistant/profiles',
    public_id: `profile_${userId}`,
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
};

/**
 * Upload a note image (e.g. a scanned page or whiteboard photo).
 * @param {Buffer} buffer
 * @param {string} userId
 */
const uploadNoteImage = async (buffer, userId) => {
  const result = await uploadBuffer(buffer, {
    folder: 'ai-study-assistant/notes',
    public_id: `note_${userId}_${Date.now()}`,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
};

/**
 * Upload a PDF document.
 * Stored as resource_type 'raw' so the original file is preserved.
 * @param {Buffer} buffer
 * @param {string} userId
 */
const uploadPdf = async (buffer, userId) => {
  const result = await uploadBuffer(buffer, {
    folder: 'ai-study-assistant/pdfs',
    public_id: `pdf_${userId}_${Date.now()}`,
    resource_type: 'raw',
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
    format: 'pdf',
  };
};

/**
 * Delete a Cloudinary resource by its public_id.
 * @param {string} publicId
 * @param {'image'|'raw'} [resourceType='image']
 */
const deleteResource = (publicId, resourceType = 'image') =>
  getCloudinary().uploader.destroy(publicId, { resource_type: resourceType });

module.exports = { uploadProfileImage, uploadNoteImage, uploadPdf, deleteResource };
