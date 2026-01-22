import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert
} from '@mui/material';
import { useJobContext } from '../store/JobContext';

function AddCompanyModal({ open, onClose }) {
  const { addCompany } = useJobContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    domain: '',
    website: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!form.name.trim()) {
      setError('Company name is required');
      return;
    }
    
    setLoading(true);
    try {
      await addCompany(form);
      setForm({ name: '', domain: '', website: '', description: '' });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', domain: '', website: '', description: '' });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Company</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TextField
              name="name"
              label="Company Name"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
              autoFocus
            />
            
            <TextField
              name="domain"
              label="Industry / Domain"
              value={form.domain}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., HealthTech, FinTech, Big Tech"
            />
            
            <TextField
              name="website"
              label="Website"
              value={form.website}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., example.com"
            />
            
            <TextField
              name="description"
              label="Description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Brief description of the company..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Company'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddCompanyModal;
