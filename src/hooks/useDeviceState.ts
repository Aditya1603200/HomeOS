import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, Timestamp, setDoc } from 'firebase/firestore';

interface DeviceState {
  status: boolean;
  lastChanged: Timestamp;
  deviceName: string;
}

type FirestoreDeviceData = {
  [key: string]: any;
} & DeviceState;

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
          const initialData: FirestoreDeviceData = {
            status: false,
            lastChanged: Timestamp.now(),
            deviceName: deviceId
          };
          // Use setDoc instead of updateDoc for initial document creation
          setDoc(deviceRef, initialData);
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
    const newState: FirestoreDeviceData = {
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