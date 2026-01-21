const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware to enforce JSON content type and UTF-8 charset
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  next();
});

// --- API ENDPOINTS ---

// 1. GET Full Dashboard Data
app.get('/api/dashboard', (req, res, next) => {
  try {
    // Note: .all() returns an array of objects in node:sqlite
    const companies = db.prepare('SELECT * FROM companies').all();
    const jobs = db.prepare('SELECT * FROM jobs').all();
    const contacts = db.prepare('SELECT * FROM contacts').all();

    // Helper to join company name to job/contact
    const enrich = (items) => items.map(item => {
      const comp = companies.find(c => c.id === item.company_id);
      return { ...item, company: comp ? comp.name : 'Unknown' };
    });

    res.json({
      companies,
      jobs: enrich(jobs),
      contacts: enrich(contacts)
    });
  } catch (err) {
    next(err);
  }
});

// 2. COMPANIES
app.get('/api/companies', (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM companies').all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/companies/:id', (req, res, next) => {
  try {
    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    
    const jobs = db.prepare('SELECT * FROM jobs WHERE company_id = ?').all(req.params.id);
    const contacts = db.prepare('SELECT * FROM contacts WHERE company_id = ?').all(req.params.id);

    res.json({ ...company, jobs, people: contacts });
  } catch (err) {
    next(err);
  }
});

// 3. JOBS
app.post('/api/jobs', (req, res, next) => {
  try {
    const { company_id, role, status, salary, next_action, date } = req.body;
    const stmt = db.prepare(
      'INSERT INTO jobs (company_id, role, status, salary, next_action, date) VALUES (?, ?, ?, ?, ?, ?)'
    );
    
    // node:sqlite .run() expects arguments for '?' placeholders
    const info = stmt.run(company_id, role, status, salary, next_action, date);
    
    res.status(201).json({ id: info.lastInsertRowid, ...req.body });
  } catch (err) {
    next(err);
  }
});

app.patch('/api/jobs/:id/status', (req, res, next) => {
  try {
    const { status } = req.body;
    const stmt = db.prepare('UPDATE jobs SET status = ? WHERE id = ?');
    const info = stmt.run(status, req.params.id);
    
    if (info.changes === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true, status });
  } catch (err) {
    next(err);
  }
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} (Node v${process.version})`);
});