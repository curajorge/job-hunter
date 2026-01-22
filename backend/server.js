const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  next();
});

// --- API ENDPOINTS ---

// 1. GET Full Dashboard Data
app.get('/api/dashboard', (req, res, next) => {
  try {
    const companies = db.prepare('SELECT * FROM companies').all();
    const jobs = db.prepare('SELECT * FROM jobs').all();
    const contacts = db.prepare('SELECT * FROM contacts').all();

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

// ===================
// 2. COMPANIES CRUD
// ===================

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

app.post('/api/companies', (req, res, next) => {
  try {
    const { name, domain, website, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    const id = 'c' + crypto.randomUUID().split('-')[0];
    
    const stmt = db.prepare(
      'INSERT INTO companies (id, name, domain, website, description) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(id, name.trim(), domain || null, website || null, description || null);
    
    res.status(201).json({ id, name: name.trim(), domain, website, description });
  } catch (err) {
    next(err);
  }
});

app.put('/api/companies/:id', (req, res, next) => {
  try {
    const { name, domain, website, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    
    const stmt = db.prepare(
      'UPDATE companies SET name = ?, domain = ?, website = ?, description = ? WHERE id = ?'
    );
    const info = stmt.run(name.trim(), domain || null, website || null, description || null, req.params.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ id: req.params.id, name: name.trim(), domain, website, description });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/companies/:id', (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM companies WHERE id = ?');
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

// ===================
// 3. JOBS CRUD
// ===================

app.get('/api/jobs', (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM jobs').all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/jobs/:id', (req, res, next) => {
  try {
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    // Get company info
    const company = job.company_id 
      ? db.prepare('SELECT * FROM companies WHERE id = ?').get(job.company_id)
      : null;
    
    // Get activities for this job
    const activities = db.prepare(
      'SELECT * FROM job_activities WHERE job_id = ? ORDER BY date DESC, created_at DESC'
    ).all(req.params.id);
    
    // Get contacts linked to this job
    const contacts = db.prepare(
      'SELECT * FROM contacts WHERE job_id = ?'
    ).all(req.params.id);
    
    res.json({ 
      ...job, 
      company: company ? company.name : 'Unknown',
      companyData: company,
      activities,
      contacts
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/jobs', (req, res, next) => {
  try {
    const { company_id, role, status, salary, next_action, date, description, notes } = req.body;
    
    if (!role || !role.trim()) {
      return res.status(400).json({ error: 'Job role is required' });
    }
    
    const stmt = db.prepare(
      'INSERT INTO jobs (company_id, role, status, salary, next_action, date, description, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const info = stmt.run(
      company_id || null,
      role.trim(),
      status || 'Wishlist',
      salary || null,
      next_action || null,
      date || null,
      description || null,
      notes || null
    );
    
    res.status(201).json({
      id: Number(info.lastInsertRowid),
      company_id,
      role: role.trim(),
      status: status || 'Wishlist',
      salary,
      next_action,
      date,
      description,
      notes
    });
  } catch (err) {
    next(err);
  }
});

app.put('/api/jobs/:id', (req, res, next) => {
  try {
    const { company_id, role, status, salary, next_action, date, description, notes } = req.body;
    
    if (!role || !role.trim()) {
      return res.status(400).json({ error: 'Job role is required' });
    }
    
    const stmt = db.prepare(
      'UPDATE jobs SET company_id = ?, role = ?, status = ?, salary = ?, next_action = ?, date = ?, description = ?, notes = ? WHERE id = ?'
    );
    const info = stmt.run(
      company_id || null,
      role.trim(),
      status || 'Wishlist',
      salary || null,
      next_action || null,
      date || null,
      description || null,
      notes || null,
      req.params.id
    );
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({
      id: parseInt(req.params.id),
      company_id,
      role: role.trim(),
      status: status || 'Wishlist',
      salary,
      next_action,
      date,
      description,
      notes
    });
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

app.delete('/api/jobs/:id', (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM jobs WHERE id = ?');
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({ success: true, id: parseInt(req.params.id) });
  } catch (err) {
    next(err);
  }
});

// ===================
// 4. JOB ACTIVITIES
// ===================

app.get('/api/jobs/:jobId/activities', (req, res, next) => {
  try {
    const activities = db.prepare(
      'SELECT * FROM job_activities WHERE job_id = ? ORDER BY date DESC, created_at DESC'
    ).all(req.params.jobId);
    res.json(activities);
  } catch (err) {
    next(err);
  }
});

app.post('/api/jobs/:jobId/activities', (req, res, next) => {
  try {
    const { type, date, notes } = req.body;
    
    if (!type || !type.trim()) {
      return res.status(400).json({ error: 'Activity type is required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Activity date is required' });
    }
    
    const stmt = db.prepare(
      'INSERT INTO job_activities (job_id, type, date, notes) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(
      req.params.jobId,
      type.trim(),
      date,
      notes || null
    );
    
    res.status(201).json({
      id: Number(info.lastInsertRowid),
      job_id: parseInt(req.params.jobId),
      type: type.trim(),
      date,
      notes
    });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/activities/:id', (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM job_activities WHERE id = ?');
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json({ success: true, id: parseInt(req.params.id) });
  } catch (err) {
    next(err);
  }
});

// ===================
// 5. CONTACTS CRUD
// ===================

app.get('/api/contacts', (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM contacts').all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/contacts/:id', (req, res, next) => {
  try {
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

app.post('/api/contacts', (req, res, next) => {
  try {
    const { company_id, job_id, name, role, bucket, email, linkedin_url, phone, last_contact, notes } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Contact name is required' });
    }
    
    const stmt = db.prepare(
      'INSERT INTO contacts (company_id, job_id, name, role, bucket, email, linkedin_url, phone, last_contact, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const info = stmt.run(
      company_id || null,
      job_id || null,
      name.trim(),
      role || null,
      bucket || 'Recruiters',
      email || null,
      linkedin_url || null,
      phone || null,
      last_contact || null,
      notes || null
    );
    
    res.status(201).json({
      id: Number(info.lastInsertRowid),
      company_id,
      job_id,
      name: name.trim(),
      role,
      bucket: bucket || 'Recruiters',
      email,
      linkedin_url,
      phone,
      last_contact,
      notes
    });
  } catch (err) {
    next(err);
  }
});

app.put('/api/contacts/:id', (req, res, next) => {
  try {
    const { company_id, job_id, name, role, bucket, email, linkedin_url, phone, last_contact, notes } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Contact name is required' });
    }
    
    const stmt = db.prepare(
      'UPDATE contacts SET company_id = ?, job_id = ?, name = ?, role = ?, bucket = ?, email = ?, linkedin_url = ?, phone = ?, last_contact = ?, notes = ? WHERE id = ?'
    );
    const info = stmt.run(
      company_id || null,
      job_id || null,
      name.trim(),
      role || null,
      bucket || 'Recruiters',
      email || null,
      linkedin_url || null,
      phone || null,
      last_contact || null,
      notes || null,
      req.params.id
    );
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({
      id: parseInt(req.params.id),
      company_id,
      job_id,
      name: name.trim(),
      role,
      bucket: bucket || 'Recruiters',
      email,
      linkedin_url,
      phone,
      last_contact,
      notes
    });
  } catch (err) {
    next(err);
  }
});

app.patch('/api/contacts/:id/touch', (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const stmt = db.prepare('UPDATE contacts SET last_contact = ? WHERE id = ?');
    const info = stmt.run(today, req.params.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ success: true, last_contact: today });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/contacts/:id', (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM contacts WHERE id = ?');
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ success: true, id: parseInt(req.params.id) });
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} (Node v${process.version})`);
});
