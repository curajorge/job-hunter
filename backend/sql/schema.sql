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

-- Resume Versions Table (History)
CREATE TABLE IF NOT EXISTS resume_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- e.g., "Master Profile", "Google Tailored"
    content TEXT NOT NULL, -- JSON string of the resume data
    is_master BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    salary TEXT,
    next_action TEXT,
    date TEXT,
    description TEXT,
    notes TEXT,
    resume_version_id INTEGER, -- Link to specific resume version used
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (resume_version_id) REFERENCES resume_versions(id) ON DELETE SET NULL
);

-- Job Activities Table (Timeline)
CREATE TABLE IF NOT EXISTS job_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Contacts Table (People)
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT,
    job_id INTEGER,
    name TEXT NOT NULL,
    role TEXT,
    bucket TEXT,
    email TEXT,
    linkedin_url TEXT,
    phone TEXT,
    last_contact TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
);

-- Engagement Threads (container for a conversation or post interaction)
CREATE TABLE IF NOT EXISTS engagement_threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('post_comment', 'dm', 'connection_request')),
    platform TEXT DEFAULT 'linkedin',
    source_url TEXT,
    source_title TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'pending', 'no_reply', 'replied', 'converted')),
    started_at TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

-- Engagement Messages (individual messages within a thread)
CREATE TABLE IF NOT EXISTS engagement_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    direction TEXT NOT NULL CHECK(direction IN ('outbound', 'inbound')),
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES engagement_threads(id) ON DELETE CASCADE
);

-- Indexes for engagement tables
CREATE INDEX IF NOT EXISTS idx_threads_contact ON engagement_threads(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON engagement_messages(thread_id);
