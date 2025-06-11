export interface Customer {
  id: string;
  name: string;
  device: string;
  phoneNumber: string;
  checkedInAt: Date;
  status: 'waiting' | 'called' | 'completed';
  calledAt?: Date;
}

export interface QueueStats {
  waiting: number;
  called: number;
  completed: number;
  totalToday: number;
}

export interface VoiceSettings {
  enabled: boolean;
  volume: number;
  rate: number;
  pitch: number;
  voice: string;
}