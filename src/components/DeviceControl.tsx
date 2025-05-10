import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Switch,
  Slider,
  Box,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Lightbulb as LightIcon,
  AcUnit as AcIcon,
  Tv as TvIcon,
  Air as FanIcon
} from '@mui/icons-material';
import { useDeviceState, DeviceState } from '../hooks/useDeviceState';

interface DeviceControlProps {
  device: DeviceState;
}

const DeviceControl: React.FC<DeviceControlProps> = ({ device }) => {
  const { updateDeviceState } = useDeviceState();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getDeviceIcon = () => {
    switch (device.type) {
      case 'light':
        return <LightIcon />;
      case 'ac':
        return <AcIcon />;
      case 'tv':
        return <TvIcon />;
      case 'fan':
        return <FanIcon />;
      default:
        return <LightIcon />;
    }
  };

  const handleToggle = async () => {
    try {
      await updateDeviceState(device.id, { status: !device.status });
    } catch (error) {
      console.error('Error toggling device:', error);
    }
  };

  const handleValueChange = async (_: Event, newValue: number | number[]) => {
    try {
      await updateDeviceState(device.id, { value: newValue as number });
    } catch (error) {
      console.error('Error updating device value:', error);
    }
  };

  return (
    <Card 
      sx={{ 
        minWidth: isMobile ? '100%' : 275,
        m: 1,
        backgroundColor: device.status ? 'primary.light' : 'background.paper'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton color={device.status ? 'primary' : 'default'}>
            {getDeviceIcon()}
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 1 }}>
            {device.name}
          </Typography>
          <Switch
            checked={device.status}
            onChange={handleToggle}
            color="primary"
          />
        </Box>
        
        {(device.type === 'fan' || device.type === 'ac') && device.status && (
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              {device.type === 'fan' ? 'Speed' : 'Temperature'}: {device.value}
            </Typography>
            <Slider
              value={device.value || 0}
              onChange={handleValueChange}
              min={0}
              max={device.type === 'fan' ? 3 : 30}
              step={device.type === 'fan' ? 1 : 1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        )}
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Last updated: {device.lastUpdated.toLocaleTimeString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DeviceControl; 