import { Injectable } from '@angular/core';
import localforage from 'localforage';
import { Session } from '../models/session.model';
import { AppSettings, Product, RateSettings } from '../models/settings.model';
import { SessionUtils } from '../utils/session.utils';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // Default settings
  private defaultSettings: AppSettings = {
    rates: {
      rateOneTwoPlayers: 7000,
      rateThreeFourPlayers: 10000,
    },
    products: [
      { id: '1', name: 'متة', price: 3000 },
      { id: '2', name: 'قهوة', price: 3000 },
      { id: '3', name: 'أندومي', price: 6000 },
    ],
  };

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage() {
    // Initialize localforage
    localforage.config({
      name: 'playstation-lounge',
      storeName: 'sessions_store',
    });

    // Initialize default settings if not exist
    const settings = await this.getSettings();
    if (!settings) {
      await this.saveSettings(this.defaultSettings);
    }
  }

  // Session Methods
  async saveSession(session: Session): Promise<void> {
    const sessions = await this.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);

    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }

    await localforage.setItem('sessions', sessions);
  }

  async getSessions(): Promise<Session[]> {
    const sessions = await localforage.getItem<any[]>('sessions');
    if (!sessions) return [];

    // Convert stored sessions back to proper Session objects
    return sessions.map((session) => {
      try {
        // If it's already a proper session with Date objects, return as-is
        if (session.startTime instanceof Date) {
          return session;
        }

        // Otherwise, deserialize it
        return SessionUtils.deserializeSession(session);
      } catch (error) {
        console.error('Error deserializing session:', error, session);
        // Return a basic session with current date as fallback
        return {
          ...session,
          startTime: new Date(session.startTime || Date.now()),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
          pauseStartTime: session.pauseStartTime ? new Date(session.pauseStartTime) : undefined,
          createdAt: new Date(session.createdAt || Date.now()),
          orders: (session.orders || []).map((order: any) => ({
            ...order,
            createdAt: new Date(order.createdAt || Date.now()),
          })),
        };
      }
    });
  }

  async getSession(id: string): Promise<Session | null> {
    const sessions = await this.getSessions();
    return sessions.find((s) => s.id === id) || null;
  }

  async deleteSession(id: string): Promise<void> {
    const sessions = await this.getSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    await localforage.setItem('sessions', filtered);
  }

  // Settings Methods
  async saveSettings(settings: AppSettings): Promise<void> {
    await localforage.setItem('settings', settings);
  }

  async getSettings(): Promise<AppSettings> {
    const settings = await localforage.getItem<AppSettings>('settings');
    return settings || this.defaultSettings;
  }

  async updateRates(rates: RateSettings): Promise<void> {
    const settings = await this.getSettings();
    settings.rates = rates;
    await this.saveSettings(settings);
  }

  async updateProducts(products: Product[]): Promise<void> {
    const settings = await this.getSettings();
    settings.products = products;
    await this.saveSettings(settings);
  }

  // Data Backup/Restore
  async exportData(): Promise<string> {
    const sessions = await this.getSessions();
    const settings = await this.getSettings();
    return JSON.stringify({ sessions, settings }, null, 2);
  }

  async importData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    await localforage.setItem('sessions', data.sessions || []);
    await localforage.setItem('settings', data.settings || this.defaultSettings);
  }

  async clearAllData(): Promise<void> {
    await localforage.clear();
    await this.initializeStorage();
  }
}
