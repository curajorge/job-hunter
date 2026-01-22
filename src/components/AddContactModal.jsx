import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useJobContext } from '../store/JobContext';

const BUCKET_OPTIONS = ['Recruiters', 'Hiring Managers', 'Former Colleagues'];

function AddContactModal({ open, onClose, preselectedCompanyId = null, preselectedJobId = null, onSuccess = null }) {
  const { addContact, companies } = useJobContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    companyId: '',
    jobId: null,
    name: '',
    role: '',
    bucket: 'Recruiters',
    email: '',
    linkedinUrl: '',
    phone: '',
    lastContact: '',
    notes: ''
  });

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      companyId: preselectedCompanyId || '',
      jobId: preselectedJobId || null
    }));
  }, [preselectedCompanyId, preselectedJobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!form.name.trim()) {
      setError('Contact name is required');
      return;
    }
    
    setLoading(true);
    try {
      await addContact(form);
      setForm({
        companyId: preselectedCompanyId || '',
        jobId: preselectedJobId || null,
        name: '',
        role: '',
        bucket: 'Recruiters',
        email: '',
        linkedinUrl: '',
        phone: '',
        lastContact: '',
        notes: ''
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      companyId: preselectedCompanyId || '',
      jobId: preselectedJobId || null,
      name: '',
      role: '',
      bucket: 'Recruiters',
      email: '',
      linkedinUrl: '',
      phone: '',
      lastContact: '',
      notes: ''
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Contact</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <FormControl fullWidth>
              <InputLabel>Company</InputLabel>
              <Select
                name="companyId"
                value={form.companyId}
                onChange={handleChange}
                label="Company"
                disabled={!!preselectedCompanyId}
              >
                <MenuItem value=""><em>No company</em></MenuItem>
                {companies.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              name="name"
              label="Contact Name"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
              autoFocus={!preselectedCompanyId}
              placeholder="e.g., John Smith"
            />
            
            <TextField
              name="role"
              label="Role / Title"
              value={form.role}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., Recruiter, Engineering Manager"
            />
            
            <FormControl fullWidth>
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
              placeholder="e.g., john@company.com"
            />

            <TextField
              name="linkedinUrl"
              label="LinkedIn URL"
              value={form.linkedinUrl}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., https://linkedin.com/in/johnsmith"
            />

            <TextField
              name="phone"
              label="Phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., 555-123-4567"
            />
            
            <TextField
              name="lastContact"
              label="Last Contact Date"
              type="date"
              value={form.lastContact}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              name="notes"
              label="Notes"
              value={form.notes}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Notes about this contact..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Contact'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddContactModal;
