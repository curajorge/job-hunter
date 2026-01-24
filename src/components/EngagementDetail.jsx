import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { useJobContext } from '../store/JobContext';

const STATUS_OPTIONS = ['active', 'pending', 'no_reply', 'replied', 'converted'];

const STATUS_COLORS = {
  'active': 'default',
  'pending': 'default',
  'no_reply': 'warning',
  'replied': 'success',
  'converted': 'primary'
};

const TYPE_LABELS = {
  'post_comment': 'Post Comment',
  'dm': 'Direct Message',
  'connection_request': 'Connection Request'
};

function EngagementDetail({ threadId, open, onClose, onDelete, onUpdate }) {
  const { fetchEngagementDetail, updateEngagement, addEngagementMessage, deleteEngagementMessage } = useJobContext();
  
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New message form
  const [newMessage, setNewMessage] = useState({ direction: 'outbound', content: '', date: new Date().toISOString().split('T')[0] });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadThread = async () => {
      if (!threadId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEngagementDetail(threadId);
        setThread(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (open && threadId) {
      loadThread();
    }
  }, [threadId, open, fetchEngagementDetail]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateEngagement(threadId, { status: newStatus });
      setThread(prev => ({ ...prev, status: newStatus }));
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.content.trim()) return;
    setSending(true);
    try {
      const msg = await addEngagementMessage(threadId, newMessage);
      setThread(prev => ({
        ...prev,
        messages: [...(prev.messages || []), msg]
      }));
      setNewMessage({ direction: 'outbound', content: '', date: new Date().toISOString().split('T')[0] });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteEngagementMessage(messageId);
      setThread(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== messageId)
      }));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleDeleteThread = () => {
    if (onDelete) onDelete(threadId);
  };

  if (!open) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 450 }, bgcolor: '#1e1e1e' }
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : thread ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #333' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {thread.sourceTitle || TYPE_LABELS[thread.type]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {TYPE_LABELS[thread.type]} • Started {thread.startedAt}
                </Typography>
              </Box>
              <IconButton size="small" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={thread.status}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  {STATUS_OPTIONS.map(s => (
                    <MenuItem key={s} value={s}>
                      <Chip label={s} size="small" color={STATUS_COLORS[s]} sx={{ height: 20 }} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {thread.sourceUrl && (
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<OpenInNewIcon />}
                  onClick={() => window.open(thread.sourceUrl, '_blank')}
                >
                  View Source
                </Button>
              )}

              <Box sx={{ flex: 1 }} />

              <IconButton
                size="small"
                color="error"
                onClick={handleDeleteThread}
                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {thread.messages && thread.messages.length > 0 ? (
              <Stack spacing={2}>
                {thread.messages.map((msg) => (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.direction === 'outbound' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '80%',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: msg.direction === 'outbound' ? 'primary.dark' : 'rgba(255,255,255,0.08)',
                        position: 'relative',
                        '&:hover .delete-btn': { opacity: 1 }
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {msg.date}
                        </Typography>
                        <IconButton
                          className="delete-btn"
                          size="small"
                          onClick={() => handleDeleteMessage(msg.id)}
                          sx={{ opacity: 0, transition: 'opacity 0.2s', ml: 1, p: 0.25 }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">No messages yet</Typography>
              </Box>
            )}
          </Box>

          {/* New Message Form */}
          <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={newMessage.direction}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, direction: e.target.value }))}
                >
                  <MenuItem value="outbound">You</MenuItem>
                  <MenuItem value="inbound">Them</MenuItem>
                </Select>
              </FormControl>
              <TextField
                type="date"
                size="small"
                value={newMessage.date}
                onChange={(e) => setNewMessage(prev => ({ ...prev, date: e.target.value }))}
                sx={{ width: 140 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add message..."
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                multiline
                maxRows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={sending || !newMessage.content.trim()}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <SendIcon fontSize="small" />
              </Button>
            </Box>
          </Box>
        </Box>
      ) : null}
    </Drawer>
  );
}

export default EngagementDetail;
