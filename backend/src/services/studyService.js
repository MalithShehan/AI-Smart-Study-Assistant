/**
 * Study session business logic.
 * Uses an in-memory store — swap out for a real DB (MongoDB, PostgreSQL, etc.)
 * by replacing these functions without touching the controllers or routes.
 */

let sessions = [];
let nextId = 1;

const getAllSessions = async () => sessions;

const createSession = async ({ title, subject, notes }) => {
  const session = {
    id: nextId++,
    title,
    subject,
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };
  sessions.push(session);
  return session;
};

const getSessionById = async (id) => {
  const session = sessions.find((s) => s.id === parseInt(id, 10));
  if (!session) {
    const err = new Error('Session not found');
    err.statusCode = 404;
    throw err;
  }
  return session;
};

const deleteSession = async (id) => {
  const index = sessions.findIndex((s) => s.id === parseInt(id, 10));
  if (index === -1) {
    const err = new Error('Session not found');
    err.statusCode = 404;
    throw err;
  }
  sessions.splice(index, 1);
};

module.exports = { getAllSessions, createSession, getSessionById, deleteSession };
