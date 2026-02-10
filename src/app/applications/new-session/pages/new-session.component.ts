import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonAlert,
  IonCol,
  IonRow,
  IonGrid,
} from '@ionic/angular/standalone';
import { gameController } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SessionService } from '../../../services/session.service';
import { PlayerCount } from '../../../models/session.model';
import { HeaderService } from '../../../shared/services/header.service';

@Component({
  selector: 'app-new-session',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonAlert,
    IonCol,
    IonRow,
    IonGrid,
  ],
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.scss'],
})
export class NewSessionComponent implements OnInit {
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private headerService = inject(HeaderService);

  // Available PlayStation devices
  devices = signal<string[]>(['PS4-1', 'PS4-2']);

  // Player count options
  playerCounts: PlayerCount[] = ['1-2', '3-4'];

  // Form data as regular properties
  selectedDevice = '';
  selectedPlayerCount: PlayerCount = '1-2';
  customerName = '';

  // Rates for display as signals
  rates = signal({
    oneTwo: 7000,
    threeFour: 10000,
  });

  // Alert properties as signals
  showAlert = signal(false);
  alertMessage = signal('');

  constructor() {
    addIcons({ gameController });

    // Load settings
    const settings = this.sessionService.getSettings();
    if (settings) {
      this.rates.set({
        oneTwo: settings.rates.rateOneTwoPlayers,
        threeFour: settings.rates.rateThreeFourPlayers,
      });
    }
  }

  ngOnInit() {
    this.headerService.setConfig({
      title: 'بدء جلسة جديدة',
      showBackButton: true,
      showLogout: true,
      showDarkModeToggle: true,
    });
  }

  // Get current rate based on player count
  getCurrentRate(): number {
    return this.selectedPlayerCount === '1-2' ? this.rates().oneTwo : this.rates().threeFour;
  }

  // Get rate display text
  getRateText(): string {
    const rate = this.getCurrentRate();
    return (
      new Intl.NumberFormat('ar-SY', {
        style: 'currency',
        currency: 'SYP',
      }).format(rate) + ' / ساعة'
    );
  }

  // Start new session
  startSession(): void {
    // Validate form
    if (!this.selectedDevice) {
      this.showAlertMessage('الرجاء اختيار جهاز البلايستيشن');
      return;
    }

    if (!this.selectedPlayerCount) {
      this.showAlertMessage('الرجاء اختيار عدد اللاعبين');
      return;
    }

    // Create session
    const sessionId = this.sessionService.startSession({
      deviceName: this.selectedDevice,
      playerCount: this.selectedPlayerCount,
      customerName: this.customerName || undefined,
    });

    // Show success message
    this.showAlertMessage(`تم بدء الجلسة على ${this.selectedDevice} بنجاح!`);

    // Navigate back to dashboard after 1.5 seconds
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1500);
  }

  // Helper method to show alerts
  private showAlertMessage(message: string): void {
    this.alertMessage.set(message);
    this.showAlert.set(true);
  }

  // Reset form
  resetForm(): void {
    this.selectedDevice = '';
    this.selectedPlayerCount = '1-2';
    this.customerName = '';
  }

  // Check if PIN is enabled
  isPinEnabled(): boolean {
    return !!localStorage.getItem('app_pin');
  }

  // Handle back navigation
  goBack(): void {
    this.router.navigate(['/']);
  }
}
