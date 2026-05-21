const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const upload = require('../utils/upload');
const path = require('path');
const fs = require('fs');

// ── Get all users (admin) ────────────────────────────────────────────────────

const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-__v').skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return apiResponse.success(res, {
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }, 'Users retrieved');
});

// ── Get single user ──────────────────────────────────────────────────────────

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-__v');
  if (!user) return apiResponse.error(res, 'User not found', 404);
  return apiResponse.success(res, { user }, 'User retrieved');
});

// ── Update own profile ────────────────────────────────────────────────────────

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'bio', 'institution', 'subjects'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  return apiResponse.success(res, { user }, 'Profile updated');
});

// ── Upload profile image ──────────────────────────────────────────────────────

const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) return apiResponse.error(res, 'No image file provided', 400);

  // Remove old image if it exists and is stored locally
  const current = await User.findById(req.user.id).select('profileImage');
  if (current?.profileImage?.url && current.profileImage.url.startsWith('/uploads/')) {
    const oldPath = path.join(process.cwd(), current.profileImage.url);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profileImage: { url: imageUrl, publicId: req.file.filename } },
    { new: true }
  );

  return apiResponse.success(res, { profileImage: user.profileImage }, 'Profile image updated');
});

// ── Admin: update any user ────────────────────────────────────────────────────

const adminUpdateUser = asyncHandler(async (req, res) => {
  const allowed = ['name', 'role', 'isActive', 'bio', 'institution'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) return apiResponse.error(res, 'User not found', 404);

  return apiResponse.success(res, { user }, 'User updated');
});

// ── Admin: delete user ────────────────────────────────────────────────────────

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return apiResponse.error(res, 'User not found', 404);
  return res.status(204).send();
});

// ── Study stats ───────────────────────────────────────────────────────────────

const getMyStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('studyStats name email');
  return apiResponse.success(res, { studyStats: user.studyStats }, 'Study stats retrieved');
});

const updateMyStats = asyncHandler(async (req, res) => {
  const allowed = [
    'totalStudyMinutes', 'totalSessions', 'totalNotesCreated',
    'totalQuizzesCompleted', 'averageQuizScore', 'streakDays',
    'longestStreakDays', 'lastStudiedAt',
  ];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[`studyStats.${field}`] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, {
    new: true,
    runValidators: true,
  });
  return apiResponse.success(res, { studyStats: user.studyStats }, 'Study stats updated');
});

// ── Saved notes ───────────────────────────────────────────────────────────────

const getMySavedNotes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('savedNotes');
  return apiResponse.success(res, { notes: user.savedNotes }, 'Saved notes retrieved');
});

const addSavedNote = asyncHandler(async (req, res) => {
  const { title, content, subject, tags } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $push: { savedNotes: { title, content, subject, tags } } },
    { new: true, runValidators: true }
  );
  const note = user.savedNotes[user.savedNotes.length - 1];
  return apiResponse.created(res, { note }, 'Note saved');
});

const deleteSavedNote = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    $pull: { savedNotes: { _id: req.params.noteId } },
  });
  return res.status(204).send();
});

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  uploadProfileImage,
  adminUpdateUser,
  deleteUser,
  getMyStats,
  updateMyStats,
  getMySavedNotes,
  addSavedNote,
  deleteSavedNote,
};
