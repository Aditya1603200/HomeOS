import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
  Tooltip,
  Slider,
  Paper,
} from '@mui/material';
import {
  Lightbulb,
  DoorFront,
  Thermostat,
  WaterDrop,
  Garage,
  Balcony,
  Kitchen,
  Home,
  MeetingRoom,
} from '@mui/icons-material';
import { doc, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { logActivity } from '../services/activityLogger';
import { useAuth } from '../contexts/AuthContext';

interface Device {
  id: string;
  name: string;
  type: 'light' | 'door' | 'irrigation';
  status: boolean;
  brightness?: number;
  location: string;
  lastChanged?: Date;
}

const DeviceControls: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser } = useAuth();

  // Initialize devices in Firebase if they don't exist
  useEffect(() => {
    const initializeDevices = async () => {
      const devicesRef = doc(db, 'devices', 'status');
      const initialDevices = {
        hallLight: { 
          name: 'Hall Light',
          type: 'light',
          status: false, 
          brightness: 100, 
          location: 'Hall',
          lastChanged: new Date() 
        },
        kitchenLight: { 
          name: 'Kitchen Light',
          type: 'light',
          status: false, 
          brightness: 100, 
          location: 'Kitchen',
          lastChanged: new Date() 
        },
        mainGate: { 
          name: 'Main Gate',
          type: 'door',
          status: false, 
          isLocked: true,
          autoLock: false,
          location: 'Entrance',
          lastChanged: new Date() 
        },
        balconyDoor: { 
          name: 'Balcony Door',
          type: 'door',
          status: false, 
          isLocked: true,
          autoLock: false,
          location: 'Balcony',
          lastChanged: new Date() 
        },
        irrigationSystem: { 
          name: 'Irrigation System',
          type: 'irrigation',
          status: false, 
          moistureLevel: 0,
          schedule: {
            startTime: '06:00',
            endTime: '07:00',
            days: [1, 2, 3, 4, 5, 6, 7]
          },
          location: 'Backyard',
          lastChanged: new Date() 
        }
      };

      try {
        const docSnap = await onSnapshot(devicesRef, (doc) => {
          if (!doc.exists()) {
            setDoc(devicesRef, initialDevices);
          }
        });
        return () => docSnap();
      } catch (error) {
        console.error('Error initializing devices:', error);
      }
    };

    initializeDevices();
  }, []);

  // Listen for device updates
  useEffect(() => {
    const devicesRef = doc(db, 'devices', 'status');
    const unsubscribe = onSnapshot(devicesRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setDevices([
          { id: 'hallLight', name: 'Hall Light', type: 'light', status: data.hallLight?.status || false, brightness: data.hallLight?.brightness || 100, location: 'Hall', lastChanged: data.hallLight?.lastChanged?.toDate() },
          { id: 'kitchenLight', name: 'Kitchen Light', type: 'light', status: data.kitchenLight?.status || false, brightness: data.kitchenLight?.brightness || 100, location: 'Kitchen', lastChanged: data.kitchenLight?.lastChanged?.toDate() },
          { id: 'garageLight', name: 'Garage Light', type: 'light', status: data.garageLight?.status || false, brightness: data.garageLight?.brightness || 100, location: 'Garage', lastChanged: data.garageLight?.lastChanged?.toDate() },
          { id: 'bedroomLight', name: 'Bedroom Light', type: 'light', status: data.bedroomLight?.status || false, brightness: data.bedroomLight?.brightness || 100, location: 'Bedroom', lastChanged: data.bedroomLight?.lastChanged?.toDate() },
          { id: 'mainGate', name: 'Main Gate', type: 'door', status: data.mainGate?.status || false, location: 'Entrance', lastChanged: data.mainGate?.lastChanged?.toDate() },
          { id: 'balconyDoor', name: 'Balcony Door', type: 'door', status: data.balconyDoor?.status || false, location: 'Balcony', lastChanged: data.balconyDoor?.lastChanged?.toDate() },
          { id: 'irrigationSystem', name: 'Irrigation System', type: 'irrigation', status: data.irrigationSystem?.status || false, location: 'Backyard', lastChanged: data.irrigationSystem?.lastChanged?.toDate() },
        ]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggle = async (deviceId: string) => {
    try {
      const deviceRef = doc(db, 'devices', 'status');
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        const previousState = device.type === 'light' 
          ? { status: device.status, brightness: device.brightness }
          : { status: device.status };
        const newState = device.type === 'light'
          ? { status: !device.status, brightness: device.brightness }
          : { status: !device.status };
        
        const updateData = {
          [`${deviceId}.status`]: !device.status,
          [`${deviceId}.lastChanged`]: new Date()
        };
        
        await updateDoc(deviceRef, updateData);
        
        // Log the activity
        await logActivity({
          deviceId,
          deviceName: device.name,
          action: 'toggle',
          previousState,
          newState,
          userId: currentUser?.uid || 'anonymous'
        });
      }
    } catch (error) {
      console.error('Error updating device status:', error);
    }
  };

  const handleBrightnessChange = async (deviceId: string, brightness: number) => {
    try {
      const deviceRef = doc(db, 'devices', 'status');
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        const previousState = { status: device.status, brightness: device.brightness };
        const newState = { status: device.status, brightness };
        
        await updateDoc(deviceRef, {
          [`${deviceId}.brightness`]: brightness,
          [`${deviceId}.lastChanged`]: new Date()
        });
        
        // Log the activity
        await logActivity({
          deviceId,
          deviceName: device.name,
          action: 'brightness_change',
          previousState,
          newState,
          userId: currentUser?.uid || 'anonymous'
        });
      }
    } catch (error) {
      console.error('Error updating brightness:', error);
    }
  };

  const getDeviceIcon = (type: string, location: string) => {
    switch (location) {
      case 'Hall':
        return <Home />;
      case 'Kitchen':
        return <Kitchen />;
      case 'Garage':
        return <Garage />;
      case 'Bedroom':
        return <MeetingRoom />;
      case 'Balcony':
        return <Balcony />;
      case 'Backyard':
        return <WaterDrop />;
      default:
        return <Lightbulb />;
    }
  };

  const getDeviceColor = (type: string, status: boolean) => {
    if (!status) return theme.palette.grey[500];
    switch (type) {
      case 'light':
        return theme.palette.warning.main;
      case 'door':
        return theme.palette.success.main;
      case 'irrigation':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  if (devices.length === 0) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Device Controls
      </Typography>
      <Grid container spacing={3}>
        {devices.map((device) => (
          <Grid item xs={12} sm={6} md={4} key={device.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <motion.div
                        animate={{
                          scale: device.status ? 1.1 : 1,
                          color: getDeviceColor(device.type, device.status),
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {getDeviceIcon(device.type, device.location)}
                      </motion.div>
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {device.name}
                      </Typography>
                    </Box>
                    <Switch
                      checked={device.status}
                      onChange={() => handleToggle(device.id)}
                      color="primary"
                    />
                  </Box>
                  <AnimatePresence>
                    {device.status && device.type === 'light' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Brightness
                          </Typography>
                          <Slider
                            value={device.brightness || 100}
                            onChange={(_, value) => handleBrightnessChange(device.id, value as number)}
                            aria-labelledby="brightness-slider"
                            valueLabelDisplay="auto"
                            min={0}
                            max={100}
                          />
                        </Box>
                      </motion.div>
                    )}
                    {device.status && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: theme.palette.background.default,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Status: {device.status ? 'Active' : 'Inactive'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Location: {device.location}
                          </Typography>
                          {device.lastChanged && (
                            <Typography variant="body2" color="text.secondary">
                              Last Changed: {format(device.lastChanged, 'PPpp')}
                            </Typography>
                          )}
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DeviceControls; 