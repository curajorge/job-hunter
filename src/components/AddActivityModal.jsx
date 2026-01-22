import { useState } from 'react';
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

const ACTIVITY_TYPES = [
  'Applied',
  'Recruiter Screen',
  'Phone Interview',
  'Technical Interview',
  'Take-home Assignment',
  'On-site / Final Round',
  'Offer Received',
  'Rejected',
  'Withdrew',
  'Follow-up Sent',
  'General Note'
];

function AddActivityModal({ open, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!form.type) {
      setError('Activity type is required');
      return;
    }
    if (!form.date) {
      setError('Date is required');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(form);
      setForm({
        type: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
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
      type: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Log Activity</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            
            <FormControl fullWidth required>
              <InputLabel>Activity Type</InputLabel>
              <Select
                name="type"
                value={form.type}
                onChange={handleChange}
                label="Activity Type"
              >
                {ACTIVITY_TYPES.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              name="date"
              label="Date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
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
              placeholder="What happened? Key takeaways, next steps..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Log Activity'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddActivityModal;
