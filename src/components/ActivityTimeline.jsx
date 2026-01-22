import { Box, Typography, Paper, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WorkIcon from '@mui/icons-material/Work';
import PhoneIcon from '@mui/icons-material/Phone';
import CodeIcon from '@mui/icons-material/Code';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EmailIcon from '@mui/icons-material/Email';
import NoteIcon from '@mui/icons-material/Note';

const getActivityIcon = (type) => {
  const icons = {
    'Applied': <WorkIcon fontSize="small" />,
    'Recruiter Screen': <PhoneIcon fontSize="small" />,
    'Phone Interview': <PhoneIcon fontSize="small" />,
    'Technical Interview': <CodeIcon fontSize="small" />,
    'Take-home Assignment': <AssignmentIcon fontSize="small" />,
    'On-site / Final Round': <BusinessIcon fontSize="small" />,
    'Offer Received': <CheckCircleIcon fontSize="small" />,
    'Rejected': <CancelIcon fontSize="small" />,
    'Withdrew': <ExitToAppIcon fontSize="small" />,
    'Follow-up Sent': <EmailIcon fontSize="small" />,
    'General Note': <NoteIcon fontSize="small" />,
  };
  return icons[type] || <NoteIcon fontSize="small" />;
};

const getActivityColor = (type) => {
  const colors = {
    'Applied': 'primary',
    'Recruiter Screen': 'info',
    'Phone Interview': 'info',
    'Technical Interview': 'secondary',
    'Take-home Assignment': 'warning',
    'On-site / Final Round': 'secondary',
    'Offer Received': 'success',
    'Rejected': 'error',
    'Withdrew': 'default',
    'Follow-up Sent': 'info',
    'General Note': 'default',
  };
  return colors[type] || 'default';
};

function ActivityTimeline({ activities, onDelete }) {
  if (!activities || activities.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
        <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No activity logged yet. Click "Log Activity" to start tracking.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Timeline line */}
      <Box 
        sx={{ 
          position: 'absolute', 
          left: 16, 
          top: 0, 
          bottom: 0, 
          width: 2, 
          bgcolor: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }} 
      />
      
      {activities.map((activity, index) => (
        <Box 
          key={activity.id} 
          sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            mb: 2,
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Timeline dot */}
          <Box 
            sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              bgcolor: '#1e1e1e',
              border: '2px solid',
              borderColor: `${getActivityColor(activity.type)}.main`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              flexShrink: 0
            }}
          >
            {getActivityIcon(activity.type)}
          </Box>
          
          {/* Content */}
          <Paper 
            sx={{ 
              flex: 1, 
              p: 2, 
              bgcolor: '#1e1e1e',
              border: '1px solid rgba(255,255,255,0.05)',
              '&:hover': { borderColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={activity.type} 
                  size="small" 
                  color={getActivityColor(activity.type)}
                  variant="outlined"
                />
                <Typography variant="caption" color="text.secondary">
                  {activity.date}
                </Typography>
              </Box>
              {onDelete && (
                <IconButton 
                  size="small" 
                  onClick={() => onDelete(activity.id)}
                  sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: 'error.main' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            {activity.notes && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {activity.notes}
              </Typography>
            )}
          </Paper>
        </Box>
      ))}
    </Box>
  );
}

export default ActivityTimeline;
