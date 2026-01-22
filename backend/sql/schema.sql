-- Enable Foreign Keys
PRAGMA foreign_keys = ON;

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    website TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT,
    role TEXT NOT NULL,
    status TEXT NOT NULL, -- Applied, Interviewing, Offer, Wishlist
    salary TEXT,
    next_action TEXT,
    date TEXT,
    description TEXT, -- Full job description / JD
    notes TEXT, -- Freeform notes/impressions
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- Job Activities Table (Timeline)
CREATE TABLE IF NOT EXISTS job_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- Applied, Phone Screen, Technical, etc.
    date TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Contacts Table (People)
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT,
    job_id INTEGER, -- Optional: link contact to specific job
    name TEXT NOT NULL,
    role TEXT,
    bucket TEXT, -- Recruiters, Hiring Managers, Former Colleagues
    email TEXT,
    linkedin_url TEXT,
    phone TEXT,
    last_contact TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);
