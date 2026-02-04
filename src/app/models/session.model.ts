import { Order } from './order.model';

export type PlayerCount = '1-2' | '3-4';
export type PaymentStatus = 'paid' | 'unpaid';

export interface Session {
  id: string;
  deviceName: string;
  playerCount: PlayerCount;
  customerName?: string;
  startTime: Date;
  endTime?: Date;
  isPaused: boolean;
  pauseStartTime?: Date;
  totalPausedDuration: number;
  orders: Order[];
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

export interface SessionCreate {
  deviceName: string;
  playerCount: PlayerCount;
  customerName?: string;
}

export interface SerializedSession extends Omit<
  Session,
  'startTime' | 'endTime' | 'pauseStartTime' | 'createdAt' | 'orders'
> {
  startTime: string;
  endTime?: string;
  pauseStartTime?: string;
  createdAt: string;
  orders: Array<Omit<Order, 'createdAt'> & { createdAt: string }>;
}
