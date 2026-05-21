/**
 * timetableService.js
 * CRUD for study schedule entries + exam events.
 * Cron job fires every minute to dispatch reminder push notifications.
 */

const cron = require('node-cron');
const Timetable = require('../models/Timetable');
const Exam = require('../models/Exam');
const notificationService = require('./notificationService');

// ── Timetable CRUD ────────────────────────────────────────────────────────────

const getEntries = async (userId, { date, startDate, endDate, type } = {}) => {
  const filter = { user: userId };

  if (type) filter.type = type;

  if (date) {
    // Single-day view: return one-time entries on that date + recurring entries active that day
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(d);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const dayOfWeek = d.getUTCDay(); // 0=Sun … 6=Sat

    filter.$or = [
      // One-time on this date
      { isRecurring: false, date: { $gte: d, $lt: nextDay } },
      // Daily recurring active on this date
      {
        isRecurring: true,
        'recurrence.frequency': 'daily',
        'recurrence.startDate': { $lte: nextDay },
        $or: [
          { 'recurrence.endDate': null },
          { 'recurrence.endDate': { $gte: d } },
        ],
      },
      // Weekly recurring active on this day-of-week
      {
        isRecurring: true,
        'recurrence.frequency': 'weekly',
        'recurrence.daysOfWeek': dayOfWeek,
        'recurrence.startDate': { $lte: nextDay },
        $or: [
          { 'recurrence.endDate': null },
          { 'recurrence.endDate': { $gte: d } },
        ],
      },
    ];
  } else if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filter.$or = [
      { isRecurring: false, date: { $gte: start, $lte: end } },
      {
        isRecurring: true,
        'recurrence.startDate': { $lte: end },
        $or: [{ 'recurrence.endDate': null }, { 'recurrence.endDate': { $gte: start } }],
      },
    ];
  }

  return Timetable.find(filter).sort({ startTime: 1 }).lean();
};

const createEntry = async (userId, data) => {
  const entry = await Timetable.create({ user: userId, ...data });
  return entry;
};

const updateEntry = async (userId, entryId, data) => {
  const entry = await Timetable.findOneAndUpdate(
    { _id: entryId, user: userId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!entry) {
    const err = new Error('Timetable entry not found');
    err.statusCode = 404;
    throw err;
  }
  return entry;
};

const deleteEntry = async (userId, entryId) => {
  const result = await Timetable.findOneAndDelete({ _id: entryId, user: userId });
  if (!result) {
    const err = new Error('Timetable entry not found');
    err.statusCode = 404;
    throw err;
  }
};

const markComplete = async (userId, entryId, isCompleted) => {
  return updateEntry(userId, entryId, {
    isCompleted,
    completedAt: isCompleted ? new Date() : null,
  });
};

// ── Exam CRUD ─────────────────────────────────────────────────────────────────

const getExams = async (userId, { upcoming = false } = {}) => {
  const filter = { user: userId };
  if (upcoming) filter.examDate = { $gte: new Date() };
  return Exam.find(filter).sort({ examDate: 1 }).lean();
};

const createExam = async (userId, data) => {
  const exam = await Exam.create({ user: userId, ...data });
  return exam;
};

const updateExam = async (userId, examId, data) => {
  const exam = await Exam.findOneAndUpdate(
    { _id: examId, user: userId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!exam) {
    const err = new Error('Exam not found');
    err.statusCode = 404;
    throw err;
  }
  return exam;
};

const deleteExam = async (userId, examId) => {
  const result = await Exam.findOneAndDelete({ _id: examId, user: userId });
  if (!result) {
    const err = new Error('Exam not found');
    err.statusCode = 404;
    throw err;
  }
};

// ── Cron — reminder dispatcher ────────────────────────────────────────────────

/**
 * Run every minute.
 * Checks timetable entries and exams whose unsent reminders fall within the
 * current one-minute window and fires push notifications for each.
 */
const startReminderCron = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const windowStart = now;
    const windowEnd = new Date(now.getTime() + 60 * 1000); // +1 min lookahead

    try {
      await _dispatchTimetableReminders(windowStart, windowEnd);
      await _dispatchExamReminders(windowStart, windowEnd);
    } catch (err) {
      console.error('[Cron] Reminder dispatch error:', err.message);
    }
  });

  console.log('[Cron] Reminder scheduler started (every minute)');
};

