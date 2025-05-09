import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  DoorFront,
  Lightbulb,
  WaterDrop,
  History,
} from '@mui/icons-material';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

interface DeviceStatus {
  door: boolean;
  irrigation: boolean;
  lights: {
    room1: boolean;
    room2: boolean;
    room3: boolean;
    room4: boolean;
  };
  lastUpdated: {
    door: string;
    irrigation: string;
    lights: {
      room1: string;
      room2: string;
      room3: string;
      room4: string;
    };
  };
}

const Dashboard: React.FC = () => {
  const [status, setStatus] = useState<DeviceStatus>({
    door: false,
    irrigation: false,
    lights: {
      room1: false,
      room2: false,
      room3: false,
      room4: false,
    },
    lastUpdated: {
      door: '',
      irrigation: '',
      lights: {
        room1: '',
        room2: '',
        room3: '',
        room4: '',
      },
    },
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'devices'), (snapshot) => {
      const data = snapshot.docs[0].data() as DeviceStatus;
      setStatus(data);
    });

    return () => unsubscribe();
  }, []);

  const handleToggle = async (device: string, room?: string) => {
    const timestamp = new Date().toISOString();
    const docRef = doc(db, 'devices', 'status');

    if (device === 'lights' && room) {
      await updateDoc(docRef, {
        [`lights.${room}`]: !status.lights[room as keyof typeof status.lights],
        [`lastUpdated.lights.${room}`]: timestamp,
      });
    } else {
      await updateDoc(docRef, {
        [device]: !status[device as keyof DeviceStatus],
        [`lastUpdated.${device}`]: timestamp,
      });
    }
  };

  const DeviceCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    status: boolean;
    lastUpdated: string;
    onToggle: () => void;
  }> = ({ title, icon, status, lastUpdated, onToggle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            {icon}
            <Typography variant="h6" ml={1}>
              {title}
            </Typography>
          </Box>
          <Switch checked={status} onChange={onToggle} />
        </Box>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Home Automation Dashboard</Typography>
        <IconButton onClick={() => navigate('/reports')}>
          <History />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DeviceCard
            title="Front Door"
            icon={<DoorFront />}
            status={status.door}
            lastUpdated={status.lastUpdated.door}
            onToggle={() => handleToggle('door')}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DeviceCard
            title="Irrigation System"
            icon={<WaterDrop />}
            status={status.irrigation}
            lastUpdated={status.lastUpdated.irrigation}
            onToggle={() => handleToggle('irrigation')}
          />
        </Grid>

        {Object.entries(status.lights).map(([room, isOn]) => (
          <Grid item xs={12} sm={6} md={3} key={room}>
            <DeviceCard
              title={`Room ${room.slice(-1)} Light`}
              icon={<Lightbulb />}
              status={isOn}
              lastUpdated={status.lastUpdated.lights[room as keyof typeof status.lights]}
              onToggle={() => handleToggle('lights', room)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard; 