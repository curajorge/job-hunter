import { useState } from 'react';
import { useJobContext } from '../store/JobContext';
import { Grid, Typography, Box, CircularProgress, SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WorkIcon from '@mui/icons-material/Work';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import OutreachGoalTracker from '../components/OutreachGoalTracker';
import MiniPipelineSummary from '../components/MiniPipelineSummary';
import ActionItemCard from '../components/ActionItemCard';
import BucketWidget from '../components/BucketWidget';
import AddActivityModal from '../components/AddActivityModal';
import AddJobModal from '../components/AddJobModal';
import AddContactModal from '../components/AddContactModal';
import ContactDrawer from '../components/ContactDrawer';

function Dashboard() {
  const { jobs, loading, getTodayOutreachCount, getActionItems, addActivity, clearJobAction, touchContact } = useJobContext();
  
  // Modals state
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  
  // Interactive state
  const [selectedActionItem, setSelectedActionItem] = useState(null);
  const [drawerContact, setDrawerContact] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const actionItems = getActionItems();
  const todayCount = getTodayOutreachCount();

  // Handlers
  const handleCompleteAction = (item) => {
    if (item.type === 'job') {
      // For jobs, we open the activity logger to "prove" it was done
      setSelectedActionItem(item);
      setActivityModalOpen(true);
    } else {
      // For contacts, we just touch them immediately
      touchContact(item.id);
    }
  };

  const handleActivitySubmit = async (activityData) => {
    if (selectedActionItem && selectedActionItem.type === 'job') {
        // 1. Log activity
        await addActivity(selectedActionItem.id, activityData);
        // 2. Clear the "Next Action" field
        await clearJobAction(selectedActionItem.id);
    }
    // If it was a generic activity log (from FAB), we assume the user picks the job in a more complex modal,
    // but here we are using a simplified flow bound to the specific item.
  };

  const handleItemClick = (item) => {
      if (item.type === 'contact') {
          setDrawerContact(item);
          setDrawerOpen(true);
      }
      // For jobs, maybe navigate to details? For now, do nothing or expand.
  };

  const fabActions = [
    { icon: <WorkIcon />, name: 'Add Job', onClick: () => setJobModalOpen(true) },
    { icon: <PersonAddIcon />, name: 'Add Contact', onClick: () => setContactModalOpen(true) },
    // { icon: <NoteAddIcon />, name: 'Log Activity', onClick: () => {} }, // Generic log activity requires selecting a job first, skipped for simplicity in this iteration
  ];

  return (
    <Box sx={{ p: 0, pb: 8 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Good Morning, Jorge</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Row 1: Goals & Momentum */}
        <Grid item xs={12} md={8}>
            <OutreachGoalTracker todayCount={todayCount} />
        </Grid>
        <Grid item xs={12} md={4}>
            <MiniPipelineSummary jobs={jobs} />
        </Grid>

        {/* Row 2: The Work */}
        <Grid item xs={12} md={8}>
             <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Action Items</Typography>
             {actionItems.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #444', borderRadius: 2 }}>
                    <Typography color="text.secondary">You're all caught up! Great work.</Typography>
                </Box>
             ) : (
                 actionItems.map(item => (
                     <ActionItemCard 
                        key={`${item.type}-${item.id}`} 
                        item={item} 
                        onComplete={handleCompleteAction}
                        onClick={handleItemClick}
                     />
                 ))
             )}
        </Grid>

        {/* Row 3: Widgets */}
        <Grid item xs={12} md={4}>
             <BucketWidget onContactClick={(contact) => { setDrawerContact(contact); setDrawerOpen(true); }} />
        </Grid>
      </Grid>

      {/* Global Quick Add FAB */}
      <SpeedDial
        ariaLabel="Quick Add"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        icon={<SpeedDialIcon />}
      >
        {fabActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>

      {/* Modals */}
      <AddJobModal open={jobModalOpen} onClose={() => setJobModalOpen(false)} />
      <AddContactModal open={contactModalOpen} onClose={() => setContactModalOpen(false)} />
      
      {/* Contextual Activity Modal for Action Items */}
      <AddActivityModal 
        open={activityModalOpen} 
        onClose={() => setActivityModalOpen(false)}
        onSubmit={handleActivitySubmit}
      />

      {/* Contact Details */}
      <ContactDrawer 
        contact={drawerContact} 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
    </Box>
  );
}

export default Dashboard;
