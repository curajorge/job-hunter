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

const STATUS_OPTIONS = ['Wishlist', 'Applied', 'Interviewing', 'Offer'];

function AddJobModal({ open, onClose, preselectedCompanyId = null }) {
  const { addJob, companies } = useJobContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    companyId: '',
    role: '',
    status: 'Wishlist',
    salary: '',
    nextAction: '',
    date: ''
  });

  // Update companyId when preselectedCompanyId changes
  useEffect(() => {
    if (preselectedCompanyId) {
      setForm(prev => ({ ...prev, companyId: preselectedCompanyId }));
    }
  }, [preselectedCompanyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!form.role.trim()) {
      setError('Job role is required');
      return;
    }
    
    setLoading(true);
    try {
      await addJob(form);
      setForm({
        companyId: preselectedCompanyId || '',
        role: '',
        status: 'Wishlist',
        salary: '',
        nextAction: '',
        date: ''
      });
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
      role: '',
      status: 'Wishlist',
      salary: '',
      nextAction: '',
      date: ''
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Job</DialogTitle>
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
              name="role"
              label="Job Role / Title"
              value={form.role}
              onChange={handleChange}
              required
              fullWidth
              autoFocus={!preselectedCompanyId}
              placeholder="e.g., Senior Software Engineer"
            />
            
            <FormControl fullWidth>
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
              label="Salary Range"
              value={form.salary}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., 180k-220k"
            />
            
            <TextField
              name="nextAction"
              label="Next Action"
              value={form.nextAction}
              onChange={handleChange}
              fullWidth
              placeholder="e.g., Prepare for system design interview"
            />
            
            <TextField
              name="date"
              label="Target Date"
              type="date"
              value={form.date}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Job'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddJobModal;
