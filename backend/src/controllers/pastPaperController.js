const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const apiResponse = require('../utils/apiResponse');
const PastPaper = require('../models/PastPaper');
const cloudinaryService = require('../services/cloudinaryService');

/**
 * @route   GET /api/v1/papers
 * @desc    Get all past papers (with filters)
 * @access  Private
 */
const getAllPapers = asyncHandler(async (req, res) => {
  const { subject, year, examBoard, level, search, limit = 20, page = 1 } = req.query;
  const userId = req.user._id;

  const query = { userId };

  if (subject) query.subject = subject;
  if (year) query.year = parseInt(year);
  if (examBoard) query.examBoard = examBoard;
  if (level) query.level = level;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const papers = await PastPaper.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');

  const total = await PastPaper.countDocuments(query);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        {
          papers,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
        'Past papers retrieved successfully'
      )
    );
});

/**
 * @route   GET /api/v1/papers/:id
 * @desc    Get single past paper
 * @access  Private
 */
const getPaper = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const paper = await PastPaper.findOne({ _id: id, userId });

  if (!paper) {
    throw new ApiError(404, 'Past paper not found');
  }

  return res.status(200).json(new apiResponse(200, paper, 'Past paper retrieved successfully'));
});

/**
 * @route   POST /api/v1/papers
 * @desc    Upload new past paper
 * @access  Private
 */
const uploadPaper = asyncHandler(async (req, res) => {
  const { title, subject, year, examBoard, level, paperType, tags, isPublic } = req.body;
  const userId = req.user._id;

  if (!req.file) {
    throw new ApiError(400, 'Please upload a PDF file');
  }

  // Upload to Cloudinary
  const uploadResult = await cloudinaryService.uploadFile(req.file.buffer, {
    folder: 'past-papers',
    resource_type: 'raw',
    format: 'pdf',
  });

  const paper = await PastPaper.create({
    userId,
    title,
    subject,
    year: parseInt(year),
    examBoard,
    level,
    paperType,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
    isPublic: isPublic === 'true' || isPublic === true,
    file: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      filename: req.file.originalname,
      size: req.file.size,
      format: uploadResult.format,
    },
  });

  return res.status(201).json(new apiResponse(201, paper, 'Past paper uploaded successfully'));
});

/**
 * @route   PATCH /api/v1/papers/:id
 * @desc    Update past paper details
 * @access  Private
 */
const updatePaper = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { title, subject, year, examBoard, level, paperType, tags, isPublic, isFavourite } =
    req.body;

  const paper = await PastPaper.findOne({ _id: id, userId });

  if (!paper) {
    throw new ApiError(404, 'Past paper not found');
  }

  if (title) paper.title = title;
  if (subject) paper.subject = subject;
  if (year) paper.year = parseInt(year);
  if (examBoard) paper.examBoard = examBoard;
  if (level) paper.level = level;
  if (paperType) paper.paperType = paperType;
  if (tags) paper.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
  if (isPublic !== undefined) paper.isPublic = isPublic;
  if (isFavourite !== undefined) paper.isFavourite = isFavourite;

  await paper.save();

  return res.status(200).json(new apiResponse(200, paper, 'Past paper updated successfully'));
});

/**
 * @route   DELETE /api/v1/papers/:id
 * @desc    Delete past paper
 * @access  Private
 */
const deletePaper = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const paper = await PastPaper.findOne({ _id: id, userId });

  if (!paper) {
    throw new ApiError(404, 'Past paper not found');
  }

  // Delete from Cloudinary
  await cloudinaryService.deleteFile(paper.file.publicId, 'raw');

  await paper.deleteOne();

  return res.status(200).json(new apiResponse(200, null, 'Past paper deleted successfully'));
});

/**
 * @route   POST /api/v1/papers/:id/download
 * @desc    Increment download count and get download URL
 * @access  Private
 */
const downloadPaper = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const paper = await PastPaper.findOne({ _id: id, userId });

  if (!paper) {
    throw new ApiError(404, 'Past paper not found');
  }

  await paper.incrementDownloadCount();

  return res
    .status(200)
    .json(
      new apiResponse(200, { downloadUrl: paper.file.url }, 'Download URL retrieved successfully')
    );
});

/**
 * @route   GET /api/v1/papers/stats/summary
 * @desc    Get user's past paper statistics
 * @access  Private
 */
const getPaperStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await PastPaper.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalPapers: { $sum: 1 },
        totalDownloads: { $sum: '$downloadCount' },
        subjects: { $addToSet: '$subject' },
        favourites: { $sum: { $cond: ['$isFavourite', 1, 0] } },
      },
    },
  ]);

  const subjectBreakdown = await PastPaper.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$subject',
        count: { $sum: 1 },
        downloads: { $sum: '$downloadCount' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        {
          summary: stats[0] || {
            totalPapers: 0,
            totalDownloads: 0,
            subjects: [],
            favourites: 0,
          },
          subjectBreakdown,
        },
        'Past paper statistics retrieved successfully'
      )
    );
});

module.exports = {
  getAllPapers,
  getPaper,
  uploadPaper,
  updatePaper,
  deletePaper,
  downloadPaper,
  getPaperStats,
};
