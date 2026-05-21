const express = require('express');
const router = express.Router();

const timetableController = require('../controllers/timetableController');
const { protect } = require('../middlewares/auth');
const {
  validateCreateEntry,
  validateUpdateEntry,
  validateCreateExam,
  validateUpdateExam,
} = require('../validators/timetableValidator');

// All timetable routes require authentication
router.use(protect);

// ── Study schedule entries ────────────────────────────────────────────────────
// GET  /timetable?date=YYYY-MM-DD
// GET  /timetable?startDate=...&endDate=...
// GET  /timetable?type=study|revision|lecture|break|other
router.get('/', timetableController.getEntries);
router.post('/', validateCreateEntry, timetableController.createEntry);
router.put('/:id', validateUpdateEntry, timetableController.updateEntry);
router.delete('/:id', timetableController.deleteEntry);
router.patch('/:id/complete', timetableController.markComplete);

// ── Exam notifications ────────────────────────────────────────────────────────
// GET  /timetable/exams?upcoming=true
router.get('/exams', timetableController.getExams);
router.post('/exams', validateCreateExam, timetableController.createExam);
router.put('/exams/:id', validateUpdateExam, timetableController.updateExam);
router.delete('/exams/:id', timetableController.deleteExam);

module.exports = router;
