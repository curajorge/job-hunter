
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

function Dashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 140, boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="h5">Applications Sent</Typography>
            <Typography variant="h2">12</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 140, boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="h5">Interviews</Typography>
            <Typography variant="h2">3</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 140, boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="h5">Offers</Typography>
            <Typography variant="h2">1</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 140, boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="h5">Active Conversations</Typography>
            <Typography variant="h2">5</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt: 3, boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Recent Activity
            </Typography>
            {/* Placeholder for recent activity feed */}
            <Typography>Applied to Software Engineer at Google.</Typography>
            <Typography>Interview scheduled for Product Manager at Facebook.</Typography>
            <Typography>Followed up with recruiter from Amazon.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
