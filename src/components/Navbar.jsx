import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import ForumIcon from '@mui/icons-material/Forum';
import PeopleIcon from '@mui/icons-material/People';
import ChecklistIcon from '@mui/icons-material/Checklist';

const drawerWidth = 240;

function Navbar() {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1e1e1e',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Typography variant="h6" sx={{ p: 2 }}>
        JobHub
      </Typography>
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/jobs">
          <ListItemIcon>
            <WorkIcon />
          </ListItemIcon>
          <ListItemText primary="Jobs" />
        </ListItem>
        <ListItem button component={Link} to="/conversations">
          <ListItemIcon>
            <ForumIcon />
          </ListItemIcon>
          <ListItemText primary="Conversations" />
        </ListItem>
        <ListItem button component={Link} to="/networking">
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Networking" />
        </ListItem>
        <ListItem button component={Link} to="/todos">
          <ListItemIcon>
            <ChecklistIcon />
          </ListItemIcon>
          <ListItemText primary="Todos" />
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Navbar;
