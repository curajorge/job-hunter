import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';

function Dashboard() {
  const [jobs, setJobs] = useState(() => {
    const storedJobs = localStorage.getItem('jobs');
    return storedJobs ? JSON.parse(storedJobs) : [];
  });
  const [contacts, setContacts] = useState(() => {
    const storedContacts = localStorage.getItem('contacts');
    return storedContacts ? JSON.parse(storedContacts) : [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const storedJobs = localStorage.getItem('jobs');
      if (storedJobs) {
        setJobs(JSON.parse(storedJobs));
      }
      const storedContacts = localStorage.getItem('contacts');
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Jobs Applied</Typography>
            <Typography variant="h3">{jobs.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Upcoming Interviews</Typography>
            <Typography variant="h3">{jobs.filter(job => job.status.toLowerCase() === 'interview').length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Networking Connections</Typography>
            <Typography variant="h3">{contacts.length}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
