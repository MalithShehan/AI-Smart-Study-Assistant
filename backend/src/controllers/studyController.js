// In-memory store (replace with a real database in production)
let sessions = [];
let nextId = 1;

const getSessions = (req, res) => {
  res.json(sessions);
};

const createSession = (req, res) => {
  const { title, subject, notes } = req.body;
  if (!title || !subject) {
    return res.status(400).json({ error: 'title and subject are required' });
  }
  const session = { id: nextId++, title, subject, notes: notes || '', createdAt: new Date() };
  sessions.push(session);
  res.status(201).json(session);
};

const getSessionById = (req, res) => {
  const session = sessions.find((s) => s.id === parseInt(req.params.id));
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
};

const deleteSession = (req, res) => {
  const index = sessions.findIndex((s) => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Session not found' });
  sessions.splice(index, 1);
  res.status(204).send();
};

module.exports = { getSessions, createSession, getSessionById, deleteSession };
