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
  MenuItem,
  Collapse
} from '@mui/material';
import { useJobContext } from '../store/JobContext';

const ENGAGEMENT_TYPES = [
  { value: 'post_comment', label: 'Post Comment', icon: '💬' },
  { value: 'dm', label: 'Direct Message', icon: '✉️' },
  { value: 'connection_request', label: 'Connection Request', icon: '🤝' }
];

function AddEngagementModal({ open, onClose, contactId, onSuccess }) {
  const { createEngagement } = useJobContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    type: 'dm',
    sourceUrl: '',
    sourceTitle: '',
    startedAt: new Date().toISOString().split('T')[0],
    messageContent: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.messageContent.trim()) {
      setError('Your message is required');
      return;
    }

    setLoading(true);
    try {
      await createEngagement(contactId, {
        type: form.type,
        sourceUrl: form.sourceUrl || null,
        sourceTitle: form.sourceTitle || null,
        startedAt: form.startedAt,
        firstMessage: {
          direction: 'outbound',
          content: form.messageContent,
          date: form.startedAt
        }
      });
      
      // Reset form
      setForm({
        type: 'dm',
        sourceUrl: '',
        sourceTitle: '',
        startedAt: new Date().toISOString().split('T')[0],
        messageContent: ''
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
      type: 'dm',
      sourceUrl: '',
      sourceTitle: '',
      startedAt: new Date().toISOString().split('T')[0],
      messageContent: ''
    });
    setError(null);
    onClose();
  };

  const showSourceFields = form.type === 'post_comment';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Log LinkedIn Engagement</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <FormControl fullWidth required>
              <InputLabel>Engagement Type</InputLabel>
              <Select
                name="type"
                value={form.type}
                onChange={handleChange}
                label="Engagement Type"
              >
                {ENGAGEMENT_TYPES.map(t => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Collapse in={showSourceFields}>
              <Stack spacing={2}>
                <TextField
                  name="sourceUrl"
                  label="Post URL"
                  value={form.sourceUrl}
                  onChange={handleChange}
                  fullWidth
                  placeholder="https://linkedin.com/posts/..."
                  helperText="Link to the LinkedIn post you commented on"
                />
                <TextField
                  name="sourceTitle"
                  label="Post Description (optional)"
                  value={form.sourceTitle}
                  onChange={handleChange}
                  fullWidth
                  placeholder="e.g., Their post about AI in healthcare"
                />
              </Stack>
            </Collapse>

            <TextField
              name="startedAt"
              label="Date"
              type="date"
              value={form.startedAt}
              onChange={handleChange}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              name="messageContent"
              label="Your Message"
              value={form.messageContent}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={4}
              placeholder="What did you say? Paste or summarize your outreach..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Log Engagement'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddEngagementModal;
