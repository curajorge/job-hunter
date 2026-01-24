const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./database');

// Agent imports (lazy loaded to handle missing deps gracefully)
let agent = null;
function getAgent() {
  if (!agent) {
    try {
      agent = require('./agent');
    } catch (err) {
      console.warn('⚠️ Agent module not available:', err.message);
      console.warn('Run "npm install" in backend to install agent dependencies.');
      return null;
    }
  }
  return agent;
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  res.header('Content-Type', 'application/json; charset=utf-8');
  next();
});

// In-memory session store for agent conversations
const agentSessions = new Map();

// --- API ENDPOINTS ---

// 1. GET Full Dashboard Data
app.get('/api/dashboard', (req, res, next) => {
  try {
    const companies = db.prepare('SELECT * FROM companies').all();
    const jobs = db.prepare('SELECT * FROM jobs').all();
    const contacts = db.prepare('SELECT * FROM contacts').all();
    const resumes = db.prepare('SELECT id, name, is_master, created_at FROM resume_versions ORDER BY created_at DESC').all();

    const enrich = (items) => items.map(item => {
      const comp = companies.find(c => c.id === item.company_id);
      return { ...item, company: comp ? comp.name : 'Unknown' };
    });

    res.json({
      companies,
      jobs: enrich(jobs),
      contacts: enrich(contacts),
      resumes
    });
  } catch (err) {
    next(err);
  }
});

// ===================
// AGENT ENDPOINTS
// ===================

// POST /api/agent/chat - Main chat endpoint
app.post('/api/agent/chat', async (req, res, next) => {
  try {
    const agentModule = getAgent();
    if (!agentModule) {
      return res.status(503).json({
        error: 'Agent service unavailable',
        message: 'LLM dependencies not installed. Run "npm install" in backend directory.'
      });
    }

    const { message, sessionId, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create session
    const sid = sessionId || crypto.randomUUID();
    let history = agentSessions.get(sid) || [];

    // Build context from current state
    const enrichedContext = {
      ...context,
      pipelineSummary: null,
    };

    // Quick pipeline summary for context
    try {
      const jobs = db.prepare('SELECT status, COUNT(*) as count FROM jobs GROUP BY status').all();
      enrichedContext.pipelineSummary = jobs.map(j => `${j.status}: ${j.count}`).join(', ');
    } catch (e) {
      // Ignore - optional context
    }

    // Process through agent
    const result = await agentModule.chat(message, history, enrichedContext);

    // Update session
    agentSessions.set(sid, result.history);

    // Cleanup old sessions (simple LRU-ish)
    if (agentSessions.size > 100) {
      const firstKey = agentSessions.keys().next().value;
      agentSessions.delete(firstKey);
    }

    res.json({
      response: result.response,
      sessionId: sid,
    });
  } catch (err) {
    console.error('Agent chat error:', err);
    res.status(500).json({
      error: 'Agent processing failed',
      message: err.message,
    });
  }
});

// POST /api/agent/parse - Parse unstructured text
app.post('/api/agent/parse', async (req, res, next) => {
  try {
    const agentModule = getAgent();
    if (!agentModule) {
      return res.status(503).json({
        error: 'Agent service unavailable',
        message: 'LLM dependencies not installed.'
      });
    }

    const { text, type } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const parsed = await agentModule.parseText(text, type || 'job');
    res.json(parsed);
  } catch (err) {
    console.error('Agent parse error:', err);
    res.status(500).json({
      error: 'Parsing failed',
      message: err.message,
    });
  }
});

// GET /api/agent/info - Get agent provider info
app.get('/api/agent/info', (req, res) => {
  const agentModule = getAgent();
  if (!agentModule) {
    return res.status(503).json({
      available: false,
      error: 'Agent service unavailable',
    });
  }

  res.json({
    available: true,
    ...agentModule.getProviderInfo(),
  });
});

// DELETE /api/agent/session/:sessionId - Clear a session
app.delete('/api/agent/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  agentSessions.delete(sessionId);
  res.json({ success: true });
});

// ===================
// 2. RESUMES CRUD
// ===================

