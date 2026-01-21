import { Link, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const drawerWidth = 240;

function Navbar() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { text: 'Command Center', icon: <DashboardIcon />, path: '/' },
    { text: 'Pipeline', icon: <ViewKanbanIcon />, path: '/jobs' },
    { text: 'Network', icon: <PeopleIcon />, path: '/networking' },
    { text: 'Resume Studio', icon: <DescriptionIcon />, path: '/resume' },
    { text: 'Library', icon: <LibraryBooksIcon />, path: '/library' },
  ];

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid #333'
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Typography variant="h6" sx={{ p: 3, fontWeight: 800, letterSpacing: 1, color: '#90caf9' }}>
        JOB HUNTER
      </Typography>
      <Divider sx={{ borderColor: '#333' }} />
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            sx={{
              bgcolor: isActive(item.path) ? 'rgba(144, 202, 249, 0.08)' : 'transparent',
              borderRight: isActive(item.path) ? '3px solid #90caf9' : '3px solid transparent',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
            }}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? '#90caf9' : '#757575' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                color: isActive(item.path) ? '#fff' : '#bdbdbd'
              }} 
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Navbar;
