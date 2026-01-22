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

  const [masterProfile] = useState({
    name: "Jorge Cura",
    summary: "Senior backend engineer with 7+ years building high-reliability APIs and data-driven services in C#/.NET. Depth in API design, idempotent workflows, and cloud-native systems on AWS and Azure.",
    skills: ["C#", ".NET 9", "Vue 3", "AWS", "System Design", "PostgreSQL", "Redis", "Docker"],
    experience: [
      { 
        id: 'exp1', 
        company: 'RT²', 
        title: 'Senior Software Engineer', 
        bullets: [
          'Architected carrier commission processing systems supporting instant payments, residuals, and promotions across multiple carriers.',
          'Designed idempotent APIs with durable retry logic for financial transactions, ensuring zero duplicate records across millions of transactions.',
          'Built a secure virtual wallet integrated with Authorize.net for dealer transactions and comprehensive transaction management.',
          'Led migration to Vue 3 for mission-critical apps with zero downtime and improved UX and performance.'
        ] 
      },
      { 
        id: 'exp2', 
        company: 'Farmer Titan', 
        title: 'Co-Founder / CTO', 
        bullets: [
          'Defined cloud-first architecture for inventory and orders; implemented CI/CD, logging, and security baselines.',
          'Led a small team to MVP with pragmatic APIs, clean data models, and cost-aware cloud choices.'
        ] 
      },
      { 
        id: 'exp3', 
        company: 'InComm Payments', 
        title: 'Software Engineer II', 
        bullets: [
          'Built and maintained enterprise payment platforms and APIs using C#/.NET and SQL for high-volume programs.',
          'Improved developer tooling, code reviews, and test automation to raise quality and velocity.'
        ] 
      }
    ]
  });

  const normalizeJob = useCallback((job) => ({
    ...job,
    nextAction: job.next_action ?? job.nextAction,
    companyId: job.company_id ?? job.companyId
  }), []);

  const normalizeContact = useCallback((contact) => ({
    ...contact,
    lastContact: contact.last_contact ?? contact.lastContact,
    companyId: contact.company_id ?? contact.companyId,
    linkedinUrl: contact.linkedin_url ?? contact.linkedinUrl
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
          date: job.date
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
          date: updates.date
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
    } catch (err) {
      console.error('Error deleting job:', err);
      throw err;
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

  // Mark contact as contacted today
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
  // SELECTORS
  // ===================

  const getCompanyDeepView = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return null;
    
    const companyJobs = jobs.filter(j => j.companyId === companyId);
    const companyPeople = people.filter(p => p.companyId === companyId);
    
    return { ...company, jobs: companyJobs, people: companyPeople };
  };

  // Get contacts that need follow-up (>7 days since last contact)
  const getStaleContacts = useCallback((daysThreshold = 7) => {
    const today = new Date();
    return enrichedContacts.filter(c => {
      if (!c.lastContact) return true; // Never contacted = stale
      const lastDate = new Date(c.lastContact);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      return diffDays >= daysThreshold;
    }).sort((a, b) => {
      // Sort by most stale first
      if (!a.lastContact) return -1;
      if (!b.lastContact) return 1;
      return new Date(a.lastContact) - new Date(b.lastContact);
    });
  }, [enrichedContacts]);

  // Get today's outreach count
  const getTodayOutreachCount = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return enrichedContacts.filter(c => c.lastContact === today).length;
  }, [enrichedContacts]);

  const value = {
    loading,
    error,
    companies,
    jobs: enrichedJobs,
    contacts: enrichedContacts,
    masterProfile,
    
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
    
    // Contact Actions
    addContact,
    updateContact,
    touchContact,
    deleteContact,
    
    // Selectors
    getCompanyDeepView,
    getStaleContacts,
    getTodayOutreachCount
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
