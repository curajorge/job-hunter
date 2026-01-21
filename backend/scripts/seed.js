const db = require('../database');

console.log('🌱 Seeding Database...');

const companies = [
  { id: 'c1', name: 'Ezra', domain: 'HealthTech', website: 'ezra.com', description: 'AI-first early cancer detection.' },
  { id: 'c2', name: 'RT²', domain: 'Telecom', website: 'rt2.com', description: 'Commission processing systems.' },
  { id: 'c3', name: 'Google', domain: 'Big Tech', website: 'google.com', description: 'Search and Cloud.' },
  { id: 'c4', name: 'Netflix', domain: 'Streaming', website: 'netflix.com', description: 'Entertainment.' },
  { id: 'c5', name: 'Jobot', domain: 'Recruiting', website: 'jobot.com', description: 'AI-powered recruiting.' },
  { id: 'c6', name: 'InComm', domain: 'FinTech', website: 'incomm.com', description: 'Payment technology.' },
  { id: 'c7', name: 'Farmer Titan', domain: 'AgriTech', website: 'farmertitan.com', description: 'Inventory mgmt.' }
];

const jobs = [
  { company_id: 'c1', role: 'Senior Full Stack Developer', status: 'Interviewing', salary: '215k', next_action: 'Prep for System Design', date: '2025-10-25' },
  { company_id: 'c2', role: 'Senior Software Engineer', status: 'Offer', salary: '170k', next_action: 'Negotiate Equity', date: '2025-10-20' },
  { company_id: 'c3', role: 'Staff Engineer', status: 'Applied', salary: '250k', next_action: 'Follow up with recruiter', date: '2025-10-28' },
  { company_id: 'c4', role: 'Senior Software Engineer', status: 'Wishlist', salary: '300k', next_action: 'Find referral', date: '2025-11-01' }
];

const contacts = [
  { company_id: 'c5', name: 'Tarek Hamzeh', role: 'Recruiter', bucket: 'Recruiters', last_contact: '2025-09-20', notes: 'Discussed Fintech roles.' },
  { company_id: 'c1', name: 'Alex Stiglick', role: 'Director of Engineering', bucket: 'Hiring Managers', last_contact: '2025-10-25', notes: 'Interviewed with him. Good vibes.' },
  { company_id: 'c6', name: 'Former Manager', role: 'Engineering Manager', bucket: 'Former Colleagues', last_contact: '2024-12-15', notes: 'Ask for reference.' }
];

// --- EXECUTION ---

// Note: node:sqlite prepare statements expect numbered parameters (?) or named (:id)
// We will use named parameters for clarity.

const insertCompany = db.prepare(`
  INSERT OR REPLACE INTO companies (id, name, domain, website, description) 
  VALUES (:id, :name, :domain, :website, :description)
`);

const insertJob = db.prepare(`
  INSERT INTO jobs (company_id, role, status, salary, next_action, date) 
  VALUES (:company_id, :role, :status, :salary, :next_action, :date)
`);

const insertContact = db.prepare(`
  INSERT INTO contacts (company_id, name, role, bucket, last_contact, notes) 
  VALUES (:company_id, :name, :role, :bucket, :last_contact, :notes)
`);

const deleteAllCompanies = db.prepare('DELETE FROM companies');
const deleteAllJobs = db.prepare('DELETE FROM jobs');
const deleteAllContacts = db.prepare('DELETE FROM contacts');

// Transaction wrapper is not explicitly exposed as .transaction() in DatabaseSync yet,
// but we can execute basic statements sequentially.

// Clean start
deleteAllContacts.run();
deleteAllJobs.run();
deleteAllCompanies.run();

// Insert Companies
for (const company of companies) {
  insertCompany.run(company);
}

// Insert Jobs
for (const job of jobs) {
  insertJob.run(job);
}

// Insert Contacts
for (const contact of contacts) {
  insertContact.run(contact);
}

console.log(`✅ Seeded: ${companies.length} Companies, ${jobs.length} Jobs, ${contacts.length} Contacts.`);