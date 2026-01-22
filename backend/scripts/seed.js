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

// Get dates for realistic "last contact" values
const today = new Date();
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const contacts = [
  { 
    company_id: 'c5', 
    name: 'Tarek Hamzeh', 
    role: 'Recruiter', 
    bucket: 'Recruiters', 
    email: 'tarek@jobot.com',
    linkedin_url: 'https://linkedin.com/in/tarekhamzeh',
    phone: null,
    last_contact: daysAgo(3), 
    notes: 'Discussed Fintech roles. Very responsive.' 
  },
  { 
    company_id: 'c1', 
    name: 'Alex Stiglick', 
    role: 'Director of Engineering', 
    bucket: 'Hiring Managers', 
    email: 'alex.s@ezra.com',
    linkedin_url: 'https://linkedin.com/in/alexstiglick',
    phone: null,
    last_contact: daysAgo(1), 
    notes: 'Interviewed with him. Good vibes. Follow up after panel.' 
  },
  { 
    company_id: 'c6', 
    name: 'Marcus Chen', 
    role: 'Engineering Manager', 
    bucket: 'Former Colleagues', 
    email: 'marcus.chen@gmail.com',
    linkedin_url: 'https://linkedin.com/in/marcuschen',
    phone: '555-123-4567',
    last_contact: daysAgo(14), 
    notes: 'Former manager at InComm. Great reference.' 
  },
  { 
    company_id: 'c3', 
    name: 'Sarah Kim', 
    role: 'Technical Recruiter', 
    bucket: 'Recruiters', 
    email: 'sarahkim@google.com',
    linkedin_url: 'https://linkedin.com/in/sarahkim-recruiter',
    phone: null,
    last_contact: daysAgo(10), 
    notes: 'Initial screen went well. Waiting on next steps.' 
  },
  { 
    company_id: 'c4', 
    name: 'David Park', 
    role: 'Staff Engineer', 
    bucket: 'Former Colleagues', 
    email: null,
    linkedin_url: 'https://linkedin.com/in/davidpark-eng',
    phone: null,
    last_contact: daysAgo(21), 
    notes: 'Worked together at startup. Now at Netflix. Could refer.' 
  }
];

// --- EXECUTION ---

const insertCompany = db.prepare(`
  INSERT OR REPLACE INTO companies (id, name, domain, website, description) 
  VALUES (:id, :name, :domain, :website, :description)
`);

const insertJob = db.prepare(`
  INSERT INTO jobs (company_id, role, status, salary, next_action, date) 
  VALUES (:company_id, :role, :status, :salary, :next_action, :date)
`);

const insertContact = db.prepare(`
  INSERT INTO contacts (company_id, name, role, bucket, email, linkedin_url, phone, last_contact, notes) 
  VALUES (:company_id, :name, :role, :bucket, :email, :linkedin_url, :phone, :last_contact, :notes)
`);

const deleteAllCompanies = db.prepare('DELETE FROM companies');
const deleteAllJobs = db.prepare('DELETE FROM jobs');
const deleteAllContacts = db.prepare('DELETE FROM contacts');

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
