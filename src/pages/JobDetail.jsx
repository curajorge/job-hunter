import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobContext } from '../store/JobContext';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  CircularProgress,
  IconButton,
  TextField,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import TimelineIcon from '@mui/icons-material/Timeline';
import ActivityTimeline from '../components/ActivityTimeline';
import AddActivityModal from '../components/AddActivityModal';
import AddContactModal from '../components/AddContactModal';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_OPTIONS = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];

const getStatusColor = (status) => {
  const colors = {
    'Wishlist': 'default',
    'Applied': 'primary',
    'Interviewing': 'secondary',
    'Offer': 'success',
    'Rejected': 'error',
    'Withdrawn': 'default'
  };
  return colors[status] || 'default';
};

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchJobDetail, updateJob, deleteJob, addActivity, deleteActivity, deleteContact, companies } = useJobContext();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit mode
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  
  // Modals
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, item: null });
  const [deleting, setDeleting] = useState(false);

  const loadJob = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchJobDetail(id);
      setJob(data);
      setForm({
        companyId: data.companyId || '',
        role: data.role || '',
        status: data.status || 'Wishlist',
        salary: data.salary || '',
        nextAction: data.nextAction || '',
        date: data.date || '',
        description: data.description || '',
        notes: data.notes || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, fetchJobDetail]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateJob(parseInt(id), form);
      await loadJob();
      setEditing(false);
    } catch (err) {
      console.error('Failed to update job:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      companyId: job.companyId || '',
      role: job.role || '',
      status: job.status || 'Wishlist',
      salary: job.salary || '',
      nextAction: job.nextAction || '',
      date: job.date || '',
      description: job.description || '',
      notes: job.notes || ''
    });
    setEditing(false);
  };

  const handleAddActivity = async (activity) => {
    await addActivity(parseInt(id), activity);
    await loadJob();
  };

  const handleDeleteActivity = async (activityId) => {
    await deleteActivity(activityId);
    await loadJob();
  };

  const handleContactAdded = async () => {
    await loadJob();
  };

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
      if (type === 'job') {
        await deleteJob(parseInt(id));
        navigate('/jobs');
      } else if (type === 'contact') {
        await deleteContact(item.id);
        await loadJob();
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
    if (type === 'job') {
      return `Are you sure you want to delete this job? All activities and linked contacts will also be removed.`;
    } else if (type === 'contact') {
      return `Are you sure you want to delete contact "${item?.name}"?`;
    }
    return 'Are you sure?';
  };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/jobs')} sx={{ mb: 2, color: 'text.secondary' }}>
          Back to Pipeline
        </Button>
        <Typography color="error">{error || 'Job not found'}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/jobs')} sx={{ mb: 2, color: 'text.secondary' }}>
        Back to Pipeline
      </Button>

      <Paper sx={{ p: 4, bgcolor: '#1e1e1e', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            {editing ? (
              <Stack spacing={2} sx={{ maxWidth: 500 }}>
                <TextField
                  name="role"
                  label="Role / Title"
                  value={form.role}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Company</InputLabel>
                  <Select
                    name="companyId"
                    value={form.companyId}
                    onChange={handleChange}
                    label="Company"
                  >
                    <MenuItem value=""><em>No company</em></MenuItem>
                    {companies.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  name="salary"
                  label="Salary"
                  value={form.salary}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
                <TextField
                  name="nextAction"
                  label="Next Action"
                  value={form.nextAction}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Stack>
            ) : (
              <>
                <Typography variant="h4" fontWeight="800" gutterBottom>{job.role}</Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {job.company}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mt: 2 }}>
                  <Chip label={job.status} color={getStatusColor(job.status)} />
                  {job.salary && (
                    <Chip icon={<WorkIcon />} label={job.salary} variant="outlined" />
                  )}
                  {job.date && (
                    <Typography variant="body2" color="text.secondary">Target: {job.date}</Typography>
                  )}
                </Box>
                {job.nextAction && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(144, 202, 249, 0.1)', borderRadius: 1, borderLeft: '4px solid #90caf9' }}>
                    <Typography variant="body2" color="text.secondary">NEXT ACTION</Typography>
                    <Typography variant="body1" fontWeight="medium">{job.nextAction}</Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {editing ? (
              <>
                <Button startIcon={<CancelIcon />} onClick={handleCancel} disabled={saving}>Cancel</Button>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <>
                <Button startIcon={<EditIcon />} onClick={() => setEditing(true)}>Edit</Button>
                <Button color="error" startIcon={<DeleteIcon />} onClick={() => openDeleteDialog('job', job)}>Delete</Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column: Job Description & Notes */}
        <Grid item xs={12} md={6}>
          {/* Job Description */}
          <Paper sx={{ p: 3, bgcolor: '#1e1e1e', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <DescriptionIcon color="primary" />
              <Typography variant="h6">Job Description</Typography>
            </Box>
            {editing ? (
              <TextField
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={10}
                placeholder="Paste the full job description here for reference..."
              />
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  whiteSpace: 'pre-wrap', 
                  color: job.description ? 'text.primary' : 'text.secondary',
                  fontStyle: job.description ? 'normal' : 'italic'
                }}
              >
                {job.description || 'No job description saved. Click Edit to add one.'}
              </Typography>
            )}
          </Paper>

          {/* Notes */}
          <Paper sx={{ p: 3, bgcolor: '#1e1e1e' }}>
            <Typography variant="h6" gutterBottom>Notes & Impressions</Typography>
            {editing ? (
              <TextField
                name="notes"
                value={form.notes}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                placeholder="Your thoughts, impressions, why you're interested..."
              />
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  color: job.notes ? 'text.primary' : 'text.secondary',
                  fontStyle: job.notes ? 'normal' : 'italic'
                }}
              >
                {job.notes || 'No notes yet.'}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Timeline & Contacts */}
        <Grid item xs={12} md={6}>
          {/* Activity Timeline */}
          <Paper sx={{ p: 3, bgcolor: '#1e1e1e', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon color="secondary" />
                <Typography variant="h6">Activity Timeline</Typography>
              </Box>
              <Button 
                variant="contained" 
                size="small" 
                startIcon={<AddIcon />}
                onClick={() => setActivityModalOpen(true)}
              >
                Log Activity
              </Button>
            </Box>
            <ActivityTimeline activities={job.activities} onDelete={handleDeleteActivity} />
          </Paper>

          {/* People */}
          <Paper sx={{ p: 3, bgcolor: '#1e1e1e' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="info" />
                <Typography variant="h6">People ({job.contacts?.length || 0})</Typography>
              </Box>
              <IconButton size="small" onClick={() => setContactModalOpen(true)} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                <AddIcon />
              </IconButton>
            </Box>
            
            {job.contacts && job.contacts.length > 0 ? (
              <List disablePadding>
                {job.contacts.map((contact, index) => (
                  <Box key={contact.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton 
                          size="small" 
                          onClick={() => openDeleteDialog('contact', contact)}
                          sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: 'error.main' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                      sx={{ px: 0 }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#333' }}>{getInitials(contact.name)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={contact.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="primary.light">
                              {contact.role}
                            </Typography>
                            {contact.notes && (
                              <Typography component="span" variant="caption" display="block" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                                "{contact.notes}"
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {index < job.contacts.length - 1 && <Divider variant="inset" />}
                  </Box>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No contacts linked to this job yet.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Modals */}
      <AddActivityModal
        open={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        onSubmit={handleAddActivity}
      />
      
      <AddContactModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        preselectedCompanyId={job.companyId}
        preselectedJobId={parseInt(id)}
        onSuccess={handleContactAdded}
      />
      
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title={deleteDialog.type === 'job' ? 'Delete Job?' : 'Delete Contact?'}
        message={getDeleteMessage()}
        loading={deleting}
      />
    </Box>
  );
}

export default JobDetail;
