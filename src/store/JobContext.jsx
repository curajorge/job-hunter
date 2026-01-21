import { createContext, useState, useContext } from 'react';

const JobContext = createContext();

export const useJobContext = () => useContext(JobContext);

export const JobProvider = ({ children }) => {
  // Initial Mock Data
  const [jobs, setJobs] = useState([
    { id: 1, company: 'Ezra', role: 'Senior Full Stack Developer', status: 'Interviewing', salary: '215k', nextAction: 'Prep for System Design', date: '2025-10-25' },
    { id: 2, company: 'RT²', role: 'Senior Software Engineer', status: 'Offer', salary: '170k', nextAction: 'Negotiate Equity', date: '2025-10-20' },
    { id: 3, company: 'Google', role: 'Staff Engineer', status: 'Applied', salary: '250k', nextAction: 'Follow up with recruiter', date: '2025-10-28' },
    { id: 4, company: 'Netflix', role: 'Senior Software Engineer', status: 'Wishlist', salary: '300k', nextAction: 'Find referral', date: '2025-11-01' }
  ]);

  const [contacts, setContacts] = useState([
    { id: 1, name: 'Tarek Hamzeh', role: 'Recruiter', company: 'Jobot', bucket: 'Recruiters', lastContact: '2025-09-20', notes: 'Discussed Fintech roles.' },
    { id: 2, name: 'Alex Stiglick', role: 'Director of Engineering', company: 'Ezra', bucket: 'Hiring Managers', lastContact: '2025-10-25', notes: 'Interviewed with him. Good vibes.' },
    { id: 3, name: 'Former Manager', role: 'Engineering Manager', company: 'InComm', bucket: 'Former Colleagues', lastContact: '2024-12-15', notes: 'Ask for reference.' }
  ]);

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

  const addJob = (job) => setJobs([...jobs, { ...job, id: Date.now() }]);
  
  const updateJobStatus = (id, status) => {
    // Ensure we are working with a number or string consistently
    const jobId = Number(id);
    setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, status } : j));
  };

  const moveJob = (id, direction) => {
    const stages = ['Wishlist', 'Applied', 'Interviewing', 'Offer'];
    const job = jobs.find(j => j.id === id);
    const currentIndex = stages.indexOf(job.status);
    
    if (direction === 'next' && currentIndex < stages.length - 1) {
      updateJobStatus(id, stages[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      updateJobStatus(id, stages[currentIndex - 1]);
    }
  };

  return (
    <JobContext.Provider value={{ jobs, contacts, addJob, updateJobStatus, moveJob, masterProfile }}>
      {children}
    </JobContext.Provider>
  );
};
