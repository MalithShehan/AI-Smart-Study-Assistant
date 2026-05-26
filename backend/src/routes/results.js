const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const apiResponse = require('../utils/apiResponse');
const { protect } = require('../middlewares/auth');
const Quiz = require('../models/Quiz'); // Assuming Quiz model exists
const Result = require('../models/Result'); // New model for storing results
const User = require('../models/User');

const router = express.Router();

// ============================================================================
// GET QUIZ RESULTS
// ============================================================================

router.get(
  '/quiz-results/:quizId',
  protect,
  asyncHandler(async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user._id;

    // Fetch result from database
    const result = await Result.findOne({
      quizId,
      userId,
    }).populate('quizId');

    if (!result) {
      throw new ApiError(404, 'Quiz result not found');
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, result, 'Quiz result retrieved successfully')
      );
  })
);

// ============================================================================
// SUBMIT QUIZ AND GET RESULTS
// ============================================================================

router.post(
  '/submit-quiz',
  protect,
  asyncHandler(async (req, res) => {
    const { quizId, answers, timeTaken } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!quizId || !answers || !timeTaken) {
      throw new ApiError(400, 'Missing required fields: quizId, answers, timeTaken');
    }

    if (!Array.isArray(answers)) {
      throw new ApiError(400, 'Answers must be an array');
    }

    // Fetch quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new ApiError(404, 'Quiz not found');
    }

    // Calculate score
    let correctCount = 0;
    const detailedResults = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) correctCount++;

      return {
        id: question._id || `q-${index}`,
        question: question.text,
        userAnswer,
        correctAnswer: question.correctAnswer,
        options: question.options,
        isCorrect,
        explanation: question.explanation || null,
      };
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);

    // Save result to database
    const result = await Result.create({
      userId,
      quizId,
      score: correctCount,
      totalQuestions: quiz.questions.length,
      percentage,
      timeTaken,
      questions: detailedResults,
      completedAt: new Date(),
    });

    // Update user statistics
    await User.findByIdAndUpdate(userId, {
      $inc: {
        'stats.quizzesCompleted': 1,
        'stats.totalScore': correctCount,
      },
    });

    return res
      .status(201)
      .json(
        new apiResponse(
          201,
          {
            resultId: result._id,
            score: correctCount,
            totalQuestions: quiz.questions.length,
            percentage,
            timeTaken,
            questions: detailedResults,
          },
          'Quiz submitted successfully'
        )
      );
  })
);

// ============================================================================
// GET ALL QUIZ RESULTS FOR USER
// ============================================================================

router.get(
  '/results',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { limit = 10, page = 1, sort = '-completedAt' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const results = await Result.find({ userId })
      .populate('quizId', 'title subject')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Result.countDocuments({ userId });

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          {
            results,
            pagination: {
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              pages: Math.ceil(total / parseInt(limit)),
            },
          },
          'Quiz results retrieved successfully'
        )
      );
  })
);

// ============================================================================
// GET QUIZ PERFORMANCE ANALYTICS
// ============================================================================

router.get(
  '/analytics/performance',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Aggregate performance metrics
    const results = await Result.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          averageScore: { $avg: '$percentage' },
          maxScore: { $max: '$percentage' },
          minScore: { $min: '$percentage' },
          totalTimeSpent: { $sum: '$timeTaken' },
          averageTime: { $avg: '$timeTaken' },
          totalCorrectAnswers: { $sum: '$score' },
        },
      },
    ]);

    const analytics = results[0] || {
      totalQuizzes: 0,
      averageScore: 0,
      maxScore: 0,
      minScore: 0,
      totalTimeSpent: 0,
      averageTime: 0,
      totalCorrectAnswers: 0,
    };

    return res
      .status(200)
      .json(
        new apiResponse(200, analytics, 'Performance analytics retrieved successfully')
      );
  })
);

// ============================================================================
// DELETE ACCOUNT
// ============================================================================

router.post(
  '/delete-account',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Delete user data
    await User.findByIdAndDelete(userId);
    await Result.deleteMany({ userId });

    return res
      .status(200)
      .json(new apiResponse(200, null, 'Account deleted successfully'));
  })
);

// ============================================================================
// UPDATE USER PREFERENCES
// ============================================================================

router.patch(
  '/preferences',
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const {
      notifications,
      emailUpdates,
      darkMode,
      analyticsEnabled,
    } = req.body;

    const preferences = {};
    if (notifications !== undefined) preferences['preferences.notifications'] = notifications;
    if (emailUpdates !== undefined) preferences['preferences.emailUpdates'] = emailUpdates;
    if (darkMode !== undefined) preferences['preferences.darkMode'] = darkMode;
    if (analyticsEnabled !== undefined) preferences['preferences.analyticsEnabled'] = analyticsEnabled;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: preferences },
      { new: true }
    );

    return res
      .status(200)
      .json(new apiResponse(200, user, 'Preferences updated successfully'));
  })
);

module.exports = router;
