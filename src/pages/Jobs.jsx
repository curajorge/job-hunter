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

function Jobs() {
  const [jobs, setJobs] = useState(() => {
    const storedJobs = localStorage.getItem('jobs');
    return storedJobs ? JSON.parse(storedJobs) : [];
  });
  const [job, setJob] = useState({ company: '', role: '', date: '', status: '' });
  const [editing, setEditing] = useState(null);
  const [currentJob, setCurrentJob] = useState({ company: '', role: '', date: '', status: '' });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }, [jobs]);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };
  
  const handleCurrentChange = (e) => {
    setCurrentJob({ ...currentJob, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setJobs([...jobs, job]);
    setJob({ company: '', role: '', date: '', status: '' });
  };

  const deleteJob = (index) => {
    const newJobs = [...jobs];
    newJobs.splice(index, 1);
    setJobs(newJobs);
  };

  const editJob = (index) => {
    setEditing(index);
    setCurrentJob(jobs[index]);
    setOpen(true);
  };

  const saveJob = (index) => {
    const newJobs = [...jobs];
    newJobs[index] = currentJob;
    setJobs(newJobs);
    setEditing(null);
    setCurrentJob({ company: '', role: '', date: '', status: '' });
    setOpen(false);
  };


  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Job Applications
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Add New Job
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Company"
            name="company"
            value={job.company}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Role"
            name="role"
            value={job.role}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Application Date"
            name="date"
            type="date"
            value={job.date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <TextField
            label="Status"
            name="status"
            value={job.status}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Add Job
          </Button>
        </form>
      </Paper>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Date Applied</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job, index) => (
              <TableRow key={index}>
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.role}</TableCell>
                <TableCell>{job.date}</TableCell>
                <TableCell>{job.status}</TableCell>
                <TableCell>
                  <IconButton aria-label="edit" onClick={() => editJob(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton aria-label="delete" onClick={() => deleteJob(index)}>
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
            Edit Job
          </Typography>
           <form onSubmit={(e) => { e.preventDefault(); saveJob(editing); }}>
          <TextField
            label="Company"
            name="company"
            value={currentJob.company}
            onChange={handleCurrentChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Role"
            name="role"
            value={currentJob.role}
            onChange={handleCurrentChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Application Date"
            name="date"
            type="date"
            value={currentJob.date}
            onChange={handleCurrentChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <TextField
            label="Status"
            name="status"
            value={currentJob.status}
            onChange={handleCurrentChange}
            fullWidth
            margin="normal"
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

export default Jobs;
