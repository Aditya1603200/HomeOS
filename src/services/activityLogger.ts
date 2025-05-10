import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

export interface ActivityLog {
  deviceId: string;
  deviceName: string;
  action: string;
  previousState: any;
  newState: any;
  timestamp: Timestamp;
  userId: string;
}

export const logActivity = async (log: Omit<ActivityLog, 'timestamp'>) => {
  try {
    await addDoc(collection(db, 'activityLogs'), {
      ...log,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

export const getActivityLogs = async (startDate?: Date, endDate?: Date) => {
  try {
    let q = query(
      collection(db, 'activityLogs'),
      orderBy('timestamp', 'desc')
    );

    if (startDate) {
      q = query(q, where('timestamp', '>=', Timestamp.fromDate(startDate)));
    }

    if (endDate) {
      q = query(q, where('timestamp', '<=', Timestamp.fromDate(endDate)));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ActivityLog[];
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
}; 