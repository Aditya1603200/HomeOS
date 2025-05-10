import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { format } from 'date-fns';
import { getActivityLogs, ActivityLog } from '../services/activityLogger';

const Reports: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      const activityLogs = await getActivityLogs(start, end);
      setLogs(activityLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Activity Reports
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              fullWidth
              onClick={fetchLogs}
              disabled={loading}
            >
              Filter Logs
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Device</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Previous State</TableCell>
              <TableCell>New State</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id || log.deviceId + log.timestamp.toMillis()}>
                <TableCell>
                  {format(log.timestamp.toDate(), 'PPpp')}
                </TableCell>
                <TableCell>{log.deviceName}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>
                  {JSON.stringify(log.previousState)}
                </TableCell>
                <TableCell>
                  {JSON.stringify(log.newState)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Reports; 