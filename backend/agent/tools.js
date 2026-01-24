/**
 * Agent Tools
 * 
 * LangChain tool definitions that wrap the backend API.
 * Each tool calls the Express API endpoints.
 */

const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const config = require('./config');

// Helper to make API calls to our backend
async function apiCall(endpoint, method = 'GET', body = null) {
  const url = `${config.apiBaseUrl}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API call failed: ${response.status}`);
  }
  
  return response.json();
}

// ===================
// READ TOOLS
// ===================

const queryJobs = tool(
  async ({ status, companyId, limit }) => {
    try {
      const jobs = await apiCall('/jobs');
      
      let filtered = jobs;
      
      if (status) {
        filtered = filtered.filter(j => j.status.toLowerCase() === status.toLowerCase());
      }
      if (companyId) {
        filtered = filtered.filter(j => j.company_id === companyId);
      }
      if (limit) {
        filtered = filtered.slice(0, limit);
      }
      
      if (filtered.length === 0) {
        return 'No jobs found matching the criteria.';
      }
      
      return filtered.map(j => 
        `• ${j.role} at ${j.company || 'Unknown'} [${j.status}]${j.salary ? ` - ${j.salary}` : ''}`
      ).join('\n');
    } catch (error) {
      return `Error querying jobs: ${error.message}`;
    }
  },
  {
    name: 'query_jobs',
    description: 'Search and filter jobs in the pipeline. Can filter by status (Wishlist, Applied, Interviewing, Offer) or company.',
    schema: z.object({
      status: z.string().optional().describe('Filter by status: Wishlist, Applied, Interviewing, Offer'),
      companyId: z.string().optional().describe('Filter by company ID'),
      limit: z.number().optional().describe('Maximum number of results to return'),
    }),
  }
);

const getJobDetail = tool(
  async ({ jobId }) => {
    try {
      const job = await apiCall(`/jobs/${jobId}`);
      
      let result = `**${job.role}** at ${job.company || 'Unknown'}\n`;
      result += `Status: ${job.status}\n`;
      if (job.salary) result += `Salary: ${job.salary}\n`;
      if (job.next_action) result += `Next Action: ${job.next_action}\n`;
      if (job.description) result += `\nDescription: ${job.description.substring(0, 300)}...\n`;
      if (job.notes) result += `\nNotes: ${job.notes}\n`;
      
      if (job.activities && job.activities.length > 0) {
        result += `\nRecent Activity:\n`;
        job.activities.slice(0, 3).forEach(a => {
          result += `  • ${a.date}: ${a.type}${a.notes ? ` - ${a.notes.substring(0, 50)}` : ''}\n`;
        });
      }
      
      return result;
    } catch (error) {
      return `Error getting job details: ${error.message}`;
    }
  },
  {
    name: 'get_job_detail',
    description: 'Get full details for a specific job including activities and notes.',
    schema: z.object({
      jobId: z.number().describe('The job ID to get details for'),
    }),
  }
);

const queryContacts = tool(
  async ({ bucket, staleDays }) => {
    try {
      const contacts = await apiCall('/contacts');
      
      let filtered = contacts;
      
      if (bucket) {
        filtered = filtered.filter(c => c.bucket === bucket);
      }
      
      if (staleDays) {
        const today = new Date();
        filtered = filtered.filter(c => {
          if (!c.last_contact) return true;
          const lastDate = new Date(c.last_contact);
          const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
          return diffDays >= staleDays;
        });
      }
      
      if (filtered.length === 0) {
        return 'No contacts found matching the criteria.';
      }
      
      return filtered.map(c => {
        let line = `• ${c.name} (${c.role || 'No role'}) at ${c.company || 'Unknown'}`;
        if (c.last_contact) {
          line += ` - Last contacted: ${c.last_contact}`;
        } else {
          line += ' - Never contacted';
        }
        return line;
      }).join('\n');
    } catch (error) {
      return `Error querying contacts: ${error.message}`;
    }
  },
  {
    name: 'query_contacts',
    description: 'Search contacts. Can filter by bucket (Recruiters, Hiring Managers, Former Colleagues) or find stale contacts.',
    schema: z.object({
      bucket: z.string().optional().describe('Filter by bucket: Recruiters, Hiring Managers, Former Colleagues'),
      staleDays: z.number().optional().describe('Find contacts not reached in X days'),
    }),
  }
);

const getPipelineSummary = tool(
  async () => {
    try {
      const jobs = await apiCall('/jobs');
      const contacts = await apiCall('/contacts');
      
      const statusCounts = {};
      jobs.forEach(j => {
        statusCounts[j.status] = (statusCounts[j.status] || 0) + 1;
      });
      
      // Count stale contacts (14+ days)
      const today = new Date();
      const staleContacts = contacts.filter(c => {
        if (!c.last_contact) return true;
        const lastDate = new Date(c.last_contact);
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        return diffDays >= 14;
      }).length;
      
      let summary = '**Pipeline Summary**\n';
      summary += `Total Jobs: ${jobs.length}\n`;
      Object.entries(statusCounts).forEach(([status, count]) => {
        summary += `  • ${status}: ${count}\n`;
      });
      summary += `\nTotal Contacts: ${contacts.length}\n`;
      summary += `Contacts needing follow-up (14+ days): ${staleContacts}`;
      
      return summary;
    } catch (error) {
      return `Error getting pipeline summary: ${error.message}`;
    }
  },
  {
    name: 'get_pipeline_summary',
    description: 'Get a summary of the job pipeline with counts by status and contact stats.',
    schema: z.object({}),
  }
);

// ===================
// WRITE TOOLS
// ===================

