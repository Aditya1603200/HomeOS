import { Timestamp } from 'firebase/firestore';

export type DeviceType = 'light' | 'door' | 'irrigation' | 'fan' | 'ac' | 'tv';

export interface BaseDevice {
  id: string;
  name: string;
  type: DeviceType;
  status: boolean;
  location: string;
  lastUpdated: Timestamp;
}

export interface LightDevice extends BaseDevice {
  type: 'light';
  brightness: number;
  color?: string;
}

export interface DoorDevice extends BaseDevice {
  type: 'door';
  isLocked: boolean;
  autoLock: boolean;
}

export interface IrrigationDevice extends BaseDevice {
  type: 'irrigation';
  moistureLevel: number;
  schedule: {
    startTime: string;
    endTime: string;
    days: number[];
  };
}

export interface FanDevice extends BaseDevice {
  type: 'fan';
  speed: number;
  mode: 'normal' | 'oscillate' | 'timer';
}

export interface ACDevice extends BaseDevice {
  type: 'ac';
  temperature: number;
  mode: 'cool' | 'heat' | 'fan' | 'auto';
  fanSpeed: number;
}

export interface TVDevice extends BaseDevice {
  type: 'tv';
  volume: number;
  channel: number;
  source: string;
}

export type Device = LightDevice | DoorDevice | IrrigationDevice | FanDevice | ACDevice | TVDevice;

export interface DeviceState {
  id: string;
  name: string;
  type: DeviceType;
  status: boolean;
  value?: number;
  lastUpdated: Date;
}

export interface DeviceActivity {
  id?: string;
  deviceId: string;
  deviceName: string;
  action: string;
  previousState: any;
  newState: any;
  timestamp: Timestamp;
  userId: string;
} 