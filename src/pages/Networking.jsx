import { useJobContext } from '../store/JobContext';
import { Box, Typography, Grid, Paper, Avatar, Chip, IconButton } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function Networking() {
  const { contacts } = useJobContext();

  const buckets = [
    { id: 'Recruiters', title: 'Active Recruiters' },
    { id: 'Hiring Managers', title: 'Decision Makers' },
    { id: 'Former Colleagues', title: 'Advocates & References' },
  ];

  // Helper to get initials
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>Network Strategy</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Target 3-5 outreaches per day using the buckets below.
      </Typography>

      <Grid container spacing={3}>
        {buckets.map((bucket) => (
          <Grid item xs={12} md={4} key={bucket.id}>
            <Paper sx={{ p: 0, height: '100%', bgcolor: '#121212', border: '1px solid #333', overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: '#1e1e1e', borderBottom: '1px solid #333' }}>
                    <Typography variant="h6">{bucket.title}</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                    {contacts.filter(c => c.bucket === bucket.id).map(contact => (
                        <Paper key={contact.id} sx={{ mb: 2, p: 2, bgcolor: '#1e1e1e', display: 'flex', alignItems: 'start' }}>
                            <Avatar sx={{ bgcolor: '#333', mr: 2, width: 40, height: 40 }}>{getInitials(contact.name)}</Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold">{contact.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{contact.role} @ {contact.company}</Typography>
                                
                                <Box sx={{ mt: 1, mb: 1 }}>
                                    <Chip 
                                        icon={<AccessTimeIcon />} 
                                        label={contact.lastContact} 
                                        size="small" 
                                        variant="outlined" 
                                        sx={{ fontSize: '0.7rem', height: 24 }}
                                    />
                                </Box>
                                
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontStyle: 'italic', mb: 1 }}>
                                    "{contact.notes}"
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                                        <LinkedInIcon fontSize="small" color="primary" />
                                    </IconButton>
                                    <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                                        <MailOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                    {contacts.filter(c => c.bucket === bucket.id).length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No contacts in this bucket yet.</Typography>
                    )}
                </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Networking;
