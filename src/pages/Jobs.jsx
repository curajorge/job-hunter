import { useState, useEffect } from 'react';
import { useJobContext } from '../store/JobContext';
import { Box, Typography, Grid, Paper, Chip, IconButton, Stack } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkIcon from '@mui/icons-material/Work';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// --- Utility for React 18 Strict Mode compatibility ---
// This is required because React 18 Strict Mode invokes effects twice, 
// which breaks the initialization logic of some DnD libraries.
export const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
};

// --- Configuration ---
const stages = [
  { id: 'Wishlist', color: '#bdbdbd', title: 'Wishlist' },
  { id: 'Applied', color: '#90caf9', title: 'Applied' },
  { id: 'Interviewing', color: '#ce93d8', title: 'Interviewing' },
  { id: 'Offer', color: '#66bb6a', title: 'Offer' }
];

function Jobs() {
  const { jobs, updateJobStatus, moveJob } = useJobContext();

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list or in the same place
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Update status in context
    // The draggableId is expected to be the job ID string
    updateJobStatus(parseInt(draggableId), destination.droppableId);
  };

  // Helper to filter jobs for rendering
  const getJobsByStatus = (status) => jobs.filter(j => j.status === status);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Pipeline Board</Typography>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          {stages.map((stage) => (
            <Grid item xs={12} md={3} key={stage.id}>
              <Box sx={{ 
                p: 2, 
                bgcolor: 'rgba(255,255,255,0.03)', 
                borderRadius: 2, 
                height: '100%',
                minHeight: '500px',
                borderTop: `4px solid ${stage.color}`,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, opacity: 0.9 }}>
                    {stage.title}
                  </Typography>
                  <Chip 
                    label={getJobsByStatus(stage.id).length} 
                    size="small" 
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', fontWeight: 'bold' }} 
                  />
                </Box>

                <StrictModeDroppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <Stack 
                      spacing={2} 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      sx={{ 
                        flexGrow: 1, 
                        transition: 'background-color 0.2s ease',
                        bgcolor: snapshot.isDraggingOver ? 'rgba(255,255,255,0.02)' : 'transparent',
                        borderRadius: 1,
                        p: 1,
                        minHeight: 100 // Ensure empty columns are droppable
                      }}
                    >
                      {getJobsByStatus(stage.id).map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <Paper 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              // Important: Apply the style directly to the style prop to allow the library to control positioning
                              style={provided.draggableProps.style}
                              sx={{ 
                                p: 2, 
                                bgcolor: '#1e1e1e', 
                                backgroundImage: 'none',
                                border: '1px solid rgba(255,255,255,0.05)',
                                boxShadow: snapshot.isDragging ? 12 : 1,
                                // We use a simpler hover effect that doesn't conflict with DnD transforms
                                '&:hover': { borderColor: 'rgba(255,255,255,0.2)' }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Typography variant="subtitle1" fontWeight="bold">{job.company}</Typography>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                 <WorkIcon sx={{ fontSize: 14, mr: 0.5 }} /> {job.role}
                              </Typography>
                              {job.salary && (
                                 <Typography variant="body2" color="success.light" sx={{ mb: 1, display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
                                   <MonetizationOnIcon sx={{ fontSize: 14, mr: 0.5 }} /> {job.salary}
                                 </Typography>
                              )}
                              
                              <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                 <Typography variant="caption" color="text.secondary" display="block" sx={{ fontStyle: 'italic' }}>
                                   NEXT: {job.nextAction}
                                 </Typography>
                                 
                                 {/* Manual controls for accessibility or if drag fails */}
                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, opacity: 0.4, '&:hover': { opacity: 1 } }}>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => moveJob(job.id, 'prev')} 
                                      disabled={stage.id === 'Wishlist'}
                                    >
                                      <ArrowBackIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => moveJob(job.id, 'next')}
                                      disabled={stage.id === 'Offer'}
                                    >
                                      <ArrowForwardIcon fontSize="small" />
                                    </IconButton>
                                 </Box>
                              </Box>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Stack>
                  )}
                </StrictModeDroppable>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
    </Box>
  );
}

export default Jobs;
