import { useState, useEffect } from 'react';
import { useJobContext } from '../store/JobContext';
import { Box, Typography, Grid, Paper, Chip, IconButton, Stack, CircularProgress } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkIcon from '@mui/icons-material/Work';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ConfirmDialog from '../components/ConfirmDialog';

// --- Utility for React 18 Strict Mode compatibility ---
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
  const { jobs, updateJobStatus, moveJob, deleteJob, loading } = useJobContext();
  
  // Delete state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, job: null });
  const [deleting, setDeleting] = useState(false);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    updateJobStatus(parseInt(draggableId), destination.droppableId);
  };

  const getJobsByStatus = (status) => jobs.filter(j => j.status === status);

  const openDeleteDialog = (job, e) => {
    e.stopPropagation();
    setDeleteDialog({ open: true, job });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, job: null });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.job) return;
    setDeleting(true);
    try {
      await deleteJob(deleteDialog.job.id);
      closeDeleteDialog();
    } catch (err) {
      console.error('Failed to delete job:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
                        minHeight: 100
                      }}
                    >
                      {getJobsByStatus(stage.id).map((job, index) => (
                        <Draggable key={job.id} draggableId={job.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <Paper 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                              sx={{ 
                                p: 2, 
                                bgcolor: '#1e1e1e', 
                                backgroundImage: 'none',
                                border: '1px solid rgba(255,255,255,0.05)',
                                boxShadow: snapshot.isDragging ? 12 : 1,
                                '&:hover': { borderColor: 'rgba(255,255,255,0.2)' }
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Typography variant="subtitle1" fontWeight="bold">{job.company}</Typography>
                                <IconButton 
                                  size="small"
                                  onClick={(e) => openDeleteDialog(job, e)}
                                  sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: 'error.main' }, ml: 1, mt: -0.5 }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
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
                                 {job.nextAction && (
                                   <Typography variant="caption" color="text.secondary" display="block" sx={{ fontStyle: 'italic' }}>
                                     NEXT: {job.nextAction}
                                   </Typography>
                                 )}
                                 
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Job?"
        message={`Are you sure you want to delete "${deleteDialog.job?.role}" at ${deleteDialog.job?.company}?`}
        loading={deleting}
      />
    </Box>
  );
}

export default Jobs;
