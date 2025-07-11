import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface DoorEvent {
  timestamp: string;
  status: boolean;
}

const Reports: React.FC = () => {
  const [doorEvents, setDoorEvents] = useState<DoorEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoorEvents = async () => {
      try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const q = query(
          collection(db, 'doorEvents'),
          where('timestamp', '>=', oneWeekAgo.toISOString()),
          orderBy('timestamp', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const events = querySnapshot.docs.map(doc => {
          const data = doc.data();
          if (!data || typeof data.timestamp !== 'string' || typeof data.status !== 'boolean') {
            throw new Error('Invalid data format in document');
          }
          return {
            timestamp: data.timestamp,
            status: data.status,
          };
        });
        setDoorEvents(events);
        setError(null);
      } catch (err) {
        console.error('Error fetching door events:', err);
        setError('Failed to load door events data');
        setDoorEvents([]);
      }
    };

    fetchDoorEvents();
  }, []);

  const chartData = doorEvents.map(event => ({
    time: new Date(event.timestamp).toLocaleString(),
    status: event.status ? 1 : 0,
  }));

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">Door Status Report</Typography>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Door Status Over the Last Week
          </Typography>
          {error ? (
            <Typography color="error">{error}</Typography>
          ) : doorEvents.length === 0 ? (
            <Typography>No data available for the selected time period</Typography>
          ) : (
            <Box height={isMobile ? 300 : 400}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={isMobile ? 5 : 0}
                  />
                  <YAxis
                    domain={[0, 1]}
                    ticks={[0, 1]}
                    tickFormatter={(value) => (value === 1 ? 'Open' : 'Closed')}
                  />
                  <Tooltip
                    formatter={(value: number) => (value === 1 ? 'Open' : 'Closed')}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="status"
                    stroke={theme.palette.primary.main}
                    name="Door Status"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports; 