import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Conversations from './pages/Conversations';
import Networking from './pages/Networking';
import Todos from './pages/Todos';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/networking" element={<Networking />} />
          <Route path="/todos" element={<Todos />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
