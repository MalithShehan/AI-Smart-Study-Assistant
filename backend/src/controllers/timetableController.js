const timetableService = require('../services/timetableService');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');

// ── Timetable entries ─────────────────────────────────────────────────────────

const getEntries = asyncHandler(async (req, res) => {
  const { date, startDate, endDate, type } = req.query;
  const entries = await timetableService.getEntries(req.user._id, { date, startDate, endDate, type });
  apiResponse.success(res, entries, 'Timetable entries retrieved');
});

const createEntry = asyncHandler(async (req, res) => {
  const entry = await timetableService.createEntry(req.user._id, req.body);
  apiResponse.created(res, entry, 'Timetable entry created');
});

const updateEntry = asyncHandler(async (req, res) => {
  const entry = await timetableService.updateEntry(req.user._id, req.params.id, req.body);
  apiResponse.success(res, entry, 'Timetable entry updated');
});

const deleteEntry = asyncHandler(async (req, res) => {
  await timetableService.deleteEntry(req.user._id, req.params.id);
  res.status(204).send();
});

const markComplete = asyncHandler(async (req, res) => {
  const { isCompleted = true } = req.body;
  const entry = await timetableService.markComplete(req.user._id, req.params.id, isCompleted);
  apiResponse.success(res, entry, 'Entry completion status updated');
});

// ── Exam entries ──────────────────────────────────────────────────────────────

const getExams = asyncHandler(async (req, res) => {
  const upcoming = req.query.upcoming === 'true';
  const exams = await timetableService.getExams(req.user._id, { upcoming });
  apiResponse.success(res, exams, 'Exams retrieved');
});

const createExam = asyncHandler(async (req, res) => {
  const exam = await timetableService.createExam(req.user._id, req.body);
  apiResponse.created(res, exam, 'Exam created');
});

const updateExam = asyncHandler(async (req, res) => {
  const exam = await timetableService.updateExam(req.user._id, req.params.id, req.body);
  apiResponse.success(res, exam, 'Exam updated');
});

const deleteExam = asyncHandler(async (req, res) => {
  await timetableService.deleteExam(req.user._id, req.params.id);
  res.status(204).send();
});

module.exports = {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  markComplete,
  getExams,
  createExam,
  updateExam,
  deleteExam,
};
