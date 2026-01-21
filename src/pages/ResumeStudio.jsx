import { useState } from 'react';
import { useJobContext } from '../store/JobContext';
import { 
  Box, Grid, Paper, Typography, Checkbox, List, ListItem, 
  ListItemText, ListItemIcon, Button, Chip, Divider, TextField 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function ResumeStudio() {
  const { masterProfile } = useJobContext();
  const [selectedBullets, setSelectedBullets] = useState([]);
  const [targetRole, setTargetRole] = useState('');

  const toggleBullet = (bullet) => {
    if (selectedBullets.includes(bullet)) {
      setSelectedBullets(selectedBullets.filter(b => b !== bullet));
    } else {
      setSelectedBullets([...selectedBullets, bullet]);
    }
  };

  const copyToClipboard = () => {
    const text = selectedBullets.map(b => `• ${b}`).join('\n');
    navigator.clipboard.writeText(text);
    alert('Bullets copied to clipboard!');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Resume Studio</Typography>
        <Box>
          <Button 
            startIcon={<ContentCopyIcon />} 
            variant="outlined" 
            sx={{ mr: 1, borderColor: '#4fc3f7', color: '#4fc3f7' }} 
            onClick={copyToClipboard}
          >
            Copy Selected
          </Button>
          <Button startIcon={<SaveIcon />} variant="contained" color="primary">
            Save Version
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left: Master Source */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', bgcolor: '#1e1e1e' }}>
            <Typography variant="h6" gutterBottom color="primary">Master Profile Source</Typography>
            <TextField 
              fullWidth 
              label="Target Role / Company" 
              variant="outlined" 
              size="small" 
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { color: 'white' }, '& .MuiInputLabel-root': { color: '#aaa' } }}
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
            
            {masterProfile.experience.map((exp) => (
              <Box key={exp.id} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="#e0e0e0">{exp.title} at {exp.company}</Typography>
                <List dense>
                  {exp.bullets.map((bullet, idx) => (
                    <ListItem 
                      key={idx} 
                      button 
                      onClick={() => toggleBullet(bullet)}
                      sx={{ 
                        borderRadius: 1, 
                        mb: 0.5,
                        bgcolor: selectedBullets.includes(bullet) ? 'rgba(144, 202, 249, 0.16)' : 'transparent'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox 
                          edge="start" 
                          checked={selectedBullets.includes(bullet)}
                          tabIndex={-1}
                          disableRipple
                          sx={{ color: '#757575', '&.Mui-checked': { color: '#90caf9' } }}
                        />
                      </ListItemIcon>
                      <ListItemText primary={bullet} primaryTypographyProps={{ variant: 'body2', color: '#bdbdbd' }} />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 1, borderColor: '#424242' }} />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Right: Tailored Preview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', bgcolor: '#252525', borderLeft: '4px solid #90caf9' }}>
            <Typography variant="h6" gutterBottom color="secondary">
              Tailored Output {targetRole && `for ${targetRole}`}
            </Typography>
            
            <Box sx={{ mb: 3, p: 2, border: '1px dashed #555', borderRadius: 1, bgcolor: 'rgba(0,0,0,0.2)' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Summary</Typography>
              <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#e0e0e0' }}>{masterProfile.summary}</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Selected Highlights</Typography>
            
            {selectedBullets.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', opacity: 0.5 }}>
                <Typography>Select bullets from the left to build your story.</Typography>
              </Box>
            ) : (
              <List sx={{ pl: 2, listStyleType: 'disc' }}>
                {selectedBullets.map((bullet, idx) => (
                  <ListItem key={idx} sx={{ display: 'list-item', py: 0.5, pl: 0 }}>
                    <ListItemText 
                      primary={bullet} 
                      primaryTypographyProps={{ fontSize: '0.95rem', color: '#fff' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Skills Included</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {masterProfile.skills.map(skill => (
                  <Chip key={skill} label={skill} size="small" variant="outlined" sx={{ borderColor: '#555', color: '#aaa' }} />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ResumeStudio;
