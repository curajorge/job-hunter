import { Paper, Box, Typography, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function MiniPipelineSummary({ jobs }) {
  const activeApplications = jobs.filter(j => ['Applied', 'Interviewing'].includes(j.status)).length;
  const interviews = jobs.filter(j => j.status === 'Interviewing').length;
  const offers = jobs.filter(j => j.status === 'Offer').length;

  return (
    <Paper sx={{ p: 0, height: '100%', bgcolor: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Pipeline Health
            </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-around', alignItems: 'center', p: 1 }}>
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">{activeApplications}</Typography>
                <Typography variant="caption" color="text.secondary">Active</Typography>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">{interviews}</Typography>
                <Typography variant="caption" color="text.secondary">Interviews</Typography>
            </Box>
            
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">{offers}</Typography>
                <Typography variant="caption" color="text.secondary">Offers</Typography>
            </Box>
        </Box>
        
        <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
             <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
                <TrendingUpIcon fontSize="inherit" sx={{ mr: 0.5 }} /> {jobs.length} total opportunities
             </Typography>
        </Box>
    </Paper>
  );
}

export default MiniPipelineSummary;
