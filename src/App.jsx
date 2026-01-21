import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography, AppBar, Toolbar } from '@mui/material';
import theme from './theme';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Conversations from './pages/Conversations';
import Networking from './pages/Networking';
import Todos from './pages/Todos';

const drawerWidth = 240;

function AppContent() {
  const location = useLocation();
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/jobs':
        return 'Jobs';
      case '/conversations':
        return 'Conversations';
      case '/networking':
        return 'Networking';
      case '/todos':
        return 'Todos';
      default:
        return 'JobHub';
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` } }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              {getPageTitle()}
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/networking" element={<Networking />} />
          <Route path="/todos" element={<Todos />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
