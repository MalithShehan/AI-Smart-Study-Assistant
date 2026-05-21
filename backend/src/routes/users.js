const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, requireEmailVerified, authorize } = require('../middlewares/auth');
const upload = require('../utils/upload');
const { validateUpdateProfile, validateAddNote } = require('../validators/userValidator');

// All user routes require authentication
router.use(protect);

// ── Own profile ───────────────────────────────────────────────────────────────
router.patch('/me', validateUpdateProfile, userController.updateProfile);
router.post('/me/avatar', upload.single('avatar'), userController.uploadProfileImage);

// ── Study stats ───────────────────────────────────────────────────────────────
router.get('/me/stats', userController.getMyStats);
router.patch('/me/stats', userController.updateMyStats);

// ── Saved notes ───────────────────────────────────────────────────────────────
router.get('/me/notes', userController.getMySavedNotes);
router.post('/me/notes', validateAddNote, userController.addSavedNote);
router.delete('/me/notes/:noteId', userController.deleteSavedNote);

// ── Admin only ─────────────────────────────────────────────────────────────────
router.get('/', authorize('admin'), userController.getAllUsers);
router.get('/:id', authorize('admin'), userController.getUserById);
router.patch('/:id', authorize('admin'), userController.adminUpdateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
