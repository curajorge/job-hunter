import { Box, Paper, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { useJobContext } from '../store/JobContext';
import { useState, useMemo } from 'react';

const BUCKET_SCHEDULE = [
  'Recruiters',         // Sunday (0)
  'Recruiters',         // Monday
  'Hiring Managers',    // Tuesday
  'Former Colleagues',  // Wednesday
  'Recruiters',         // Thursday
  'Hiring Managers',    // Friday
  'Former Colleagues'   // Saturday
];

function BucketWidget({ onContactClick }) {
  const { contacts, touchContact } = useJobContext();
  const [seed, setSeed] = useState(0); // Force re-randomization

  const bucketName = BUCKET_SCHEDULE[new Date().getDay()];
  
  const suggestions = useMemo(() => {
    // Filter contacts by bucket and sort by last contacted (oldest first)
    const filtered = contacts
      .filter(c => c.bucket === bucketName)
      .sort((a, b) => {
          if (!a.lastContact) return -1;
          if (!b.lastContact) return 1;
          return new Date(a.lastContact) - new Date(b.lastContact);
      });
    
    // Take top 3 stale ones
    return filtered.slice(0, 3);
  }, [contacts, bucketName, seed]);

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

  const handleRefresh = () => {
      // In a real app with random selection, this would shuffle. 
      // Here we are just sorting by staleness, so refresh doesn't do much unless we implement random pick.
      // For now, let's just re-trigger memo.
      setSeed(s => s + 1);
  };

  return (
    <Paper sx={{ borderLeft: '4px solid #f48fb1', bgcolor: '#1e1e1e', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(244, 143, 177, 0.08)' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f48fb1' }}>
            Today's Bucket: {bucketName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Goal: Contact 3 people from this list
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleRefresh}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <List dense disablePadding>
        {suggestions.length > 0 ? suggestions.map((contact) => (
          <ListItem 
            key={contact.id} 
            button 
            onClick={() => onContactClick(contact)}
            sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            secondaryAction={
              <IconButton edge="end" aria-label="contact" onClick={(e) => { e.stopPropagation(); touchContact(contact.id); }}>
                <TouchAppIcon fontSize="small" color="primary" />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#333', fontSize: '0.8rem' }}>
                {getInitials(contact.name)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={contact.name} 
              secondary={`${contact.role} @ ${contact.company}`} 
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
              secondaryTypographyProps={{ fontSize: '0.75rem' }}
            />
          </ListItem>
        )) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No contacts found in this bucket.
            </Typography>
          </Box>
        )}
      </List>
    </Paper>
  );
}

export default BucketWidget;
