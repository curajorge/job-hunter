import { useParams, useNavigate } from 'react-router-dom';
import { useJobContext } from '../store/JobContext';
import { Box, Typography, Grid, Paper, Button, Chip, Divider, IconButton, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LanguageIcon from '@mui/icons-material/Language';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';

function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCompanyDeepView } = useJobContext();

  const data = getCompanyDeepView(id);

  if (!data) {
    return <Typography>Company not found</Typography>;
  }

  return (
    <Box>
      {/* Header */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/companies')} 
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Pipeline
      </Button>

      <Paper sx={{ p: 4, bgcolor: '#1e1e1e', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box>
            <Typography variant="h3" fontWeight="800" gutterBottom>{data.name}</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip label={data.domain} color="primary" />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                <LanguageIcon fontSize="small" />
                <Typography component="a" href={`https://${data.website}`} target="_blank" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  {data.website}
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ mt: 2, maxWidth: '600px', color: 'text.secondary' }}>
              {data.description}
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<AddIcon />}>Log Activity</Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column: Jobs */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Active Opportunities ({data.jobs.length})</Typography>
            <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}><AddIcon /></IconButton>
          </Box>
          
          {data.jobs.length === 0 ? (
             <Paper sx={{ p: 3, bgcolor: '#1e1e1e', borderStyle: 'dashed', borderColor: '#444' }}>
               <Typography color="text.secondary" align="center">No active jobs tracked.</Typography>
             </Paper>
          ) : (
            data.jobs.map(job => (
              <Paper key={job.id} sx={{ p: 3, bgcolor: '#1e1e1e', mb: 2, borderLeft: '4px solid #90caf9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="h6">{job.role}</Typography>
                    <Typography variant="body2" color="success.light" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WorkIcon fontSize="inherit" /> {job.salary}
                    </Typography>
                  </Box>
                  <Chip label={job.status} size="small" color={job.status === 'Offer' ? 'success' : 'default'} />
                </Box>
                <Divider sx={{ my: 2, opacity: 0.1 }} />
                <Typography variant="body2" color="text.secondary">
                  <strong>Next Action:</strong> {job.nextAction}
                </Typography>
              </Paper>
            ))
          )}
        </Grid>

        {/* Right Column: People */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Key Contacts ({data.people.length})</Typography>
            <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}><AddIcon /></IconButton>
          </Box>

          <Paper sx={{ bgcolor: '#1e1e1e' }}>
            <List>
              {data.people.map((person, index) => (
                <Box key={person.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#333' }}><PersonIcon /></Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={person.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="primary.light" display="block">
                            {person.role}
                          </Typography>
                          {person.notes}
                        </>
                      }
                    />
                  </ListItem>
                  {index < data.people.length - 1 && <Divider component="li" variant="inset" />}
                </Box>
              ))}
              {data.people.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No contacts added yet.</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CompanyDetail;
