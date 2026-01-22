import { useJobContext } from '../store/JobContext';
import { Grid, Paper, Typography, Box, Chip, LinearProgress, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function Dashboard() {
  const { jobs, loading } = useJobContext();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Compute Metrics
  const activeApplications = jobs.filter(j => ['Applied', 'Interviewing'].includes(j.status)).length;
  const interviews = jobs.filter(j => j.status === 'Interviewing').length;
  const offers = jobs.filter(j => j.status === 'Offer').length;
  const interviewProgress = jobs.length > 0 ? (interviews / jobs.length) * 100 : 0;
  
  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Command Center</Typography>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', color: 'white' }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>ACTIVE PIPELINE</Typography>
            <Typography variant="h2" sx={{ fontWeight: 'bold' }}>{activeApplications}</Typography>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mt: 1, opacity: 0.8 }}>
              <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> {jobs.length} total tracked
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, bgcolor: '#1e1e1e' }}>
            <Typography color="text.secondary" variant="subtitle2">INTERVIEWS</Typography>
            <Typography variant="h2" color="secondary" sx={{ fontWeight: 'bold' }}>{interviews}</Typography>
            <LinearProgress variant="determinate" value={interviewProgress} color="secondary" sx={{ mt: 2, height: 6, borderRadius: 3 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, bgcolor: '#1e1e1e' }}>
            <Typography color="text.secondary" variant="subtitle2">OFFERS</Typography>
            <Typography variant="h2" sx={{ color: '#00e676', fontWeight: 'bold' }}>{offers}</Typography>
            <Typography variant="caption" color="text.secondary">{offers > 0 ? 'Action required' : 'Keep pushing!'}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Immediate Actions (6/45 Method) */}
      <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>Today's Focus (6/45 Method)</Typography>
      {jobs.length === 0 ? (
        <Paper sx={{ p: 4, bgcolor: '#1e1e1e', textAlign: 'center' }}>
          <Typography color="text.secondary">No jobs tracked yet. Add companies and jobs to get started!</Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 0, overflow: 'hidden', bgcolor: '#1e1e1e' }}>
          {jobs.filter(j => j.nextAction).map((job) => (
            <Box key={job.id} sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              '&:last-child': { borderBottom: 'none' },
              transition: 'background-color 0.2s',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
            }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">{job.nextAction}</Typography>
                <Typography variant="body2" color="text.secondary">{job.role} at <span style={{ color: '#90caf9' }}>{job.company}</span></Typography>
              </Box>
              <Chip 
                label={job.status} 
                color={job.status === 'Offer' ? 'success' : job.status === 'Interviewing' ? 'secondary' : 'default'} 
                size="small" 
                variant="outlined"
              />
            </Box>
          ))}
          {jobs.filter(j => j.nextAction).length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">No pending actions. Add next actions to your jobs!</Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}

export default Dashboard;
