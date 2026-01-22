import { Box, Paper, Avatar, Typography, Chip, Button, IconButton } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import TouchAppIcon from '@mui/icons-material/TouchApp';

function StaleContactCard({ contact, onReachOut, onClick }) {
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

  const getDaysSince = () => {
    if (!contact.lastContact) return 'Never';
    const today = new Date();
    const lastDate = new Date(contact.lastContact);
    const days = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
  };

  const handleReachOut = (e) => {
    e.stopPropagation();
    onReachOut(contact);
  };

  const handleLinkedIn = (e) => {
    e.stopPropagation();
    if (contact.linkedinUrl) {
      window.open(contact.linkedinUrl, '_blank');
    }
  };

  const handleEmail = (e) => {
    e.stopPropagation();
    if (contact.email) {
      window.open(`mailto:${contact.email}`, '_blank');
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: '#1e1e1e',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': { bgcolor: '#252525', transform: 'translateX(4px)' }
      }}
      onClick={() => onClick(contact)}
    >
      <Avatar sx={{ bgcolor: '#333', width: 40, height: 40 }}>
        {getInitials(contact.name)}
      </Avatar>
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight="bold" noWrap>
          {contact.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {contact.role} @ {contact.company}
        </Typography>
      </Box>

      <Chip 
        label={getDaysSince()} 
        size="small" 
        color={!contact.lastContact ? 'error' : 'warning'}
        variant="outlined"
        sx={{ minWidth: 70 }}
      />

      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {contact.linkedinUrl && (
          <IconButton size="small" onClick={handleLinkedIn}>
            <LinkedInIcon fontSize="small" color="primary" />
          </IconButton>
        )}
        {contact.email && (
          <IconButton size="small" onClick={handleEmail}>
            <EmailIcon fontSize="small" />
          </IconButton>
        )}
        <Button
          size="small"
          variant="contained"
          onClick={handleReachOut}
          sx={{ minWidth: 'auto', px: 1.5 }}
        >
          <TouchAppIcon fontSize="small" />
        </Button>
      </Box>
    </Paper>
  );
}

export default StaleContactCard;
