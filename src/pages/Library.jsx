import Typography from '@mui/material/Typography';
import { Box, Paper, Grid } from '@mui/material';

function Library() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Library & Assets</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#1e1e1e' }}>
            <Typography variant="h6" gutterBottom color="primary">STAR Stories</Typography>
            <Typography variant="body2" color="text.secondary">Repository of behavioral interview stories.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#1e1e1e' }}>
            <Typography variant="h6" gutterBottom color="primary">Templates</Typography>
            <Typography variant="body2" color="text.secondary">Cover letters and outreach message templates.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Library;