app.get('/api/resumes', (req, res, next) => {
  try {
    // Return metadata only for list to save bandwidth
    const rows = db.prepare('SELECT id, name, is_master, created_at FROM resume_versions ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/resumes/:id', (req, res, next) => {
  try {
    const resume = db.prepare('SELECT * FROM resume_versions WHERE id = ?').get(req.params.id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    // Parse content if it's stored as string
    try {
        resume.content = JSON.parse(resume.content);
    } catch (e) {
        // content might already be object if handled upstream, but sqlite stores text
    }
    res.json(resume);
  } catch (err) {
    next(err);
  }
});

app.post('/api/resumes', (req, res, next) => {
  try {
    const { name, content, is_master } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Name is required' });
    
    const stmt = db.prepare(
      'INSERT INTO resume_versions (name, content, is_master) VALUES (?, ?, ?)'
    );
    const info = stmt.run(name, JSON.stringify(content), is_master ? 1 : 0);
    
    res.status(201).json({ id: Number(info.lastInsertRowid), name, is_master });
  } catch (err) {
    next(err);
  }
});

app.put('/api/resumes/:id', (req, res, next) => {
  try {
    const { name, content } = req.body;
    const stmt = db.prepare('UPDATE resume_versions SET name = ?, content = ? WHERE id = ?');
    const info = stmt.run(name, JSON.stringify(content), req.params.id);
    
    if (info.changes === 0) return res.status(404).json({ error: 'Resume not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/resumes/:id', (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM resume_versions WHERE id = ?');
    const info = stmt.run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Resume not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ===================
// 3. COMPANIES CRUD
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
// 4. JOBS CRUD
// ===================

app.get('/api/jobs', (req, res, next) => {
  try {
    const companies = db.prepare('SELECT * FROM companies').all();
    const rows = db.prepare('SELECT * FROM jobs').all();
    
    // Enrich with company name
    const enriched = rows.map(job => {
      const comp = companies.find(c => c.id === job.company_id);
      return { ...job, company: comp ? comp.name : 'Unknown' };
    });
    
    res.json(enriched);
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
    
    // Get resume version if linked
    let resumeVersion = null;
    if (job.resume_version_id) {
        resumeVersion = db.prepare('SELECT id, name FROM resume_versions WHERE id = ?').get(job.resume_version_id);
    }

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
      resumeVersion,
      activities,
      contacts
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/jobs', (req, res, next) => {
  try {
    const { company_id, role, status, salary, next_action, date, description, notes, resume_version_id } = req.body;
    
    if (!role || !role.trim()) {
      return res.status(400).json({ error: 'Job role is required' });
    }
    
    const stmt = db.prepare(
      'INSERT INTO jobs (company_id, role, status, salary, next_action, date, description, notes, resume_version_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
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
      resume_version_id || null
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
      notes,
      resume_version_id
    });
  } catch (err) {
    next(err);
  }
});

app.put('/api/jobs/:id', (req, res, next) => {
  try {
    const { company_id, role, status, salary, next_action, date, description, notes, resume_version_id } = req.body;
    
    if (!role || !role.trim()) {
      return res.status(400).json({ error: 'Job role is required' });
    }
    
    const stmt = db.prepare(
      'UPDATE jobs SET company_id = ?, role = ?, status = ?, salary = ?, next_action = ?, date = ?, description = ?, notes = ?, resume_version_id = ? WHERE id = ?'
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
      resume_version_id || null,
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
      notes,
      resume_version_id
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
// 5. JOB ACTIVITIES
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
// 6. CONTACTS CRUD
// ===================

app.get('/api/contacts', (req, res, next) => {
  try {
    const companies = db.prepare('SELECT * FROM companies').all();
    const rows = db.prepare('SELECT * FROM contacts').all();
    
    // Enrich with company name
    const enriched = rows.map(contact => {
      const comp = companies.find(c => c.id === contact.company_id);
      return { ...contact, company: comp ? comp.name : 'Unknown' };
    });
    
    res.json(enriched);
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

// ===================
// 7. ENGAGEMENTS
// ===================

// GET - List engagement threads for a contact (with message count)
app.get('/api/contacts/:contactId/engagements', (req, res, next) => {
  try {
    const threads = db.prepare(`
      SELECT 
        et.*,
        COUNT(em.id) as message_count,
        (
          SELECT content FROM engagement_messages 
          WHERE thread_id = et.id AND direction = 'outbound' 
          ORDER BY date ASC, created_at ASC LIMIT 1
        ) as first_outbound_message
      FROM engagement_threads et
      LEFT JOIN engagement_messages em ON em.thread_id = et.id
      WHERE et.contact_id = ?
      GROUP BY et.id
      ORDER BY et.started_at DESC, et.created_at DESC
    `).all(req.params.contactId);
    
    res.json(threads);
  } catch (err) {
    next(err);
  }
});

// POST - Create engagement thread + first message
app.post('/api/contacts/:contactId/engagements', (req, res, next) => {
  try {
    const { type, source_url, source_title, started_at, first_message } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'Engagement type is required' });
    }
    if (!['post_comment', 'dm', 'connection_request'].includes(type)) {
      return res.status(400).json({ error: 'Invalid engagement type' });
    }
    if (!started_at) {
      return res.status(400).json({ error: 'Start date is required' });
    }
    if (!first_message || !first_message.content) {
      return res.status(400).json({ error: 'First message content is required' });
    }
    
    // Verify contact exists
    const contact = db.prepare('SELECT id FROM contacts WHERE id = ?').get(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    // Insert thread
    const threadStmt = db.prepare(`
      INSERT INTO engagement_threads (contact_id, type, source_url, source_title, started_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const threadInfo = threadStmt.run(
      req.params.contactId,
      type,
      source_url || null,
      source_title || null,
      started_at
    );
    const threadId = Number(threadInfo.lastInsertRowid);
    
    // Insert first message
    const msgStmt = db.prepare(`
      INSERT INTO engagement_messages (thread_id, direction, content, date)
      VALUES (?, ?, ?, ?)
    `);
    const msgInfo = msgStmt.run(
      threadId,
      first_message.direction || 'outbound',
      first_message.content,
      first_message.date || started_at
    );
    
    res.status(201).json({
      id: threadId,
      contact_id: parseInt(req.params.contactId),
      type,
      source_url,
      source_title,
      status: 'active',
      started_at,
      first_message: {
        id: Number(msgInfo.lastInsertRowid),
        direction: first_message.direction || 'outbound',
        content: first_message.content,
        date: first_message.date || started_at
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET - Get single engagement thread with all messages
app.get('/api/engagements/:id', (req, res, next) => {
  try {
    const thread = db.prepare('SELECT * FROM engagement_threads WHERE id = ?').get(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Engagement thread not found' });
    }
    
    const messages = db.prepare(`
      SELECT * FROM engagement_messages 
      WHERE thread_id = ? 
      ORDER BY date ASC, created_at ASC
    `).all(req.params.id);
    
    res.json({ ...thread, messages });
  } catch (err) {
    next(err);
  }
});

// PUT - Update engagement thread metadata (status, title)
app.put('/api/engagements/:id', (req, res, next) => {
  try {
    const { status, source_title, source_url } = req.body;
    
    if (status && !['active', 'pending', 'no_reply', 'replied', 'converted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const existing = db.prepare('SELECT * FROM engagement_threads WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Engagement thread not found' });
    }
    
    const stmt = db.prepare(`
      UPDATE engagement_threads 
      SET status = ?, source_title = ?, source_url = ?
      WHERE id = ?
    `);
    stmt.run(
      status || existing.status,
      source_title !== undefined ? source_title : existing.source_title,
      source_url !== undefined ? source_url : existing.source_url,
      req.params.id
    );
    
    const updated = db.prepare('SELECT * FROM engagement_threads WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE - Delete engagement thread (cascades to messages)
app.delete('/api/engagements/:id', (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM engagement_threads WHERE id = ?');
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Engagement thread not found' });
    }
    
    res.json({ success: true, id: parseInt(req.params.id) });
  } catch (err) {
    next(err);
  }
});

// POST - Add message to existing thread
app.post('/api/engagements/:threadId/messages', (req, res, next) => {
  try {
    const { direction, content, date } = req.body;
    
    if (!direction || !['outbound', 'inbound'].includes(direction)) {
      return res.status(400).json({ error: 'Valid direction (outbound/inbound) is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Message date is required' });
    }
    
    // Verify thread exists
    const thread = db.prepare('SELECT id, status FROM engagement_threads WHERE id = ?').get(req.params.threadId);
    if (!thread) {
      return res.status(404).json({ error: 'Engagement thread not found' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO engagement_messages (thread_id, direction, content, date)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(req.params.threadId, direction, content.trim(), date);
    
    // Auto-update thread status if inbound message received
    if (direction === 'inbound' && thread.status !== 'converted') {
      db.prepare('UPDATE engagement_threads SET status = ? WHERE id = ?').run('replied', req.params.threadId);
    }
    
    res.status(201).json({
      id: Number(info.lastInsertRowid),
      thread_id: parseInt(req.params.threadId),
      direction,
      content: content.trim(),
      date
    });
  } catch (err) {
    next(err);
  }
});

// DELETE - Delete single message
app.delete('/api/messages/:id', (req, res, next) => {
  try {
    const stmt = db.prepare('DELETE FROM engagement_messages WHERE id = ?');
    const info = stmt.run(req.params.id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Message not found' });
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
  
  // Check if agent is available
  const agentModule = getAgent();
  if (agentModule) {
    const info = agentModule.getProviderInfo();
    console.log(`🤖 Agent ready: ${info.name} (${info.model})`);
  } else {
    console.log('⚠️ Agent not available - install dependencies with: cd backend && npm install');
  }
});
