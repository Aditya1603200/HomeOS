import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { logActivity } from '../services/activityLogger';

export interface DeviceState {
  id: string;
  name: string;
  type: 'light' | 'fan' | 'ac' | 'tv';
  status: boolean;
  value?: number; // For devices with variable control (like fan speed)
  lastUpdated: Date;
}

export const useDeviceState = () => {
  const [devices, setDevices] = useState<DeviceState[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setDevices([]);
      setLoading(false);
      return;
    }

    // Reference to the user's devices collection
    const devicesRef = collection(db, `users/${currentUser.uid}/devices`);
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(devicesRef, (snapshot) => {
      const deviceList: DeviceState[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        deviceList.push({
          id: doc.id,
          name: data.name,
          type: data.type,
          status: data.status,
          value: data.value,
          lastUpdated: data.lastUpdated.toDate()
        });
      });
      setDevices(deviceList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const updateDeviceState = async (deviceId: string, updates: Partial<DeviceState>) => {
    if (!currentUser) throw new Error('User not authenticated');

    const deviceRef = doc(db, `users/${currentUser.uid}/devices/${deviceId}`);
    
    try {
      await updateDoc(deviceRef, {
        ...updates,
        lastUpdated: new Date()
      });

      // Log the activity
      await logActivity({
        action: 'device_update',
        deviceId,
        deviceName: devices.find(d => d.id === deviceId)?.name || 'Unknown Device',
        previousState: { status: updates.status, value: updates.value },
        newState: updates,
        userId: currentUser.uid
      });
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    }
  };

  return {
    devices,
    loading,
    updateDeviceState
  };
}; 