import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Slider,
  FormControlLabel,
  Divider,
  useTheme,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Settings {
  darkMode: boolean;
  notifications: boolean;
  autoLock: boolean;
  temperatureUnit: 'C' | 'F';
  brightness: number;
}

const Settings: React.FC = () => {
  const theme = useTheme();
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    notifications: true,
    autoLock: true,
    temperatureUnit: 'C',
    brightness: 80,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Load settings from Firebase
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'userSettings');
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as Settings);
      } else {
        // Initialize settings if they don't exist
        setDoc(settingsRef, settings);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSettingChange = async (setting: keyof Settings, value: any) => {
    try {
      const settingsRef = doc(db, 'settings', 'userSettings');
      const newSettings = {
        ...settings,
        [setting]: value
      };
      
      await updateDoc(settingsRef, {
        [setting]: value
      });

      setSettings(newSettings);
      setNotificationMessage('Settings updated successfully');
      setShowNotification(true);

      // Apply dark mode if changed
      if (setting === 'darkMode') {
        document.body.style.backgroundColor = value ? '#121212' : '#f5f5f5';
      }

      // Apply brightness if changed
      if (setting === 'brightness') {
        document.documentElement.style.filter = `brightness(${value}%)`;
      }

      // Handle auto-lock setting
      if (setting === 'autoLock') {
        const devicesRef = doc(db, 'devices', 'status');
        if (value) {
          // Enable auto-lock for all doors
          await updateDoc(devicesRef, {
            'mainGate.autoLock': true,
            'balconyDoor.autoLock': true
          });
        } else {
          // Disable auto-lock for all doors
          await updateDoc(devicesRef, {
            'mainGate.autoLock': false,
            'balconyDoor.autoLock': false
          });
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setNotificationMessage('Error updating settings');
      setShowNotification(true);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Appearance
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  />
                }
                label="Dark Mode"
              />
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>Brightness</Typography>
                <Slider
                  value={settings.brightness}
                  onChange={(_, value) => handleSettingChange('brightness', value)}
                  aria-labelledby="brightness-slider"
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  />
                }
                label="Enable Notifications"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Security
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoLock}
                    onChange={(e) => handleSettingChange('autoLock', e.target.checked)}
                  />
                }
                label="Auto Lock Doors"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" gutterBottom>
                Units
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Temperature Unit</InputLabel>
                <Select
                  value={settings.temperatureUnit}
                  label="Temperature Unit"
                  onChange={(e) => handleSettingChange('temperatureUnit', e.target.value)}
                >
                  <MenuItem value="C">Celsius (°C)</MenuItem>
                  <MenuItem value="F">Fahrenheit (°F)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%' }}>
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 