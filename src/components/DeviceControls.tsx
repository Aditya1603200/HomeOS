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
import { db } from '../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface Device {
  id: string;
  name: string;
  type: 'light' | 'door' | 'irrigation';
  status: boolean;
  brightness?: number;
  location: string;
}

const DeviceControls: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Initialize devices in Firebase if they don't exist
  useEffect(() => {
    const initializeDevices = async () => {
      const devicesRef = doc(db, 'devices', 'status');
      const initialDevices = {
        hallLight: { status: false, brightness: 100 },
        kitchenLight: { status: false, brightness: 100 },
        garageLight: { status: false, brightness: 100 },
        bedroomLight: { status: false, brightness: 100 },
        mainGate: { status: false },
        balconyDoor: { status: false },
        irrigationSystem: { status: false },
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
          { id: 'hallLight', name: 'Hall Light', type: 'light', status: data.hallLight?.status || false, brightness: data.hallLight?.brightness || 100, location: 'Hall' },
          { id: 'kitchenLight', name: 'Kitchen Light', type: 'light', status: data.kitchenLight?.status || false, brightness: data.kitchenLight?.brightness || 100, location: 'Kitchen' },
          { id: 'garageLight', name: 'Garage Light', type: 'light', status: data.garageLight?.status || false, brightness: data.garageLight?.brightness || 100, location: 'Garage' },
          { id: 'bedroomLight', name: 'Bedroom Light', type: 'light', status: data.bedroomLight?.status || false, brightness: data.bedroomLight?.brightness || 100, location: 'Bedroom' },
          { id: 'mainGate', name: 'Main Gate', type: 'door', status: data.mainGate?.status || false, location: 'Entrance' },
          { id: 'balconyDoor', name: 'Balcony Door', type: 'door', status: data.balconyDoor?.status || false, location: 'Balcony' },
          { id: 'irrigationSystem', name: 'Irrigation System', type: 'irrigation', status: data.irrigationSystem?.status || false, location: 'Backyard' },
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
        const updateData = {
          [`${deviceId}.status`]: !device.status
        };
        await updateDoc(deviceRef, updateData);
      }
    } catch (error) {
      console.error('Error updating device status:', error);
    }
  };

  const handleBrightnessChange = async (deviceId: string, brightness: number) => {
    try {
      const deviceRef = doc(db, 'devices', 'status');
      await updateDoc(deviceRef, {
        [`${deviceId}.brightness`]: brightness
      });
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