import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  setDoc,
  getDoc,
  getDocs,
  Timestamp,
  query,
  where,
  orderBy,
  enableNetwork,
  disableNetwork,
  addDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Device, DeviceType, DeviceActivity } from '../types/device';
import { logActivity } from './activityLogger';

// Initialize default devices
const defaultDevices: Record<string, Partial<Device>> = {
  hallLight: {
    name: 'Hall Light',
    type: 'light',
    status: false,
    location: 'Hall',
    brightness: 100,
    lastUpdated: Timestamp.now()
  },
  kitchenLight: {
    name: 'Kitchen Light',
    type: 'light',
    status: false,
    location: 'Kitchen',
    brightness: 100,
    lastUpdated: Timestamp.now()
  },
  mainGate: {
    name: 'Main Gate',
    type: 'door',
    status: false,
    location: 'Entrance',
    isLocked: true,
    autoLock: false,
    lastUpdated: Timestamp.now()
  },
  balconyDoor: {
    name: 'Balcony Door',
    type: 'door',
    status: false,
    location: 'Balcony',
    isLocked: true,
    autoLock: false,
    lastUpdated: Timestamp.now()
  },
  irrigationSystem: {
    name: 'Irrigation System',
    type: 'irrigation',
    status: false,
    location: 'Backyard',
    moistureLevel: 0,
    schedule: {
      startTime: '06:00',
      endTime: '07:00',
      days: [1, 2, 3, 4, 5, 6, 7]
    },
    lastUpdated: Timestamp.now()
  }
};

// Initialize devices in Firestore
export const initializeDevices = async () => {
  try {
    const devicesRef = doc(db, 'devices', 'status');
    const docSnap = await getDoc(devicesRef);
    
    if (!docSnap.exists()) {
      console.log('Initializing devices in Firestore...');
      // Create the devices document with all default devices
      await setDoc(devicesRef, defaultDevices);
      console.log('Devices initialized successfully');

      // Create activity logs collection with a sample log
      const activityLogsRef = collection(db, 'activityLogs');
      await addDoc(activityLogsRef, {
        deviceId: 'system',
        deviceName: 'System',
        action: 'initialization',
        previousState: null,
        newState: defaultDevices,
        timestamp: Timestamp.now(),
        userId: 'system'
      });
      console.log('Activity logs collection initialized');
    } else {
      console.log('Devices already initialized');
    }
  } catch (error) {
    console.error('Error initializing devices:', error);
    // Try to reconnect to Firestore
    try {
      await enableNetwork(db);
      // Retry initialization after reconnection
      const devicesRef = doc(db, 'devices', 'status');
      const docSnap = await getDoc(devicesRef);
      if (!docSnap.exists()) {
        await setDoc(devicesRef, defaultDevices);
      }
    } catch (reconnectError) {
      console.error('Error reconnecting to Firestore:', reconnectError);
    }
  }
};

// Subscribe to device updates
export const subscribeToDevices = (callback: (devices: Device[]) => void) => {
  const devicesRef = doc(db, 'devices', 'status');
  
  return onSnapshot(devicesRef, 
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const devices: Device[] = Object.entries(data).map(([id, deviceData]) => ({
          id,
          ...deviceData
        })) as Device[];
        callback(devices);
      }
    },
    (error) => {
      console.error('Error in device subscription:', error);
      // Try to reconnect to Firestore
      try {
        enableNetwork(db);
      } catch (reconnectError) {
        console.error('Error reconnecting to Firestore:', reconnectError);
      }
    }
  );
};

// Update device state
export const updateDeviceState = async (
  deviceId: string, 
  updates: Partial<Device>,
  userId: string
) => {
  const devicesRef = doc(db, 'devices', 'status');
  
  try {
    // Get current state
    const deviceSnap = await getDoc(devicesRef);
    const previousState = deviceSnap.exists() ? deviceSnap.data()?.[deviceId] : null;
    
    // Update device state
    const newState = {
      ...updates,
      lastUpdated: Timestamp.now()
    };
    
    await updateDoc(devicesRef, {
      [`${deviceId}`]: newState
    });
    
    // Log the activity
    await logActivity({
      deviceId,
      deviceName: updates.name || previousState?.name || 'Unknown Device',
      action: 'device_update',
      previousState,
      newState,
      userId
    });
    
    return newState;
  } catch (error) {
    console.error('Error updating device state:', error);
    // Try to reconnect to Firestore
    try {
      await enableNetwork(db);
    } catch (reconnectError) {
      console.error('Error reconnecting to Firestore:', reconnectError);
    }
    throw error;
  }
};

// Get device activity logs
export const getDeviceActivityLogs = async (
  deviceId: string,
  startDate?: Date,
  endDate?: Date
) => {
  try {
    let q = query(
      collection(db, 'activityLogs'),
      where('deviceId', '==', deviceId),
      orderBy('timestamp', 'desc')
    );

    if (startDate) {
      q = query(q, where('timestamp', '>=', Timestamp.fromDate(startDate)));
    }

    if (endDate) {
      q = query(q, where('timestamp', '<=', Timestamp.fromDate(endDate)));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as DeviceActivity[];
  } catch (error) {
    console.error('Error fetching device activity logs:', error);
    // Try to reconnect to Firestore
    try {
      await enableNetwork(db);
    } catch (reconnectError) {
      console.error('Error reconnecting to Firestore:', reconnectError);
    }
    throw error;
  }
}; 