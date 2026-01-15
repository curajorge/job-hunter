import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Job Application Tracker
        </Typography>
        <Button color="inherit" component={Link} to="/">Dashboard</Button>
        <Button color="inherit" component={Link} to="/jobs">Jobs</Button>
        <Button color="inherit" component={Link} to="/conversations">Conversations</Button>
        <Button color="inherit" component={Link} to="/todos">Todos</Button>
        <Button color="inherit" component={Link} to="/networking">Networking</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
