import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Paper,
  IconButton,
  Modal,
  Box
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function Conversations() {
  const [conversations, setConversations] = useState(() => {
    const storedConversations = localStorage.getItem('conversations');
    return storedConversations ? JSON.parse(storedConversations) : [];
  });
  const [conversation, setConversation] = useState({ contact: '', date: '', notes: '' });
  const [editing, setEditing] = useState(null);
  const [currentConversation, setCurrentConversation] = useState({ contact: '', date: '', notes: '' });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const handleChange = (e) => {
    setConversation({ ...conversation, [e.target.name]: e.target.value });
  };
  
  const handleCurrentChange = (e) => {
    setCurrentConversation({ ...currentConversation, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConversations([...conversations, conversation]);
    setConversation({ contact: '', date: '', notes: '' });
  };

  const deleteConversation = (index) => {
    const newConversations = [...conversations];
    newConversations.splice(index, 1);
    setConversations(newConversations);
  };

  const editConversation = (index) => {
    setEditing(index);
    setCurrentConversation(conversations[index]);
    setOpen(true);
  };

  const saveConversation = (index) => {
    const newConversations = [...conversations];
    newConversations[index] = currentConversation;
    setConversations(newConversations);
    setEditing(null);
    setCurrentConversation({ contact: '', date: '', notes: '' });
    setOpen(false);
  };


  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Conversations
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Add New Conversation
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Contact Name"
            name="contact"
            value={conversation.contact}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Date"
            name="date"
            type="date"
            value={conversation.date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <TextField
            label="Notes"
            name="notes"
            value={conversation.notes}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Add Conversation
          </Button>
        </form>
      </Paper>
      <List>
        {conversations.map((convo, index) => (
          <ListItem key={index} sx={{ border: '1px solid #ddd', mb: 1 }} secondaryAction={
            <>
              <IconButton edge="end" aria-label="edit" onClick={() => editConversation(index)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => deleteConversation(index)}>
                <DeleteIcon />
              </IconButton>
            </>
          }>
            <ListItemText 
              primary={`Contact: ${convo.contact}`}
              secondary={`Date: ${convo.date}`}
            />
            <ListItemText primary={`Notes: ${convo.notes}`} />
          </ListItem>
        ))}
      </List>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Conversation
          </Typography>
          <form onSubmit={(e) => { e.preventDefault(); saveConversation(editing); }}>
          <TextField
            label="Contact Name"
            name="contact"
            value={currentConversation.contact}
            onChange={handleCurrentChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Date"
            name="date"
            type="date"
            value={currentConversation.date}
            onChange={handleCurrentChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <TextField
            label="Notes"
            name="notes"
            value={currentConversation.notes}
            onChange={handleCurrentChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </form>
        </Box>
      </Modal>
    </Container>
  );
}

export default Conversations;
