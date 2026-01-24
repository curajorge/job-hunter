import { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Chip, CircularProgress, IconButton } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useJobContext } from '../store/JobContext';

const TYPE_ICONS = {
  'post_comment': <ChatBubbleOutlineIcon fontSize="small" />,
  'dm': <MailOutlineIcon fontSize="small" />,
  'connection_request': <PersonAddAltIcon fontSize="small" />
};

const TYPE_LABELS = {
  'post_comment': 'Post Comment',
  'dm': 'DM',
  'connection_request': 'Connection'
};

const STATUS_COLORS = {
  'active': 'default',
  'pending': 'default',
  'no_reply': 'warning',
  'replied': 'success',
  'converted': 'primary'
};

function EngagementList({ contactId, onSelect }) {
  const { fetchContactEngagements } = useJobContext();
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEngagements = async () => {
      if (!contactId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchContactEngagements(contactId);
        setEngagements(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadEngagements();
  }, [contactId, fetchContactEngagements]);

  const truncate = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="error">Failed to load engagements</Typography>
      </Box>
    );
  }

  if (engagements.length === 0) {
    return (
      <Box sx={{ py: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No engagement logged yet. Click + to track your first interaction.
        </Typography>
      </Box>
    );
  }

  return (
    <List dense disablePadding>
      {engagements.map((eng) => (
        <ListItem
          key={eng.id}
          button
          onClick={() => onSelect(eng)}
          sx={{
            mb: 1,
            bgcolor: 'rgba(255,255,255,0.02)',
            borderRadius: 1,
            border: '1px solid rgba(255,255,255,0.05)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
          }}
          secondaryAction={
            eng.sourceUrl && (
              <IconButton
                edge="end"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(eng.sourceUrl, '_blank');
                }}
                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            )
          }
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {TYPE_ICONS[eng.type]}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" component="span" fontWeight="medium">
                  {eng.sourceTitle || TYPE_LABELS[eng.type]}
                </Typography>
                <Chip
                  label={eng.status}
                  size="small"
                  color={STATUS_COLORS[eng.status]}
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
                {eng.messageCount > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {eng.messageCount} msg{eng.messageCount > 1 ? 's' : ''}
                  </Typography>
                )}
              </Box>
            }
            secondary={
              <Box component="span" sx={{ display: 'block' }}>
                <Typography variant="caption" color="text.secondary" component="span">
                  {eng.startedAt}
                </Typography>
                {eng.firstOutboundMessage && (
                  <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1, fontStyle: 'italic' }}>
                    "{truncate(eng.firstOutboundMessage)}"
                  </Typography>
                )}
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}

export default EngagementList;
