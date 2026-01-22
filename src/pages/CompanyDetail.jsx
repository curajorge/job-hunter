import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobContext } from '../store/JobContext';
import { Box, Typography, Grid, Paper, Button, Chip, Divider, IconButton, List, ListItem, ListItemText, ListItemAvatar, Avatar, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LanguageIcon from '@mui/icons-material/Language';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import AddJobModal from '../components/AddJobModal';
import AddContactModal from '../components/AddContactModal';
import ConfirmDialog from '../components/ConfirmDialog';

function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCompanyDeepView, loading, deleteCompany, deleteJob, deleteContact } = useJobContext();
  
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  
  // Delete state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, item: null });
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const data = getCompanyDeepView(id);

  if (!data) {
    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/companies')} 
          sx={{ mb: 2, color: 'text.secondary' }}
        >
          Back to Companies
        </Button>
        <Typography>Company not found</Typography>
      </Box>
    );
  }

  const openDeleteDialog = (type, item) => {
    setDeleteDialog({ open: true, type, item });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, type: null, item: null });
  };

  const handleDeleteConfirm = async () => {
    const { type, item } = deleteDialog;
    setDeleting(true);
    try {
      if (type === 'company') {
        await deleteCompany(item.id);
        navigate('/companies');
      } else if (type === 'job') {
        await deleteJob(item.id);
      } else if (type === 'contact') {
        await deleteContact(item.id);
      }
      closeDeleteDialog();
    } catch (err) {
      console.error(`Failed to delete ${type}:`, err);
    } finally {
      setDeleting(false);
    }
  };

  const getDeleteMessage = () => {
    const { type, item } = deleteDialog;
    if (type === 'company') {
      return `Are you sure you want to delete "${item?.name}"? This will also remove all associated jobs and contacts.`;
    } else if (type === 'job') {
      return `Are you sure you want to delete the job "${item?.role}"?`;
    } else if (type === 'contact') {
      return `Are you sure you want to delete contact "${item?.name}"?`;
    }
    return 'Are you sure you want to delete this item?';
  };

  return (
    <Box>
      {/* Header */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/companies')} 
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Companies
      </Button>

      <Paper sx={{ p: 4, bgcolor: '#1e1e1e', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box>
            <Typography variant="h3" fontWeight="800" gutterBottom>{data.name}</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip label={data.domain} color="primary" />
              {data.website && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                  <LanguageIcon fontSize="small" />
                  <Typography 
                    component="a" 
                    href={`https://${data.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {data.website}
                  </Typography>
                </Box>
              )}
            </Box>
            <Typography sx={{ mt: 2, maxWidth: '600px', color: 'text.secondary' }}>
              {data.description}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<AddIcon />}>Log Activity</Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => openDeleteDialog('company', data)}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column: Jobs */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Active Opportunities ({data.jobs.length})</Typography>
            <IconButton 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
              onClick={() => setJobModalOpen(true)}
            >
              <AddIcon />
            </IconButton>
          </Box>
          
          {data.jobs.length === 0 ? (
             <Paper sx={{ p: 3, bgcolor: '#1e1e1e', borderStyle: 'dashed', borderColor: '#444' }}>
               <Typography color="text.secondary" align="center">No active jobs tracked. Click + to add one.</Typography>
             </Paper>
          ) : (
            data.jobs.map(job => (
              <Paper key={job.id} sx={{ p: 3, bgcolor: '#1e1e1e', mb: 2, borderLeft: '4px solid #90caf9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Typography variant="h6">{job.role}</Typography>
                    {job.salary && (
                      <Typography variant="body2" color="success.light" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WorkIcon fontSize="inherit" /> {job.salary}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={job.status} size="small" color={job.status === 'Offer' ? 'success' : 'default'} />
                    <IconButton 
                      size="small" 
                      onClick={() => openDeleteDialog('job', job)}
                      sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                {job.nextAction && (
                  <>
                    <Divider sx={{ my: 2, opacity: 0.1 }} />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Next Action:</strong> {job.nextAction}
                    </Typography>
                  </>
                )}
              </Paper>
            ))
          )}
        </Grid>

        {/* Right Column: People */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">Key Contacts ({data.people.length})</Typography>
            <IconButton 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
              onClick={() => setContactModalOpen(true)}
            >
              <AddIcon />
            </IconButton>
          </Box>

          <Paper sx={{ bgcolor: '#1e1e1e' }}>
            <List>
              {data.people.map((person, index) => (
                <Box key={person.id}>
                  <ListItem 
                    alignItems="flex-start"
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={() => openDeleteDialog('contact', person)}
                        sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#333' }}><PersonIcon /></Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={person.name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="primary.light" display="block">
                            {person.role}
                          </Typography>
                          {person.notes}
                        </>
                      }
                    />
                  </ListItem>
                  {index < data.people.length - 1 && <Divider component="li" variant="inset" />}
                </Box>
              ))}
              {data.people.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No contacts added yet. Click + to add one.</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Modals */}
      <AddJobModal 
        open={jobModalOpen} 
        onClose={() => setJobModalOpen(false)} 
        preselectedCompanyId={id} 
      />
      <AddContactModal 
        open={contactModalOpen} 
        onClose={() => setContactModalOpen(false)} 
        preselectedCompanyId={id} 
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteDialog.type?.charAt(0).toUpperCase()}${deleteDialog.type?.slice(1) || ''}?`}
        message={getDeleteMessage()}
        loading={deleting}
      />
    </Box>
  );
}

export default CompanyDetail;
