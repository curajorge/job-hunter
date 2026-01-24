import { Paper, Box, Typography, IconButton, Checkbox, Chip, Tooltip } from '@mui/material';
import CircleUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircle from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function ActionItemCard({ item, onComplete, onClick }) {
  const isJob = item.type === 'job';

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onComplete(item);
  };

  return (
    <Paper 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        mb: 2,
        bgcolor: '#1e1e1e',
        cursor: 'pointer',
        transition: 'transform 0.2s, background-color 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          bgcolor: 'rgba(255,255,255,0.03)'
        }
      }}
      onClick={() => onClick(item)}
    >
      <Tooltip title="Mark Complete">
        <Checkbox 
          icon={<CircleUnchecked />} 
          checkedIcon={<CheckCircle color="success" />}
          onChange={handleCheckboxChange}
          sx={{ mr: 2 }}
        />
      </Tooltip>
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Chip 
            label={isJob ? 'Pipeline' : 'Network'} 
            size="small" 
            color={isJob ? 'primary' : 'warning'} 
            variant="outlined"
            sx={{ height: 20, fontSize: '0.65rem' }}
          />
          {item.date && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 12 }} /> {item.date}
            </Typography>
          )}
        </Box>
        
        <Typography variant="subtitle1" fontWeight="bold" noWrap>
          {item.displayText}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {item.subText}
        </Typography>
      </Box>
    </Paper>
  );
}

export default ActionItemCard;
