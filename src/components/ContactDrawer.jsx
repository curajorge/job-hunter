import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Button,
  TextField,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { useJobContext } from '../store/JobContext';

const BUCKET_OPTIONS = ['Recruiters', 'Hiring Managers', 'Former Colleagues'];

function ContactDrawer({ contact, open, onClose }) {
  const { updateContact, touchContact, companies } = useJobContext();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  // Reset form when contact changes
  useEffect(() => {
    if (contact) {
      setForm({
        companyId: contact.companyId || '',
        name: contact.name || '',
        role: contact.role || '',
        bucket: contact.bucket || 'Recruiters',
        email: contact.email || '',
        linkedinUrl: contact.linkedinUrl || '',
        phone: contact.phone || '',
        notes: contact.notes || ''
      });
    }
    setEditing(false);
  }, [contact]);

  if (!contact) return null;

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

  const getDaysSinceContact = () => {
    if (!contact.lastContact) return null;
    const today = new Date();
    const lastDate = new Date(contact.lastContact);
    return Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  };

  const getStaleStatus = () => {
    const days = getDaysSinceContact();
    if (days === null) return { color: 'error', label: 'Never contacted' };
    if (days === 0) return { color: 'success', label: 'Contacted today' };
    if (days <= 7) return { color: 'success', label: `${days} day${days > 1 ? 's' : ''} ago` };
    if (days <= 14) return { color: 'warning', label: `${days} days ago` };
    return { color: 'error', label: `${days} days ago - Follow up!` };
  };

  const staleStatus = getStaleStatus();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContact(contact.id, form);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update contact:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      companyId: contact.companyId || '',
      name: contact.name || '',
      role: contact.role || '',
      bucket: contact.bucket || 'Recruiters',
      email: contact.email || '',
      linkedinUrl: contact.linkedinUrl || '',
      phone: contact.phone || '',
      notes: contact.notes || ''
    });
    setEditing(false);
  };

  const handleReachOut = async () => {
    // Mark as contacted
    await touchContact(contact.id);
    // Open LinkedIn if available
    if (contact.linkedinUrl) {
      window.open(contact.linkedinUrl, '_blank');
    }
  };

  const handleLinkedIn = () => {
    if (contact.linkedinUrl) {
      window.open(contact.linkedinUrl, '_blank');
    }
  };

  const handleEmail = () => {
    if (contact.email) {
      window.open(`mailto:${contact.email}`, '_blank');
    }
  };

  const handlePhone = () => {
    if (contact.phone) {
      window.open(`tel:${contact.phone}`, '_blank');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 420 }, bgcolor: '#1e1e1e' }
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: '#333', fontSize: '1.25rem' }}>
              {getInitials(contact.name)}
            </Avatar>
            <Box>
              {editing ? (
                <TextField
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              ) : (
                <Typography variant="h6" fontWeight="bold">{contact.name}</Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {contact.role} @ {contact.company}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Status Badge */}
        <Box sx={{ mb: 3 }}>
          <Chip 
            label={staleStatus.label} 
            color={staleStatus.color} 
            size="small" 
            variant="outlined"
          />
        </Box>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<TouchAppIcon />}
            onClick={handleReachOut}
            size="small"
          >
            Reach Out & Log
          </Button>
          {contact.linkedinUrl && (
            <IconButton onClick={handleLinkedIn} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
              <LinkedInIcon color="primary" />
            </IconButton>
          )}
          {contact.email && (
            <IconButton onClick={handleEmail} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
              <EmailIcon />
            </IconButton>
          )}
          {contact.phone && (
            <IconButton onClick={handlePhone} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
              <PhoneIcon />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ my: 2, borderColor: '#333' }} />

        {/* Edit Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Contact Details</Typography>
          {!editing ? (
            <Button size="small" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
              Edit
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<CancelIcon />} onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          )}
        </Box>

        {/* Details Form */}
        {editing ? (
          <Stack spacing={2}>
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

            <TextField
              name="role"
              label="Role / Title"
              value={form.role}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            <FormControl fullWidth size="small">
              <InputLabel>Bucket</InputLabel>
              <Select
                name="bucket"
                value={form.bucket}
                onChange={handleChange}
                label="Bucket"
              >
                {BUCKET_OPTIONS.map(b => (
                  <MenuItem key={b} value={b}>{b}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            <TextField
              name="linkedinUrl"
              label="LinkedIn URL"
              value={form.linkedinUrl}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            <TextField
              name="phone"
              label="Phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            <TextField
              name="notes"
              label="Notes"
              value={form.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              size="small"
            />
          </Stack>
        ) : (
          <Stack spacing={2}>
            {contact.email && (
              <Box>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography variant="body2">{contact.email}</Typography>
              </Box>
            )}
            {contact.linkedinUrl && (
              <Box>
                <Typography variant="caption" color="text.secondary">LinkedIn</Typography>
                <Typography 
                  variant="body2" 
                  component="a" 
                  href={contact.linkedinUrl} 
                  target="_blank"
                  sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  {contact.linkedinUrl}
                </Typography>
              </Box>
            )}
            {contact.phone && (
              <Box>
                <Typography variant="caption" color="text.secondary">Phone</Typography>
                <Typography variant="body2">{contact.phone}</Typography>
              </Box>
            )}
            {contact.notes && (
              <Box>
                <Typography variant="caption" color="text.secondary">Notes</Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>"{contact.notes}"</Typography>
              </Box>
            )}
            {!contact.email && !contact.linkedinUrl && !contact.phone && !contact.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No additional details. Click Edit to add more info.
              </Typography>
            )}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}

export default ContactDrawer;
