const Session = require('../models/Session');
const ApiError = require('../utils/ApiError');

const getAllSessions = async (userId) => {
  return Session.find({ user: userId }).sort({ createdAt: -1 });
};

const createSession = async (userId, { title, subject, notes }) => {
  return Session.create({ user: userId, title, subject, notes: notes || '' });
};

const getSessionById = async (userId, id) => {
  const session = await Session.findOne({ _id: id, user: userId });
  if (!session) throw ApiError.notFound('Session not found');
  return session;
};

const deleteSession = async (userId, id) => {
  const session = await Session.findOneAndDelete({ _id: id, user: userId });
  if (!session) throw ApiError.notFound('Session not found');
};

module.exports = { getAllSessions, createSession, getSessionById, deleteSession };
