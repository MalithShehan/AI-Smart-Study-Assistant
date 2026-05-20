const studyService = require('../services/studyService');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');

const getSessions = asyncHandler(async (req, res) => {
  const sessions = await studyService.getAllSessions();
  apiResponse.success(res, sessions, 'Sessions retrieved');
});

const createSession = asyncHandler(async (req, res) => {
  const { title, subject, notes } = req.body;
  const session = await studyService.createSession({ title, subject, notes });
  apiResponse.created(res, session, 'Session created');
});

const getSessionById = asyncHandler(async (req, res) => {
  const session = await studyService.getSessionById(req.params.id);
  apiResponse.success(res, session, 'Session retrieved');
});

const deleteSession = asyncHandler(async (req, res) => {
  await studyService.deleteSession(req.params.id);
  res.status(204).send();
});

module.exports = { getSessions, createSession, getSessionById, deleteSession };
