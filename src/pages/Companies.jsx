import { useNavigate } from 'react-router-dom';
import { useJobContext } from '../store/JobContext';
import { Box, Typography, Grid, Paper, Chip, Button } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function Companies() {
  const { companies, jobs, contacts } = useJobContext();
  const navigate = useNavigate();

  // Helper to count active items per company
  const getCounts = (companyId) => {
    const activeJobs = jobs.filter(j => j.companyId === companyId).length;
    const activeContacts = contacts.filter(c => c.companyId === companyId).length;
    return { activeJobs, activeContacts };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Target Companies</Typography>
        <Button variant="contained" startIcon={<BusinessIcon />}>Add Company</Button>
      </Box>

      <Grid container spacing={3}>
        {companies.map((company) => {
          const { activeJobs, activeContacts } = getCounts(company.id);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={company.id}>
              <Paper 
                sx={{ 
                  p: 3, 
                  bgcolor: '#1e1e1e', 
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    bgcolor: '#252525'
                  }
                }}
                onClick={() => navigate(`/companies/${company.id}`)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{company.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{company.domain}</Typography>
                  </Box>
                  <ArrowForwardIcon sx={{ color: 'rgba(255,255,255,0.1)' }} />
                </Box>

                <Typography variant="body2" sx={{ mb: 3, minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {company.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {activeJobs > 0 && (
                    <Chip 
                      icon={<WorkIcon sx={{ fontSize: 16 }} />} 
                      label={`${activeJobs} Job${activeJobs > 1 ? 's' : ''}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  )}
                  {activeContacts > 0 && (
                    <Chip 
                      icon={<PeopleIcon sx={{ fontSize: 16 }} />} 
                      label={`${activeContacts} Contact${activeContacts > 1 ? 's' : ''}`} 
                      size="small" 
                      variant="outlined" 
                      sx={{ borderColor: '#666' }}
                    />
                  )}
                  {activeJobs === 0 && activeContacts === 0 && (
                    <Chip label="Prospecting" size="small" variant="outlined" disabled />
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default Companies;
