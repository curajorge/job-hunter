import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const DAILY_GOAL = 5;

function OutreachGoalTracker({ todayCount }) {
  const progress = Math.min((todayCount / DAILY_GOAL) * 100, 100);
  const isComplete = todayCount >= DAILY_GOAL;

  return (
    <Box 
      sx={{ 
        p: 2, 
        bgcolor: isComplete ? 'rgba(102, 187, 106, 0.1)' : 'rgba(255,255,255,0.03)', 
        borderRadius: 2,
        border: isComplete ? '1px solid rgba(102, 187, 106, 0.3)' : '1px solid #333',
        mb: 3
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isComplete ? (
            <CheckCircleIcon color="success" />
          ) : (
            <LocalFireDepartmentIcon color="warning" />
          )}
          <Typography variant="subtitle1" fontWeight="bold">
            Daily Outreach Goal
          </Typography>
        </Box>
        <Chip 
          label={`${todayCount}/${DAILY_GOAL}`} 
          color={isComplete ? 'success' : todayCount > 0 ? 'warning' : 'default'}
          size="small"
        />
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        color={isComplete ? 'success' : 'primary'}
        sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)' }}
      />
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {isComplete 
          ? '🎉 Great job! You hit your daily goal!' 
          : `${DAILY_GOAL - todayCount} more outreach${DAILY_GOAL - todayCount > 1 ? 'es' : ''} to hit your goal`
        }
      </Typography>
    </Box>
  );
}

export default OutreachGoalTracker;
