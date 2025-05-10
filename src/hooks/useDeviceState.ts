import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore';

interface DeviceState {
  status: boolean;
  lastChanged: Timestamp;
  deviceName: string;
}

export const useDeviceState = (deviceId: string) => {
  const [deviceState, setDeviceState] = useState<DeviceState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const deviceRef = doc(db, 'devices', deviceId);
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(deviceRef, 
      (doc) => {
        if (doc.exists()) {
          setDeviceState(doc.data() as DeviceState);
        } else {
          // Initialize device if it doesn't exist
          const initialData: DeviceState = {
            status: false,
            lastChanged: Timestamp.now(),
            deviceName: deviceId
          };
          updateDoc(deviceRef, initialData);
          setDeviceState(initialData);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [deviceId]);

  const toggleDevice = async () => {
    if (!deviceState) return;
    
    const deviceRef = doc(db, 'devices', deviceId);
    const newState = {
      status: !deviceState.status,
      lastChanged: Timestamp.now(),
      deviceName: deviceState.deviceName
    };
    
    try {
      await updateDoc(deviceRef, newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update device state');
    }
  };

  return { deviceState, loading, error, toggleDevice };
}; 