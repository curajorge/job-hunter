import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Toolbar } from '@mui/material';
import theme from './theme';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Networking from './pages/Networking';
import ResumeStudio from './pages/ResumeStudio';
import Library from './pages/Library';
import { JobProvider } from './store/JobContext';

const drawerWidth = 240;

function AppContent() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh' }}
      >
        <Toolbar sx={{ display: { sm: 'none' } }} /> 
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/networking" element={<Networking />} />
          <Route path="/resume" element={<ResumeStudio />} />
          <Route path="/library" element={<Library />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <JobProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </JobProvider>
    </ThemeProvider>
  );
}

export default App;
