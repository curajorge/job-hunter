import { createContext, useState, useContext, useMemo, useEffect } from 'react';

const JobContext = createContext();

export const useJobContext = () => useContext(JobContext);

export const JobProvider = ({ children }) => {
  // 1. COMPANIES
  const [companies, setCompanies] = useState([]);

  // 2. JOBS
  const [jobs, setJobsState] = useState([]);

  // 3. PEOPLE
  const [people, setPeople] = useState([]);

  // 4. MASTER PROFILE (Keep this local for now as it's not in the DB schema)
  const [masterProfile, setMasterProfile] = useState({
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

  // Fetch initial data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        setCompanies(data.companies || []);
        // Backend returns company_id, frontend expects companyId in some places 
        // but let's see how it's used. 
        // Actually, let's normalize it to what the components expect if needed.
        setJobsState(data.jobs || []);
        setPeople(data.contacts || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboard();
  }, []);

  // --- Derived State (Selectors) ---
  
  // Denormalize jobs for the Pipeline View (Jobs.jsx)
  const enrichedJobs = useMemo(() => {
    return jobs.map(job => {
      // Handle both companyId (frontend) and company_id (backend)
      const cId = job.companyId || job.company_id;
      const comp = companies.find(c => c.id === cId);
      return { ...job, companyId: cId, company: comp ? comp.name : 'Unknown' };
    });
  }, [jobs, companies]);

  // Denormalize people for the Networking View (Networking.jsx)
  const enrichedContacts = useMemo(() => {
    return people.map(p => {
      const cId = p.companyId || p.company_id;
      const comp = companies.find(c => c.id === cId);
      return { ...p, companyId: cId, company: comp ? comp.name : 'Unknown' };
    });
  }, [people, companies]);

  // --- Actions ---

  const addJob = async (job) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: job.companyId,
          role: job.role,
          status: job.status,
          salary: job.salary,
          next_action: job.nextAction,
          date: job.date
        })
      });
      if (response.ok) {
        const newJob = await response.json();
        setJobsState(prev => [...prev, newJob]);
      }
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };
  
  const updateJobStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/jobs/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setJobsState(prevJobs => prevJobs.map(j => j.id === id ? { ...j, status } : j));
      }
    } catch (error) {
      console.error('Error updating job status:', error);
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

  // Get full view of a company (Jobs + People)
  const getCompanyDeepView = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return null;
    
    const companyJobs = jobs.filter(j => (j.companyId || j.company_id) === companyId);
    const companyPeople = people.filter(p => (p.companyId || p.company_id) === companyId);
    
    return { ...company, jobs: companyJobs, people: companyPeople };
  };

  const value = {
    // Data
    companies,
    jobs: enrichedJobs, // Exposed as 'jobs' for backward compatibility
    contacts: enrichedContacts, // Exposed as 'contacts' for backward compatibility
    masterProfile,
    
    // Actions
    addJob,
    updateJobStatus,
    moveJob,
    getCompanyDeepView
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
