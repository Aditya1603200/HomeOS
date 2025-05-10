import React from 'react';
import { Grid, Container, Typography, Box, CircularProgress } from '@mui/material';
import { useDeviceState } from '../hooks/useDeviceState';
import DeviceControl from './DeviceControl';

const Dashboard: React.FC = () => {
  const { devices, loading } = useDeviceState();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Home Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {devices.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary" align="center">
              No devices found. Add some devices to get started.
            </Typography>
          </Grid>
        ) : (
          devices.map((device) => (
            <Grid item xs={12} sm={6} md={4} key={device.id}>
              <DeviceControl device={device} />
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard; 