async function _dispatchTimetableReminders(windowStart, windowEnd) {
  // Find entries that have at least one unsent reminder
  // We don't have a global "next trigger time" field, so we check a rolling window:
  // entry's start datetime minus minutesBefore falls inside [windowStart, windowEnd)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  // Fetch entries with unsent reminders that occur today (one-time) or are recurring
  const entries = await Timetable.find({
    isCompleted: false,
    'reminders.isSent': false,
    $or: [
      { isRecurring: false, date: { $gte: today, $lt: tomorrow } },
      { isRecurring: true },
    ],
  }).lean();

  for (const entry of entries) {
    if (!entry.startTime) continue;

    const [hh, mm] = entry.startTime.split(':').map(Number);
    const entryStart = new Date(today);
    entryStart.setUTCHours(hh, mm, 0, 0);

    for (let ri = 0; ri < entry.reminders.length; ri++) {
      const reminder = entry.reminders[ri];
      if (reminder.isSent) continue;

      const triggerAt = new Date(entryStart.getTime() - reminder.minutesBefore * 60 * 1000);

      if (triggerAt >= windowStart && triggerAt < windowEnd) {
        const minutesLabel =
          reminder.minutesBefore < 60
            ? `${reminder.minutesBefore} min`
            : `${reminder.minutesBefore / 60} hr`;

        await notificationService.sendPushToUser(entry.user.toString(), {
          title: `Study Reminder: ${entry.title}`,
          body: `Your ${entry.type} session starts in ${minutesLabel}`,
          type: 'study_reminder',
          data: { entryId: entry._id.toString(), subject: entry.subject || '' },
        });

        // Mark reminder as sent
        await Timetable.updateOne(
          { _id: entry._id, [`reminders.${ri}.isSent`]: false },
          { $set: { [`reminders.${ri}.isSent`]: true, [`reminders.${ri}.sentAt`]: new Date() } }
        );
      }
    }
  }
}

async function _dispatchExamReminders(windowStart, windowEnd) {
  const exams = await Exam.find({
    isCompleted: false,
    examDate: { $gte: new Date() },
    'reminders.isSent': false,
  }).lean();

  for (const exam of exams) {
    for (let ri = 0; ri < exam.reminders.length; ri++) {
      const reminder = exam.reminders[ri];
      if (reminder.isSent) continue;

      const triggerAt = new Date(exam.examDate.getTime() - reminder.minutesBefore * 60 * 1000);

      if (triggerAt >= windowStart && triggerAt < windowEnd) {
        const hoursLeft = Math.round(reminder.minutesBefore / 60);
        const label = reminder.minutesBefore < 60
          ? `${reminder.minutesBefore} minutes`
          : hoursLeft === 1 ? '1 hour' : `${hoursLeft} hours`;

        await notificationService.sendPushToUser(exam.user.toString(), {
          title: `Exam Reminder: ${exam.subject}`,
          body: `Your exam "${exam.title}" is in ${label}`,
          type: 'exam_reminder',
          data: { examId: exam._id.toString(), subject: exam.subject },
        });

        await Exam.updateOne(
          { _id: exam._id, [`reminders.${ri}.isSent`]: false },
          { $set: { [`reminders.${ri}.isSent`]: true, [`reminders.${ri}.sentAt`]: new Date() } }
        );
      }
    }
  }
}

module.exports = {
  // Timetable
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  markComplete,
  // Exams
  getExams,
  createExam,
  updateExam,
  deleteExam,
  // Cron
  startReminderCron,
};
