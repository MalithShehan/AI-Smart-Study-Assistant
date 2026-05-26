const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const apiResponse = require('../utils/apiResponse');
const StudyPlan = require('../models/StudyPlan');
const aiService = require('../services/aiService');
const Gamification = require('../models/Gamification');

// ══════════════════════════════════════════════════════════════════════════════
// STUDY PLAN CONTROLLER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/v1/study-plans/generate
 * @desc    Generate AI study plan for a date
 * @access  Private
 */
const generateStudyPlan = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { date, subjects, studyHours, focusAreas, preferredTime } = req.body;
  
  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  
  // Check if plan already exists
  const existingPlan = await StudyPlan.findOne({ userId, date: targetDate });
  if (existingPlan) {
    throw new ApiError(400, 'Study plan already exists for this date');
  }
  
  // Generate AI study plan
  const aiPlanData = await aiService.generateStudyPlan({
    subjects: subjects || [],
    studyHours: studyHours || 4,
    focusAreas: focusAreas || [],
    preferredTime: preferredTime || 'morning',
  });
  
  // Create study plan
  const studyPlan = await StudyPlan.create({
    userId,
    date: targetDate,
    title: aiPlanData.title || `Study Plan for ${targetDate.toDateString()}`,
    summary: aiPlanData.summary,
    motivationalMessage: aiPlanData.motivationalMessage,
    tasks: aiPlanData.tasks,
    totalTasks: aiPlanData.tasks.length,
    totalDuration: aiPlanData.tasks.reduce((sum, t) => sum + t.duration, 0),
    estimatedStudyTime: studyHours * 60,
    subjects: subjects || [],
    focusAreas: focusAreas || [],
    generatedBy: 'ai',
    aiModel: 'gpt-4',
    aiPrompt: aiPlanData.prompt,
  });
  
  return res
    .status(201)
    .json(new apiResponse(201, studyPlan, 'Study plan generated successfully'));
});

/**
 * @route   GET /api/v1/study-plans/today
 * @desc    Get today's study plan
 * @access  Private
 */
const getTodaysPlan = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const plan = await StudyPlan.getTodaysPlan(userId);
  
  if (!plan) {
    return res
      .status(200)
      .json(new apiResponse(200, null, 'No study plan for today'));
  }
  
  return res
    .status(200)
    .json(new apiResponse(200, plan, "Today's study plan retrieved successfully"));
});

/**
 * @route   GET /api/v1/study-plans
 * @desc    Get study plans (with date filter)
 * @access  Private
 */
const getStudyPlans = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate, days = 7, status } = req.query;
  
  let query = { userId };
  
  if (status) {
    query.status = status;
  }
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (days) {
    const plans = await StudyPlan.getUpcomingPlans(userId, parseInt(days));
    return res
      .status(200)
      .json(new apiResponse(200, plans, 'Study plans retrieved successfully'));
  }
  
  const plans = await StudyPlan.find(query).sort({ date: -1 }).limit(30);
  
  return res
    .status(200)
    .json(new apiResponse(200, plans, 'Study plans retrieved successfully'));
});

/**
 * @route   GET /api/v1/study-plans/:id
 * @desc    Get single study plan
 * @access  Private
 */
const getStudyPlan = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  
  const plan = await StudyPlan.findOne({ _id: id, userId });
  
  if (!plan) {
    throw new ApiError(404, 'Study plan not found');
  }
  
  return res
    .status(200)
    .json(new apiResponse(200, plan, 'Study plan retrieved successfully'));
});

/**
 * @route   PATCH /api/v1/study-plans/:id/task/:taskId/complete
 * @desc    Mark task as completed
 * @access  Private
 */
const completeTask = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id, taskId } = req.params;
  
  const plan = await StudyPlan.findOne({ _id: id, userId });
  
  if (!plan) {
    throw new ApiError(404, 'Study plan not found');
  }
  
  const result = plan.completeTask(taskId);
  await plan.save();
  
  // Add gamification points
  const gamification = await Gamification.findOne({ userId });
  if (gamification) {
    gamification.addPoints(20, 'task_completed');
    gamification.incrementStat('totalStudyMinutes', plan.tasks.id(taskId).duration);
    await gamification.save();
  }
  
  return res
    .status(200)
    .json(new apiResponse(200, { ...result, plan }, 'Task completed successfully'));
});

/**
 * @route   POST /api/v1/study-plans/:id/task
 * @desc    Add task to study plan
 * @access  Private
 */
const addTask = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const taskData = req.body;
  
  const plan = await StudyPlan.findOne({ _id: id, userId });
  
  if (!plan) {
    throw new ApiError(404, 'Study plan not found');
  }
  
  plan.addTask(taskData);
  await plan.save();
  
  return res
    .status(200)
    .json(new apiResponse(200, plan, 'Task added successfully'));
});

/**
 * @route   DELETE /api/v1/study-plans/:id/task/:taskId
 * @desc    Remove task from study plan
 * @access  Private
 */
const removeTask = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id, taskId } = req.params;
  
  const plan = await StudyPlan.findOne({ _id: id, userId });
  
  if (!plan) {
    throw new ApiError(404, 'Study plan not found');
  }
  
  plan.removeTask(taskId);
  await plan.save();
  
  return res
    .status(200)
    .json(new apiResponse(200, plan, 'Task removed successfully'));
});

/**
 * @route   PATCH /api/v1/study-plans/:id
 * @desc    Update study plan
 * @access  Private
 */
const updateStudyPlan = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { title, summary, status } = req.body;
  
  const plan = await StudyPlan.findOne({ _id: id, userId });
  
  if (!plan) {
    throw new ApiError(404, 'Study plan not found');
  }
  
  if (title) plan.title = title;
  if (summary) plan.summary = summary;
  if (status) plan.status = status;
  
  await plan.save();
  
  return res
    .status(200)
    .json(new apiResponse(200, plan, 'Study plan updated successfully'));
});

/**
 * @route   DELETE /api/v1/study-plans/:id
 * @desc    Delete study plan
 * @access  Private
 */
const deleteStudyPlan = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  
  const plan = await StudyPlan.findOne({ _id: id, userId });
  
  if (!plan) {
    throw new ApiError(404, 'Study plan not found');
  }
  
  await plan.deleteOne();
  
  return res
    .status(200)
    .json(new apiResponse(200, null, 'Study plan deleted successfully'));
});

/**
 * @route   GET /api/v1/study-plans/stats/overview
 * @desc    Get study plan completion stats
 * @access  Private
 */
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { days = 30 } = req.query;
  
  const stats = await StudyPlan.getCompletionStats(userId, parseInt(days));
  
  return res
    .status(200)
    .json(new apiResponse(200, stats, 'Stats retrieved successfully'));
});

module.exports = {
  generateStudyPlan,
  getTodaysPlan,
  getStudyPlans,
  getStudyPlan,
  completeTask,
  addTask,
  removeTask,
  updateStudyPlan,
  deleteStudyPlan,
  getStats,
};