const createJob = tool(
  async ({ role, companyName, status, salary, description, notes, nextAction }) => {
    try {
      // First, find or create the company
      let companyId = null;
      
      if (companyName) {
        const companies = await apiCall('/companies');
        const existing = companies.find(
          c => c.name.toLowerCase() === companyName.toLowerCase()
        );
        
        if (existing) {
          companyId = existing.id;
        } else {
          // Create new company
          const newCompany = await apiCall('/companies', 'POST', {
            name: companyName,
          });
          companyId = newCompany.id;
        }
      }
      
      // Create the job
      const job = await apiCall('/jobs', 'POST', {
        company_id: companyId,
        role,
        status: status || 'Wishlist',
        salary: salary || null,
        description: description || null,
        notes: notes || null,
        next_action: nextAction || null,
      });
      
      return `✅ Created job: ${role} at ${companyName || 'Unknown'} [${job.status}]${salary ? ` - ${salary}` : ''}`;
    } catch (error) {
      return `Error creating job: ${error.message}`;
    }
  },
  {
    name: 'create_job',
    description: 'Create a new job in the pipeline. Will auto-create company if it does not exist.',
    schema: z.object({
      role: z.string().describe('The job title/role (required)'),
      companyName: z.string().optional().describe('Company name - will be created if not exists'),
      status: z.string().optional().describe('Initial status: Wishlist, Applied, Interviewing, Offer'),
      salary: z.string().optional().describe('Salary range, e.g., "180k-220k"'),
      description: z.string().optional().describe('Job description summary'),
      notes: z.string().optional().describe('Personal notes about this opportunity'),
      nextAction: z.string().optional().describe('Next action to take'),
    }),
  }
);

const createContact = tool(
  async ({ name, companyName, role, bucket, email, linkedinUrl, notes }) => {
    try {
      // Find company if name provided
      let companyId = null;
      
      if (companyName) {
        const companies = await apiCall('/companies');
        const existing = companies.find(
          c => c.name.toLowerCase() === companyName.toLowerCase()
        );
        if (existing) {
          companyId = existing.id;
        }
      }
      
      const contact = await apiCall('/contacts', 'POST', {
        company_id: companyId,
        name,
        role: role || null,
        bucket: bucket || 'Recruiters',
        email: email || null,
        linkedin_url: linkedinUrl || null,
        notes: notes || null,
        last_contact: new Date().toISOString().split('T')[0],
      });
      
      return `✅ Created contact: ${name}${role ? ` (${role})` : ''}${companyName ? ` at ${companyName}` : ''}`;
    } catch (error) {
      return `Error creating contact: ${error.message}`;
    }
  },
  {
    name: 'create_contact',
    description: 'Add a new networking contact.',
    schema: z.object({
      name: z.string().describe('Contact full name (required)'),
      companyName: z.string().optional().describe('Company they work at'),
      role: z.string().optional().describe('Their job title'),
      bucket: z.string().optional().describe('Category: Recruiters, Hiring Managers, Former Colleagues'),
      email: z.string().optional().describe('Email address'),
      linkedinUrl: z.string().optional().describe('LinkedIn profile URL'),
      notes: z.string().optional().describe('Notes about this contact'),
    }),
  }
);

const createActivity = tool(
  async ({ jobId, type, date, notes }) => {
    try {
      const activity = await apiCall(`/jobs/${jobId}/activities`, 'POST', {
        type,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || null,
      });
      
      return `✅ Logged activity: ${type} on ${activity.date}${notes ? ` - ${notes}` : ''}`;
    } catch (error) {
      return `Error creating activity: ${error.message}`;
    }
  },
  {
    name: 'create_activity',
    description: 'Log an activity (interview, call, etc.) for a job.',
    schema: z.object({
      jobId: z.number().describe('The job ID to log activity for'),
      type: z.string().describe('Activity type: Applied, Recruiter Screen, Phone Interview, Technical Interview, Take-home Assignment, On-site / Final Round, Offer Received, Rejected, Withdrew, Follow-up Sent, General Note'),
      date: z.string().optional().describe('Date of the activity (YYYY-MM-DD), defaults to today'),
      notes: z.string().optional().describe('Notes about what happened'),
    }),
  }
);

const updateJobStatus = tool(
  async ({ jobId, status }) => {
    try {
      await apiCall(`/jobs/${jobId}/status`, 'PATCH', { status });
      return `✅ Updated job status to: ${status}`;
    } catch (error) {
      return `Error updating job status: ${error.message}`;
    }
  },
  {
    name: 'update_job_status',
    description: 'Move a job to a different pipeline stage.',
    schema: z.object({
      jobId: z.number().describe('The job ID to update'),
      status: z.string().describe('New status: Wishlist, Applied, Interviewing, Offer'),
    }),
  }
);

const touchContact = tool(
  async ({ contactId }) => {
    try {
      await apiCall(`/contacts/${contactId}/touch`, 'PATCH');
      return `✅ Marked contact as contacted today.`;
    } catch (error) {
      return `Error updating contact: ${error.message}`;
    }
  },
  {
    name: 'touch_contact',
    description: 'Mark a contact as recently contacted (updates last_contact to today).',
    schema: z.object({
      contactId: z.number().describe('The contact ID to update'),
    }),
  }
);

// Export all tools
const allTools = [
  queryJobs,
  getJobDetail,
  queryContacts,
  getPipelineSummary,
  createJob,
  createContact,
  createActivity,
  updateJobStatus,
  touchContact,
];

module.exports = {
  allTools,
  // Export individually for testing
  queryJobs,
  getJobDetail,
  queryContacts,
  getPipelineSummary,
  createJob,
  createContact,
  createActivity,
  updateJobStatus,
  touchContact,
};
