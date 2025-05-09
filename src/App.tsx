import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Settings as SettingsIcon,
  BarChart,
  Devices,
} from '@mui/icons-material';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './config/firebase';
import DeviceControls from './components/DeviceControls';
import Settings from './components/Settings';
import Reports from './components/Reports';
import getTheme from './theme';

const App: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  // Listen for theme changes
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'userSettings');
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setDarkMode(data.darkMode || false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/devices">
          <ListItemIcon>
            <Devices />
          </ListItemIcon>
          <ListItemText primary="Devices" />
        </ListItem>
        <ListItem button component={Link} to="/reports">
          <ListItemIcon>
            <BarChart />
          </ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItem>
        <ListItem button component={Link} to="/settings">
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={getTheme(darkMode ? 'dark' : 'light')}>
      <Router>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                Home Automation Dashboard
              </Typography>
            </Toolbar>
          </AppBar>
          <Box
            component="nav"
            sx={{ width: { sm: 250 }, flexShrink: { sm: 0 } }}
          >
            <Drawer
              variant={isMobile ? 'temporary' : 'permanent'}
              open={isMobile ? mobileOpen : true}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
              }}
            >
              {drawer}
            </Drawer>
          </Box>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - 250px)` },
              mt: 8,
            }}
          >
            <Routes>
              <Route path="/" element={<DeviceControls />} />
              <Route path="/devices" element={<DeviceControls />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App; 