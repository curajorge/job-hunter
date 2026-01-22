import { useState } from 'react';
import { useJobContext } from '../store/JobContext';
import { Box, Typography, Grid, Paper, Avatar, Chip, IconButton, Button, CircularProgress, Collapse } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningIcon from '@mui/icons-material/Warning';
import AddContactModal from '../components/AddContactModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ContactDrawer from '../components/ContactDrawer';
import OutreachGoalTracker from '../components/OutreachGoalTracker';
import StaleContactCard from '../components/StaleContactCard';

function Networking() {
  const { contacts, loading, deleteContact, touchContact, getStaleContacts, getTodayOutreachCount } = useJobContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [staleExpanded, setStaleExpanded] = useState(true);
  
  // Drawer state
  const [drawerContact, setDrawerContact] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Delete state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, contact: null });
  const [deleting, setDeleting] = useState(false);

  const buckets = [
    { id: 'Recruiters', title: 'Active Recruiters' },
    { id: 'Hiring Managers', title: 'Decision Makers' },
    { id: 'Former Colleagues', title: 'Advocates & References' },
  ];

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

  const getDaysSinceContact = (lastContact) => {
    if (!lastContact) return null;
    const today = new Date();
    const lastDate = new Date(lastContact);
    return Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  };

  const getStaleColor = (lastContact) => {
    const days = getDaysSinceContact(lastContact);
    if (days === null) return 'error';
    if (days <= 7) return 'success';
    if (days <= 14) return 'warning';
    return 'error';
  };

  const openDeleteDialog = (contact, e) => {
    e.stopPropagation();
    setDeleteDialog({ open: true, contact });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, contact: null });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.contact) return;
    setDeleting(true);
    try {
      await deleteContact(deleteDialog.contact.id);
      closeDeleteDialog();
    } catch (err) {
      console.error('Failed to delete contact:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleContactClick = (contact) => {
    setDrawerContact(contact);
    setDrawerOpen(true);
  };

  const handleReachOut = async (contact) => {
    await touchContact(contact.id);
    if (contact.linkedinUrl) {
      window.open(contact.linkedinUrl, '_blank');
    }
  };

  const handleLinkedIn = (contact, e) => {
    e.stopPropagation();
    if (contact.linkedinUrl) {
      window.open(contact.linkedinUrl, '_blank');
    }
  };

  const handleEmail = (contact, e) => {
    e.stopPropagation();
    if (contact.email) {
      window.open(`mailto:${contact.email}`, '_blank');
    }
  };

  const handlePhone = (contact, e) => {
    e.stopPropagation();
    if (contact.phone) {
      window.open(`tel:${contact.phone}`, '_blank');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const staleContacts = getStaleContacts(7);
  const todayCount = getTodayOutreachCount();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Network Strategy</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Add Contact
        </Button>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Build relationships consistently. Click "Reach Out" to log contact and open their profile.
      </Typography>

      {/* Daily Goal Tracker */}
      <OutreachGoalTracker todayCount={todayCount} />

      {/* Needs Follow-up Section */}
      {staleContacts.length > 0 && (
        <Paper sx={{ mb: 3, bgcolor: '#121212', border: '1px solid #333', overflow: 'hidden' }}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'rgba(255, 152, 0, 0.1)', 
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => setStaleExpanded(!staleExpanded)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="warning" />
              <Typography variant="h6">Needs Follow-up</Typography>
              <Chip label={staleContacts.length} size="small" color="warning" />
            </Box>
            <IconButton size="small">
              {staleExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={staleExpanded}>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {staleContacts.slice(0, 5).map(contact => (
                <StaleContactCard 
                  key={contact.id} 
                  contact={contact} 
                  onReachOut={handleReachOut}
                  onClick={handleContactClick}
                />
              ))}
              {staleContacts.length > 5 && (
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                  +{staleContacts.length - 5} more contacts need follow-up
                </Typography>
              )}
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Bucket Grid */}
      <Grid container spacing={3}>
        {buckets.map((bucket) => (
          <Grid item xs={12} md={4} key={bucket.id}>
            <Paper sx={{ p: 0, height: '100%', bgcolor: '#121212', border: '1px solid #333', overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: '#1e1e1e', borderBottom: '1px solid #333' }}>
                <Typography variant="h6">{bucket.title}</Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {contacts.filter(c => c.bucket === bucket.id).map(contact => (
                  <Paper 
                    key={contact.id} 
                    sx={{ 
                      mb: 2, 
                      p: 2, 
                      bgcolor: '#1e1e1e', 
                      display: 'flex', 
                      alignItems: 'start', 
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#252525' }
                    }}
                    onClick={() => handleContactClick(contact)}
                  >
                    <Avatar sx={{ bgcolor: '#333', mr: 2, width: 40, height: 40 }}>{getInitials(contact.name)}</Avatar>
                    <Box sx={{ flexGrow: 1, pr: 4 }}>
                      <Typography variant="subtitle1" fontWeight="bold">{contact.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{contact.role} @ {contact.company}</Typography>
                      
                      {contact.lastContact && (
                        <Box sx={{ mt: 1, mb: 1 }}>
                          <Chip 
                            icon={<AccessTimeIcon />} 
                            label={contact.lastContact} 
                            size="small" 
                            variant="outlined" 
                            color={getStaleColor(contact.lastContact)}
                            sx={{ fontSize: '0.7rem', height: 24 }}
                          />
                        </Box>
                      )}
                      
                      {contact.notes && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontStyle: 'italic', mb: 1 }}>
                          "{contact.notes}"
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {contact.linkedinUrl && (
                          <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} onClick={(e) => handleLinkedIn(contact, e)}>
                            <LinkedInIcon fontSize="small" color="primary" />
                          </IconButton>
                        )}
                        {contact.email && (
                          <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} onClick={(e) => handleEmail(contact, e)}>
                            <MailOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                        {contact.phone && (
                          <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} onClick={(e) => handlePhone(contact, e)}>
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    
                    <IconButton 
                      size="small"
                      onClick={(e) => openDeleteDialog(contact, e)}
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        opacity: 0.4, 
                        '&:hover': { opacity: 1, color: 'error.main' } 
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ))}
                {contacts.filter(c => c.bucket === bucket.id).length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>No contacts in this bucket yet.</Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Modals & Drawers */}
      <AddContactModal open={modalOpen} onClose={() => setModalOpen(false)} />
      
      <ContactDrawer 
        contact={drawerContact} 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
      
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Contact?"
        message={`Are you sure you want to delete "${deleteDialog.contact?.name}"?`}
        loading={deleting}
      />
    </Box>
  );
}

export default Networking;
