import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobContext } from '../store/JobContext';
import { Box, Typography, Grid, Paper, Chip, Button, CircularProgress, IconButton, Menu, MenuItem } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCompanyModal from '../components/AddCompanyModal';
import ConfirmDialog from '../components/ConfirmDialog';

function Companies() {
  const { companies, jobs, contacts, loading, deleteCompany } = useJobContext();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  
  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Helper to count active items per company
  const getCounts = (companyId) => {
    const activeJobs = jobs.filter(j => j.companyId === companyId).length;
    const activeContacts = contacts.filter(c => c.companyId === companyId).length;
    return { activeJobs, activeContacts };
  };

  const handleMenuOpen = (event, company) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedCompany(company);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCompany) return;
    setDeleting(true);
    try {
      await deleteCompany(selectedCompany.id);
      setDeleteDialogOpen(false);
      setSelectedCompany(null);
    } catch (err) {
      console.error('Failed to delete company:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCompany(null);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Target Companies</Typography>
        <Button 
          variant="contained" 
          startIcon={<BusinessIcon />}
          onClick={() => setModalOpen(true)}
        >
          Add Company
        </Button>
      </Box>

      {companies.length === 0 ? (
        <Paper sx={{ p: 4, bgcolor: '#1e1e1e', textAlign: 'center' }}>
          <Typography color="text.secondary">No companies yet. Add your first target company!</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {companies.map((company) => {
            const { activeJobs, activeContacts } = getCounts(company.id);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={company.id}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    bgcolor: '#1e1e1e', 
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                      bgcolor: '#252525'
                    }
                  }}
                  onClick={() => navigate(`/companies/${company.id}`)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">{company.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{company.domain}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, company)}
                        sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <ArrowForwardIcon sx={{ color: 'rgba(255,255,255,0.1)', ml: 0.5 }} />
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 3, minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {company.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {activeJobs > 0 && (
                      <Chip 
                        icon={<WorkIcon sx={{ fontSize: 16 }} />} 
                        label={`${activeJobs} Job${activeJobs > 1 ? 's' : ''}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    )}
                    {activeContacts > 0 && (
                      <Chip 
                        icon={<PeopleIcon sx={{ fontSize: 16 }} />} 
                        label={`${activeContacts} Contact${activeContacts > 1 ? 's' : ''}`} 
                        size="small" 
                        variant="outlined" 
                        sx={{ borderColor: '#666' }}
                      />
                    )}
                    {activeJobs === 0 && activeContacts === 0 && (
                      <Chip label="Prospecting" size="small" variant="outlined" disabled />
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Company
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Company?"
        message={`Are you sure you want to delete "${selectedCompany?.name}"? This will also remove all associated jobs and contacts.`}
        loading={deleting}
      />

      <AddCompanyModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}

export default Companies;
