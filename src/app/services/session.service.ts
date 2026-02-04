import { Injectable, signal, computed, effect } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Session, SessionCreate, PlayerCount, PaymentStatus } from '../models/session.model';
import { Order, OrderCreate } from '../models/order.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  // Reactive state with signals
  private sessions = signal<Session[]>([]);
  private settings = signal<any>(null);

  // Computed signals for the UI
  activeSessions = computed(() => this.sessions().filter((s) => !s.endTime));

  todaySessions = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.sessions().filter((s) => new Date(s.createdAt) >= today);
  });

  todayRevenue = computed(() => {
    return this.todaySessions()
      .filter((s) => s.endTime && s.paymentStatus === 'paid')
      .reduce((total, session) => total + this.calculateSessionTotal(session), 0);
  });

  constructor(private storage: StorageService) {
    this.loadData();

    // Auto-save when sessions change
    effect(() => {
      this.saveSessionsToStorage();
    });
  }

  private async loadData() {
    const sessions = await this.storage.getSessions();
    const settings = await this.storage.getSettings();
    this.sessions.set(sessions);
    this.settings.set(settings);
  }

  private async saveSessionsToStorage() {
    for (const session of this.sessions()) {
      await this.storage.saveSession(session);
    }
  }

  // Session CRUD Operations
  startSession(data: SessionCreate): string {
    const session: Session = {
      id: uuidv4(),
      deviceName: data.deviceName,
      playerCount: data.playerCount,
      customerName: data.customerName,
      startTime: new Date(),
      isPaused: false,
      totalPausedDuration: 0,
      orders: [],
      paymentStatus: 'unpaid',
      createdAt: new Date(),
    };

    this.sessions.update((sessions) => [...sessions, session]);
    return session.id;
  }

endSession(sessionId: string): void {
  this.sessions.update(sessions => 
    sessions.map(session => {
      if (session.id !== sessionId) return session;
      
      return {
        ...session,
        endTime: new Date()  // This creates a proper Date object
      };
    })
  );
}

  togglePause(sessionId: string): void {
    this.sessions.update((sessions) =>
      sessions.map((session) => {
        if (session.id !== sessionId) return session;

        if (session.isPaused) {
          // Resume: calculate pause duration
          const pauseDuration = new Date().getTime() - (session.pauseStartTime?.getTime() || 0);
          return {
            ...session,
            isPaused: false,
            pauseStartTime: undefined,
            totalPausedDuration: session.totalPausedDuration + pauseDuration,
          };
        } else {
          // Pause
          return {
            ...session,
            isPaused: true,
            pauseStartTime: new Date(),
          };
        }
      }),
    );
  }

  addOrder(sessionId: string, orderData: OrderCreate): void {
    const order: Order = {
      id: uuidv4(),
      sessionId,
      itemName: orderData.itemName,
      quantity: orderData.quantity,
      unitPrice: orderData.unitPrice,
      totalPrice: orderData.quantity * orderData.unitPrice,
      createdAt: new Date(),
    };

    this.sessions.update((sessions) =>
      sessions.map((session) =>
        session.id === sessionId ? { ...session, orders: [...session.orders, order] } : session,
      ),
    );
  }

  updatePaymentStatus(sessionId: string, status: PaymentStatus): void {
    this.sessions.update((sessions) =>
      sessions.map((session) =>
        session.id === sessionId ? { ...session, paymentStatus: status } : session,
      ),
    );
  }

  // Calculations
calculateActiveDuration(session: Session): number {
  if (session.endTime) return 0;
  
  const now = Date.now();
  const startTime = session.startTime instanceof Date ? session.startTime.getTime() : new Date(session.startTime).getTime();
  const paused = session.totalPausedDuration;
  
  if (session.isPaused && session.pauseStartTime) {
    const pauseStart = session.pauseStartTime instanceof Date ? session.pauseStartTime.getTime() : new Date(session.pauseStartTime).getTime();
    const currentPause = now - pauseStart;
    return now - startTime - paused - currentPause;
  }
  
  return now - startTime - paused;
}

  calculateSessionCost(session: Session): number {
    const activeDuration = this.calculateActiveDuration(session);
    const hours = activeDuration / (1000 * 60 * 60);

    const rate =
      session.playerCount === '1-2'
        ? this.settings()?.rates.rateOneTwoPlayers || 7000
        : this.settings()?.rates.rateThreeFourPlayers || 10000;

    return hours * rate;
  }

  calculateOrdersTotal(session: Session): number {
    return session.orders.reduce((total, order) => total + order.totalPrice, 0);
  }

  calculateSessionTotal(session: Session): number {
    const sessionCost = session.endTime
      ? this.calculateFinalSessionCost(session)
      : this.calculateSessionCost(session);

    return sessionCost + this.calculateOrdersTotal(session);
  }

calculateFinalSessionCost(session: Session): number {
  if (!session.endTime) {
    // If session is still active, use regular calculation
    return this.calculateSessionCost(session);
  }
  
  // Ensure endTime is a Date object
  const endTime = session.endTime instanceof Date ? session.endTime : new Date(session.endTime);
  const startTime = session.startTime instanceof Date ? session.startTime : new Date(session.startTime);
  
  const duration = endTime.getTime() - startTime.getTime() - session.totalPausedDuration;
  const hours = duration / (1000 * 60 * 60);
  
  const rate = session.playerCount === '1-2' 
    ? this.settings()?.rates.rateOneTwoPlayers || 7000
    : this.settings()?.rates.rateThreeFourPlayers || 10000;
  
  return hours * rate;
}

  
  calculateFinalDuration(session: any): number {
  if (!session.endTime) {
    return this.calculateActiveDuration(session);
  }
  
  return session.endTime.getTime() - session.startTime.getTime() - session.totalPausedDuration;
}

  // Getters
  getSession(id: string): Session | undefined {
    return this.sessions().find((s) => s.id === id);
  }

  getSettings() {
    return this.settings();
  }

  updateSettings(settings: any): void {
    this.settings.set(settings);
    this.storage.saveSettings(settings);
  }
}
