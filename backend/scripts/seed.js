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
  { 
    company_id: 'c1', 
    role: 'Senior Full Stack Developer', 
    status: 'Interviewing', 
    salary: '215k', 
    next_action: 'Prep for System Design', 
    date: '2025-10-25',
    description: `About Ezra:\nWe're building AI-powered cancer screening. Looking for a Senior Full Stack Developer to help scale our platform.\n\nRequirements:\n- 5+ years experience with modern web frameworks\n- Strong backend skills (Node.js, Python, or similar)\n- Experience with cloud infrastructure (AWS/GCP)\n- Passion for healthcare technology\n\nNice to have:\n- Experience with ML pipelines\n- Healthcare/HIPAA experience`,
    notes: 'Really excited about this one. Mission-driven company.'
  },
  { 
    company_id: 'c2', 
    role: 'Senior Software Engineer', 
    status: 'Offer', 
    salary: '170k', 
    next_action: 'Negotiate Equity', 
    date: '2025-10-20',
    description: 'Internal role - already know the stack.',
    notes: 'Current employer. Considering staying if equity is right.'
  },
  { 
    company_id: 'c3', 
    role: 'Staff Engineer', 
    status: 'Applied', 
    salary: '250k', 
    next_action: 'Follow up with recruiter', 
    date: '2025-10-28',
    description: `Google Cloud - Staff Software Engineer\n\nMinimum qualifications:\n- Bachelor's degree in CS or equivalent\n- 8 years of software development experience\n- Experience with distributed systems\n\nPreferred:\n- Experience with Kubernetes, cloud-native architectures\n- Track record of technical leadership`,
    notes: 'Long shot but worth trying. Got referral from David.'
  },
  { 
    company_id: 'c4', 
    role: 'Senior Software Engineer', 
    status: 'Wishlist', 
    salary: '300k', 
    next_action: 'Find referral', 
    date: '2025-11-01',
    description: 'Netflix - need to find the actual JD and apply.',
    notes: 'Dream company. Need to find someone who works there.'
  }
];

// Get dates for realistic data
const today = new Date();
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const contacts = [
  { 
    company_id: 'c5', 
    job_id: null,
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
    job_id: 1, // Linked to Ezra job
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
    job_id: null,
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
    job_id: 3, // Linked to Google job
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
    job_id: null,
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

const jobActivities = [
  // Ezra job activities
  { job_id: 1, type: 'Applied', date: daysAgo(14), notes: 'Applied via company website. Sent backend-focused resume.' },
  { job_id: 1, type: 'Recruiter Screen', date: daysAgo(10), notes: 'HR screen with Lisa. 30 min. Discussed salary expectations.' },
  { job_id: 1, type: 'Technical Interview', date: daysAgo(5), notes: 'Live coding with Alex. System design question about image processing pipeline. Went well.' },
  { job_id: 1, type: 'Take-home Assignment', date: daysAgo(3), notes: 'Received take-home. Build a simple API. Due in 3 days.' },
  
  // RT² job activities  
  { job_id: 2, type: 'Applied', date: daysAgo(30), notes: 'Internal application.' },
  { job_id: 2, type: 'Technical Interview', date: daysAgo(20), notes: 'Panel interview. Discussed current projects.' },
  { job_id: 2, type: 'Offer Received', date: daysAgo(7), notes: 'Offer: 170k base + 15% bonus. Need to negotiate equity.' },
  
  // Google job activities
  { job_id: 3, type: 'Applied', date: daysAgo(7), notes: 'Applied with referral from David Park.' },
  { job_id: 3, type: 'Recruiter Screen', date: daysAgo(2), notes: 'Quick call with Sarah. Moving to technical phone screen.' },
];

// --- EXECUTION ---

const insertCompany = db.prepare(`
  INSERT OR REPLACE INTO companies (id, name, domain, website, description) 
  VALUES (:id, :name, :domain, :website, :description)
`);

const insertJob = db.prepare(`
  INSERT INTO jobs (company_id, role, status, salary, next_action, date, description, notes) 
  VALUES (:company_id, :role, :status, :salary, :next_action, :date, :description, :notes)
`);

const insertContact = db.prepare(`
  INSERT INTO contacts (company_id, job_id, name, role, bucket, email, linkedin_url, phone, last_contact, notes) 
  VALUES (:company_id, :job_id, :name, :role, :bucket, :email, :linkedin_url, :phone, :last_contact, :notes)
`);

const insertActivity = db.prepare(`
  INSERT INTO job_activities (job_id, type, date, notes)
  VALUES (:job_id, :type, :date, :notes)
`);

const deleteAllCompanies = db.prepare('DELETE FROM companies');
const deleteAllJobs = db.prepare('DELETE FROM jobs');
const deleteAllContacts = db.prepare('DELETE FROM contacts');
const deleteAllActivities = db.prepare('DELETE FROM job_activities');

// Clean start
deleteAllActivities.run();
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

// Insert Activities
for (const activity of jobActivities) {
  insertActivity.run(activity);
}

console.log(`✅ Seeded: ${companies.length} Companies, ${jobs.length} Jobs, ${contacts.length} Contacts, ${jobActivities.length} Activities.`);
