import { useState, useEffect } from 'react';
import { useJobContext } from '../store/JobContext';
import {
  Box, Grid, Paper, Typography, TextField, Button, Accordion, AccordionSummary,
  AccordionDetails, Checkbox, IconButton, Select, MenuItem, FormControl, InputLabel,
  Divider, Stack, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ResumePreview from '../components/ResumePreview';

function ResumeStudio() {
  const { resumes, fetchResume, createResume, updateResume, jobs, updateJob } = useJobContext();
  
  const [activeResumeId, setActiveResumeId] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [linkedJobId, setLinkedJobId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with Master or first available if no active selection
  useEffect(() => {
    if (!activeResumeId && resumes.length > 0) {
        // Prefer master, else first
        const master = resumes.find(r => r.is_master) || resumes[0];
        loadResume(master.id);
    }
  }, [resumes]);

  const loadResume = async (id) => {
    const data = await fetchResume(id);
    setResumeData(data.content);
    setResumeName(data.name);
    setActiveResumeId(data.id);
    // Check if this resume is linked to a job
    const job = jobs.find(j => j.resumeVersionId === data.id);
    setLinkedJobId(job ? job.id : '');
  };

  const handleSave = async (asNew = false) => {
    setIsSaving(true);
    try {
      let newId = activeResumeId;
      if (asNew || !activeResumeId) {
        const res = await createResume(resumeName + (asNew ? ' (Copy)' : ''), resumeData);
        newId = res.id;
      } else {
        await updateResume(activeResumeId, resumeName, resumeData);
      }
      
      // Link to job if selected
      if (linkedJobId) {
        await updateJob(linkedJobId, { resumeVersionId: newId });
      }
      
      // Reload to ensure state sync
      if (newId !== activeResumeId) {
          loadResume(newId);
      }
      alert('Saved successfully!');
    } catch (e) {
      alert('Error saving: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (section, index, field, value) => {
    const newData = { ...resumeData };
    if (index !== null) {
      newData[section][index][field] = value;
    } else {
      newData[section] = value;
    }
    setResumeData(newData);
  };

  const toggleBullet = (expIndex, bulletText) => {
     // This is a simplified toggle. In a real app, we'd probably have an 'isActive' flag on the bullet object
     // For now, let's assume we are editing the raw bullets array. 
     // To support "toggle", we might need a separate "master" source vs "current" source.
     // For this implementation, we will just allow editing the text of existing bullets.
  };

  const updateBullet = (expIndex, bulletIndex, value) => {
      const newData = { ...resumeData };
      newData.experience[expIndex].bullets[bulletIndex] = value;
      setResumeData(newData);
  };

  if (!resumeData) return <Box p={4}>Loading...</Box>;

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center', bgcolor: '#1e1e1e' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Version History</InputLabel>
          <Select 
            value={activeResumeId} 
            label="Version History"
            onChange={(e) => loadResume(e.target.value)}
          >
            {resumes.map(r => (
              <MenuItem key={r.id} value={r.id}>
                {r.name} {r.is_master ? '(Master)' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField 
            label="Resume Name"
            size="small"
            value={resumeName}
            onChange={(e) => setResumeName(e.target.value)}
            sx={{ width: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Link to Job</InputLabel>
          <Select 
            value={linkedJobId} 
            label="Link to Job"
            onChange={(e) => setLinkedJobId(e.target.value)}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {jobs.map(j => (
              <MenuItem key={j.id} value={j.id}>{j.role} @ {j.company}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />
        
        <Button 
            variant="outlined" 
            startIcon={<ContentCopyIcon />} 
            onClick={() => handleSave(true)}
            disabled={isSaving}
        >
            Save as New
        </Button>
        <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={() => handleSave(false)}
            disabled={isSaving}
        >
            Save Changes
        </Button>
      </Paper>

      {/* Main Content - Split View */}
      <Grid container spacing={2} sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Editor Pane */}
        <Grid item xs={12} md={5} sx={{ height: '100%', overflowY: 'auto' }}>
            <Stack spacing={2}>
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Header & Summary</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack spacing={2}>
                            <TextField label="Name" fullWidth value={resumeData.name} onChange={e => handleFieldChange('name', null, null, e.target.value)} />
                            <TextField label="Tagline" fullWidth value={resumeData.tagline} onChange={e => handleFieldChange('tagline', null, null, e.target.value)} />
                            <TextField 
                                label="Summary" 
                                fullWidth 
                                multiline 
                                rows={4} 
                                value={resumeData.summary} 
                                onChange={e => handleFieldChange('summary', null, null, e.target.value)} 
                            />
                        </Stack>
                    </AccordionDetails>
                </Accordion>

                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Experience</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {resumeData.experience.map((exp, idx) => (
                            <Box key={idx} sx={{ mb: 3, borderLeft: '2px solid #555', pl: 2 }}>
                                <TextField 
                                    label="Company" 
                                    value={exp.company} 
                                    size="small" 
                                    sx={{ mb: 1, mr: 1 }} 
                                    onChange={(e) => {
                                        const newData = {...resumeData};
                                        newData.experience[idx].company = e.target.value;
                                        setResumeData(newData);
                                    }}
                                />
                                <TextField 
                                    label="Title" 
                                    value={exp.title} 
                                    size="small" 
                                    sx={{ mb: 1 }} 
                                    onChange={(e) => {
                                        const newData = {...resumeData};
                                        newData.experience[idx].title = e.target.value;
                                        setResumeData(newData);
                                    }}
                                />
                                <Typography variant="caption" display="block" sx={{ mb: 1 }}>Bullets</Typography>
                                {exp.bullets.map((bullet, bIdx) => (
                                    <TextField
                                        key={bIdx}
                                        fullWidth
                                        multiline
                                        size="small"
                                        value={bullet}
                                        onChange={(e) => updateBullet(idx, bIdx, e.target.value)}
                                        sx={{ mb: 1 }}
                                    />
                                ))}
                            </Box>
                        ))}
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Skills</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {resumeData.core_skills.map((skill, idx) => (
                            <TextField
                                key={idx}
                                fullWidth
                                size="small"
                                value={skill}
                                onChange={(e) => {
                                    const newData = {...resumeData};
                                    newData.core_skills[idx] = e.target.value;
                                    setResumeData(newData);
                                }}
                                sx={{ mb: 1 }}
                            />
                        ))}
                    </AccordionDetails>
                </Accordion>
            </Stack>
        </Grid>

        {/* Preview Pane */}
        <Grid item xs={12} md={7} sx={{ height: '100%', overflowY: 'auto', bgcolor: '#525659', p: 2 }}>
             <Paper elevation={4} sx={{ width: '8.5in', minHeight: '11in', margin: '0 auto', transform: 'scale(0.9)', transformOrigin: 'top center' }}>
                 <ResumePreview data={resumeData} />
             </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
export default ResumeStudio;
