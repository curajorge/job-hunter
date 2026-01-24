import { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';

const JobContext = createContext();

export const useJobContext = () => useContext(JobContext);

const API_BASE = '/api';

export const JobProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobsState] = useState([]);
  const [people, setPeople] = useState([]);
  const [resumes, setResumes] = useState([]);

  const normalizeJob = useCallback((job) => ({
    ...job,
    nextAction: job.next_action ?? job.nextAction,
    companyId: job.company_id ?? job.companyId,
    resumeVersionId: job.resume_version_id ?? job.resumeVersionId
  }), []);

  const normalizeContact = useCallback((contact) => ({
    ...contact,
    lastContact: contact.last_contact ?? contact.lastContact,
    companyId: contact.company_id ?? contact.companyId,
    jobId: contact.job_id ?? contact.jobId,
    linkedinUrl: contact.linkedin_url ?? contact.linkedinUrl
  }), []);

  const normalizeEngagementThread = useCallback((thread) => ({
    ...thread,
    contactId: thread.contact_id ?? thread.contactId,
    sourceUrl: thread.source_url ?? thread.sourceUrl,
    sourceTitle: thread.source_title ?? thread.sourceTitle,
    startedAt: thread.started_at ?? thread.startedAt,
    messageCount: thread.message_count ?? thread.messageCount,
    firstOutboundMessage: thread.first_outbound_message ?? thread.firstOutboundMessage
  }), []);

  const normalizeEngagementMessage = useCallback((message) => ({
    ...message,
    threadId: message.thread_id ?? message.threadId
  }), []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/dashboard`);
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        
        setCompanies(data.companies || []);
        setJobsState((data.jobs || []).map(normalizeJob));
        setPeople((data.contacts || []).map(normalizeContact));
        setResumes(data.resumes || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [normalizeJob, normalizeContact]);

  // --- Derived State ---
  
  const enrichedJobs = useMemo(() => {
    return jobs.map(job => {
      const comp = companies.find(c => c.id === job.companyId);
      return { ...job, company: comp ? comp.name : 'Unknown' };
    });
  }, [jobs, companies]);

  const enrichedContacts = useMemo(() => {
    return people.map(p => {
      const comp = companies.find(c => c.id === p.companyId);
      return { ...p, company: comp ? comp.name : 'Unknown' };
    });
  }, [people, companies]);

  // ===================
  // COMPANY ACTIONS
  // ===================

  const addCompany = async (company) => {
    try {
      const response = await fetch(`${API_BASE}/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: company.name,
          domain: company.domain,
          website: company.website,
          description: company.description
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create company');
      }
      const newCompany = await response.json();
      setCompanies(prev => [...prev, newCompany]);
      return newCompany;
    } catch (err) {
      console.error('Error adding company:', err);
      throw err;
    }
  };

  const updateCompany = async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE}/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update company');
      }
      const updated = await response.json();
      setCompanies(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      console.error('Error updating company:', err);
      throw err;
    }
  };

  const deleteCompany = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/companies/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete company');
      }
      setCompanies(prev => prev.filter(c => c.id !== id));
      setJobsState(prev => prev.filter(j => j.companyId !== id));
      setPeople(prev => prev.filter(p => p.companyId !== id));
    } catch (err) {
      console.error('Error deleting company:', err);
      throw err;
    }
  };

  // ===================
  // JOB ACTIONS
  // ===================

  const addJob = async (job) => {
    try {
      const response = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: job.companyId,
          role: job.role,
          status: job.status || 'Wishlist',
          salary: job.salary,
          next_action: job.nextAction,
          date: job.date,
          description: job.description,
          notes: job.notes,
          resume_version_id: job.resumeVersionId
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create job');
      }
      const newJob = await response.json();
      const normalized = normalizeJob(newJob);
      setJobsState(prev => [...prev, normalized]);
      return normalized;
    } catch (err) {
      console.error('Error adding job:', err);
      throw err;
    }
  };

  const updateJob = async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE}/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: updates.companyId,
          role: updates.role,
          status: updates.status,
          salary: updates.salary,
          next_action: updates.nextAction,
          date: updates.date,
          description: updates.description,
          notes: updates.notes,
          resume_version_id: updates.resumeVersionId
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update job');
      }
      const updated = await response.json();
      const normalized = normalizeJob(updated);
      setJobsState(prev => prev.map(j => j.id === id ? normalized : j));
      return normalized;
    } catch (err) {
      console.error('Error updating job:', err);
      throw err;
    }
  };
  
  const updateJobStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE}/jobs/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update job status');
      }
      setJobsState(prevJobs => prevJobs.map(j => j.id === id ? { ...j, status } : j));
    } catch (err) {
      console.error('Error updating job status:', err);
      throw err;
    }
  };

  const deleteJob = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/jobs/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete job');
      }
      setJobsState(prev => prev.filter(j => j.id !== id));
      // Also remove contacts linked to this job
      setPeople(prev => prev.filter(p => p.jobId !== id));
    } catch (err) {
      console.error('Error deleting job:', err);
      throw err;
    }
  };

  const clearJobAction = async (id) => {
      const job = jobs.find(j => j.id === id);
      if (job) {
          await updateJob(id, { ...job, nextAction: '' });
      }
  };

  const moveJob = (id, direction) => {
    const stages = ['Wishlist', 'Applied', 'Interviewing', 'Offer'];
    const job = jobs.find(j => j.id === id);
    if (!job) return;
    const currentIndex = stages.indexOf(job.status);
    
    if (direction === 'next' && currentIndex < stages.length - 1) {
      updateJobStatus(id, stages[currentIndex + 1]);
    }
    if (direction === 'prev' && currentIndex > 0) {
      updateJobStatus(id, stages[currentIndex - 1]);
    }
  };

  // Fetch single job with full details (activities, contacts)
  const fetchJobDetail = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/jobs/${id}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch job');
      }
      const data = await response.json();
      return {
        ...normalizeJob(data),
        activities: data.activities || [],
        contacts: (data.contacts || []).map(normalizeContact)
      };
    } catch (err) {
      console.error('Error fetching job detail:', err);
      throw err;
    }
  };

  // ===================
  // ACTIVITY ACTIONS
  // ===================

  const addActivity = async (jobId, activity) => {
    try {
      const response = await fetch(`${API_BASE}/jobs/${jobId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activity.type,
          date: activity.date,
          notes: activity.notes
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create activity');
      }
      return await response.json();
    } catch (err) {
      console.error('Error adding activity:', err);
      throw err;
    }
  };

  const deleteActivity = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/activities/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete activity');
      }
    } catch (err) {
      console.error('Error deleting activity:', err);
      throw err;
    }
  };

  // ===================
  // CONTACT ACTIONS
  // ===================

  const addContact = async (contact) => {
    try {
      const response = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: contact.companyId,
          job_id: contact.jobId,
          name: contact.name,
          role: contact.role,
          bucket: contact.bucket || 'Recruiters',
          email: contact.email,
          linkedin_url: contact.linkedinUrl,
          phone: contact.phone,
          last_contact: contact.lastContact,
          notes: contact.notes
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create contact');
      }
      const newContact = await response.json();
      const normalized = normalizeContact(newContact);
      setPeople(prev => [...prev, normalized]);
      return normalized;
    } catch (err) {
      console.error('Error adding contact:', err);
      throw err;
    }
  };

  const updateContact = async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: updates.companyId,
          job_id: updates.jobId,
          name: updates.name,
          role: updates.role,
          bucket: updates.bucket,
          email: updates.email,
          linkedin_url: updates.linkedinUrl,
          phone: updates.phone,
          last_contact: updates.lastContact,
          notes: updates.notes
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update contact');
      }
      const updated = await response.json();
      const normalized = normalizeContact(updated);
      setPeople(prev => prev.map(c => c.id === id ? normalized : c));
      return normalized;
    } catch (err) {
      console.error('Error updating contact:', err);
      throw err;
    }
  };

  const touchContact = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/contacts/${id}/touch`, {
        method: 'PATCH'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update contact');
      }
      const { last_contact } = await response.json();
      setPeople(prev => prev.map(c => c.id === id ? { ...c, lastContact: last_contact } : c));
    } catch (err) {
      console.error('Error touching contact:', err);
      throw err;
    }
  };

  const deleteContact = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete contact');
      }
      setPeople(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting contact:', err);
      throw err;
    }
  };

  // ===================
  // ENGAGEMENT ACTIONS
  // ===================

  const fetchContactEngagements = async (contactId) => {
    try {
      const response = await fetch(`${API_BASE}/contacts/${contactId}/engagements`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch engagements');
      }
      const data = await response.json();
      return data.map(normalizeEngagementThread);
    } catch (err) {
      console.error('Error fetching engagements:', err);
      throw err;
    }
  };

  const createEngagement = async (contactId, engagementData) => {
    try {
      const response = await fetch(`${API_BASE}/contacts/${contactId}/engagements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: engagementData.type,
          source_url: engagementData.sourceUrl,
          source_title: engagementData.sourceTitle,
          started_at: engagementData.startedAt,
          first_message: {
            direction: engagementData.firstMessage.direction || 'outbound',
            content: engagementData.firstMessage.content,
            date: engagementData.firstMessage.date || engagementData.startedAt
          }
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create engagement');
      }
      const data = await response.json();
      return normalizeEngagementThread(data);
    } catch (err) {
      console.error('Error creating engagement:', err);
      throw err;
    }
  };

  const fetchEngagementDetail = async (threadId) => {
    try {
      const response = await fetch(`${API_BASE}/engagements/${threadId}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch engagement detail');
      }
      const data = await response.json();
      return {
        ...normalizeEngagementThread(data),
        messages: (data.messages || []).map(normalizeEngagementMessage)
      };
    } catch (err) {
      console.error('Error fetching engagement detail:', err);
      throw err;
    }
  };

  const updateEngagement = async (threadId, updates) => {
    try {
      const response = await fetch(`${API_BASE}/engagements/${threadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updates.status,
          source_title: updates.sourceTitle,
          source_url: updates.sourceUrl
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update engagement');
      }
      const data = await response.json();
      return normalizeEngagementThread(data);
    } catch (err) {
      console.error('Error updating engagement:', err);
      throw err;
    }
  };

  const deleteEngagement = async (threadId) => {
    try {
      const response = await fetch(`${API_BASE}/engagements/${threadId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete engagement');
      }
    } catch (err) {
      console.error('Error deleting engagement:', err);
      throw err;
    }
  };

  const addEngagementMessage = async (threadId, messageData) => {
    try {
      const response = await fetch(`${API_BASE}/engagements/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction: messageData.direction,
          content: messageData.content,
          date: messageData.date
        })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add message');
      }
      const data = await response.json();
      return normalizeEngagementMessage(data);
    } catch (err) {
      console.error('Error adding engagement message:', err);
      throw err;
    }
  };

  const deleteEngagementMessage = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE}/messages/${messageId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete message');
      }
    } catch (err) {
      console.error('Error deleting engagement message:', err);
      throw err;
    }
  };

  // ===================
  // RESUME ACTIONS
  // ===================

  const fetchResume = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/resumes/${id}`);
      if (!response.ok) throw new Error('Failed to fetch resume');
      return await response.json();
    } catch (err) {
      console.error('Error fetching resume:', err);
      throw err;
    }
  };

  const createResume = async (name, content, isMaster = false) => {
    try {
      const response = await fetch(`${API_BASE}/resumes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content, is_master: isMaster })
      });
      if (!response.ok) throw new Error('Failed to create resume');
      const newResume = await response.json();
      setResumes(prev => [newResume, ...prev]);
      return newResume;
    } catch (err) {
      console.error('Error creating resume:', err);
      throw err;
    }
  };

  const updateResume = async (id, name, content) => {
    try {
      const response = await fetch(`${API_BASE}/resumes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content })
      });
      if (!response.ok) throw new Error('Failed to update resume');
      // Update local state if needed (mainly for name changes)
      setResumes(prev => prev.map(r => r.id === id ? { ...r, name } : r));
    } catch (err) {
      console.error('Error updating resume:', err);
      throw err;
    }
  };

  // ===================
  // SELECTORS
  // ===================

  const getCompanyDeepView = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return null;
    
    const companyJobs = jobs.filter(j => j.companyId === companyId);
    const companyPeople = people.filter(p => p.companyId === companyId);
    
    return { ...company, jobs: companyJobs, people: companyPeople };
  };

  const getStaleContacts = useCallback((daysThreshold = 14) => {
    const today = new Date();
    return enrichedContacts.filter(c => {
      if (!c.lastContact) return true;
      const lastDate = new Date(c.lastContact);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      return diffDays >= daysThreshold;
    }).sort((a, b) => {
      if (!a.lastContact) return -1;
      if (!b.lastContact) return 1;
      return new Date(a.lastContact) - new Date(b.lastContact);
    });
  }, [enrichedContacts]);

  const getTodayOutreachCount = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return enrichedContacts.filter(c => c.lastContact === today).length;
  }, [enrichedContacts]);

  const getActionItems = useCallback(() => {
    // 1. Job Actions
    const jobActions = enrichedJobs
      .filter(j => j.nextAction && j.status !== 'Rejected' && j.status !== 'Withdrawn' && j.status !== 'Wishlist')
      .map(j => ({
        ...j,
        type: 'job',
        displayText: j.nextAction,
        subText: `${j.role} @ ${j.company}`,
        date: j.date,
        sortDate: j.date ? new Date(j.date) : new Date(8640000000000000) // Future date if missing to push to bottom of specific sorts, but here we want top?
      }));

    // 2. Stale Contacts (older than 14 days)
    const stalePeople = getStaleContacts(14).map(c => ({
      ...c,
      type: 'contact',
      displayText: `Follow up: ${c.name}`,
      subText: `${c.role} @ ${c.company}`,
      date: c.lastContact,
      sortDate: c.lastContact ? new Date(c.lastContact) : new Date(0) // Old date if missing
    }));

    // 3. Merge and Sort (Oldest dates first = higher urgency for contacts, upcoming dates for jobs)
    // Actually, for a "ToDo" list:
    // - Overdue jobs/contacts should be top.
    // - Upcoming jobs should be next.
    return [...jobActions, ...stalePeople].sort((a, b) => a.sortDate - b.sortDate);
  }, [enrichedJobs, getStaleContacts]);

  const value = {
    loading,
    error,
    companies,
    jobs: enrichedJobs,
    contacts: enrichedContacts,
    resumes,
    
    // Company Actions
    addCompany,
    updateCompany,
    deleteCompany,
    
    // Job Actions
    addJob,
    updateJob,
    updateJobStatus,
    deleteJob,
    moveJob,
    fetchJobDetail,
    clearJobAction,
    
    // Activity Actions
    addActivity,
    deleteActivity,
    
    // Contact Actions
    addContact,
    updateContact,
    touchContact,
    deleteContact,

    // Engagement Actions
    fetchContactEngagements,
    createEngagement,
    fetchEngagementDetail,
    updateEngagement,
    deleteEngagement,
    addEngagementMessage,
    deleteEngagementMessage,

    // Resume Actions
    fetchResume,
    createResume,
    updateResume,
    
    // Selectors
    getCompanyDeepView,
    getStaleContacts,
    getTodayOutreachCount,
    getActionItems
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
