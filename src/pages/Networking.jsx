import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
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

function Networking() {
  const [contacts, setContacts] = useState(() => {
    const storedContacts = localStorage.getItem('contacts');
    return storedContacts ? JSON.parse(storedContacts) : [];
  });
  const [contact, setContact] = useState({ name: '', company: '', email: '', phone: '', notes: '' });
  const [editing, setEditing] = useState(null);
  const [currentContact, setCurrentContact] = useState({ name: '', company: '', email: '', phone: '', notes: '' });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }, [contacts]);

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };
  
  const handleCurrentChange = (e) => {
    setCurrentContact({ ...currentContact, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setContacts([...contacts, contact]);
    setContact({ name: '', company: '', email: '', phone: '', notes: '' });
  };

  const deleteContact = (index) => {
    const newContacts = [...contacts];
    newContacts.splice(index, 1);
    setContacts(newContacts);
  };

  const editContact = (index) => {
    setEditing(index);
    setCurrentContact(contacts[index]);
    setOpen(true);
  };

  const saveContact = (index) => {
    const newContacts = [...contacts];
    newContacts[index] = currentContact;
    setContacts(newContacts);
    setEditing(null);
    setCurrentContact({ name: '', company: '', email: '', phone: '', notes: '' });
    setOpen(false);
  };


  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Networking Contacts
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Add New Contact
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={contact.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Company"
            name="company"
            value={contact.company}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={contact.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone"
            name="phone"
            value={contact.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Notes"
            name="notes"
            value={contact.notes}
            onChange={handleChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <Button type="submit" variant="contained" color="primary">
            Add Contact
          </Button>
        </form>
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((contact, index) => (
              <TableRow key={index}>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.company}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>{contact.notes}</TableCell>
                <TableCell>
                  <IconButton aria-label="edit" onClick={() => editContact(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => deleteContact(index)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Contact
          </Typography>
          <form onSubmit={(e) => { e.preventDefault(); saveContact(editing); }}>
          <TextField
            label="Name"
            name="name"
            value={currentContact.name}
            onChange={handleCurrentChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Company"
            name="company"
            value={currentContact.company}
            onChange={handleCurrentChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={currentContact.email}
            onChange={handleCurrentChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Phone"
            name="phone"
            value={currentContact.phone}
            onChange={handleCurrentChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Notes"
            name="notes"
            value={currentContact.notes}
            onChange={handleCurrentChange}
            fullWidth
            margin="normal"
            multiline
            rows={4}
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

export default Networking;
