import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Fab,
  Zoom,
  Collapse,
  Avatar,
  Chip,
  Tooltip,
  Alert,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

const API_BASE = '/api';

function AgentChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [agentInfo, setAgentInfo] = useState(null);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Check agent availability on mount
  useEffect(() => {
    const checkAgent = async () => {
      try {
        const res = await fetch(`${API_BASE}/agent/info`);
        const data = await res.json();
        setAgentInfo(data);
        if (!data.available) {
          setError('Agent not available. Check backend setup.');
        }
      } catch (err) {
        setError('Could not connect to agent service.');
      }
    };
    checkAgent();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setSessionId(data.sessionId);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `❌ Error: ${err.message}`, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_BASE}/agent/session/${sessionId}`, { method: 'DELETE' });
      } catch (err) {
        // Ignore
      }
    }
    setMessages([]);
    setSessionId(null);
    setError(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(prev => prev + text);
        inputRef.current?.focus();
      }
    } catch (err) {
      // Clipboard access denied
    }
  };

  const quickActions = [
    { label: 'Pipeline Status', prompt: "What's my pipeline status?" },
    { label: 'Stale Contacts', prompt: 'Who should I follow up with?' },
    { label: 'Parse Job', prompt: 'I have a job posting to add. Here it is:\n\n' },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <Zoom in={!open}>
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <ChatIcon />
        </Fab>
      </Zoom>

      {/* Chat Window */}
      <Collapse in={open}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 420 },
            height: { xs: 'calc(100vh - 100px)', sm: 560 },
            maxHeight: 'calc(100vh - 100px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1001,
            bgcolor: '#1a1a1a',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.dark',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToyIcon />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Job Search Copilot
                </Typography>
                {agentInfo?.available && (
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {agentInfo.name} • {agentInfo.model}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box>
              <Tooltip title="Clear chat">
                <IconButton size="small" onClick={clearChat} sx={{ color: 'white', mr: 0.5 }}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Welcome message */}
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SmartToyIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Hey Jorge! 👋
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  I can help you manage your job search. Try these:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                  {quickActions.map((action) => (
                    <Chip
                      key={action.label}
                      label={action.label}
                      onClick={() => {
                        setInput(action.prompt);
                        inputRef.current?.focus();
                      }}
                      sx={{ cursor: 'pointer' }}
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Message list */}
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 1,
                }}
              >
                {msg.role === 'assistant' && (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <SmartToyIcon fontSize="small" />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 1.5,
                    maxWidth: '80%',
                    bgcolor: msg.role === 'user' ? 'primary.dark' : '#2a2a2a',
                    borderRadius: 2,
                    borderTopLeftRadius: msg.role === 'assistant' ? 0 : 2,
                    borderTopRightRadius: msg.role === 'user' ? 0 : 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: msg.isError ? 'error.light' : 'inherit',
                    }}
                  >
                    {msg.content}
                  </Typography>
                </Paper>
                {msg.role === 'user' && (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#333' }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                )}
              </Box>
            ))}

            {/* Loading indicator */}
            {loading && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  <SmartToyIcon fontSize="small" />
                </Avatar>
                <Paper sx={{ p: 1.5, bgcolor: '#2a2a2a', borderRadius: 2, borderTopLeftRadius: 0 }}>
                  <CircularProgress size={20} />
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Error alert */}
          {error && !loading && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mx: 2, mb: 1 }}>
              {error}
            </Alert>
          )}

          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Paste from clipboard">
                <IconButton size="small" onClick={handlePaste} sx={{ alignSelf: 'flex-end' }}>
                  <ContentPasteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <TextField
                inputRef={inputRef}
                fullWidth
                multiline
                maxRows={4}
                placeholder="Ask me anything about your job search..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || !agentInfo?.available}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#2a2a2a',
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={loading || !input.trim() || !agentInfo?.available}
                sx={{ alignSelf: 'flex-end' }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Collapse>
    </>
  );
}

export default AgentChat;
