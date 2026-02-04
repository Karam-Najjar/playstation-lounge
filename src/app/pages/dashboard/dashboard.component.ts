// src/app/pages/dashboard/dashboard.component.ts
import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonChip,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { play, pause, stop, add, time, cash, people, gameController } from 'ionicons/icons';
import { SessionService } from '../../services/session.service';
import { FormatUtils } from '../../utils/format.utils';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonChip,
    IonButtons,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private sessionService = inject(SessionService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  // Use computed signals for data
  activeSessions = this.sessionService.activeSessions;
  todaySessions = this.sessionService.todaySessions;

  // Use signals for computed values that need manual updates
  todayRevenue = signal<string>('0 SYP');
  totalHoursPlayed = signal<string>('0 ساعة');

  // Track live updates
  private updateInterval?: Subscription;
  private lastUpdateTime = signal<number>(Date.now());

  constructor() {
    addIcons({ play, pause, stop, add, time, cash, people, gameController });
  }

  ngOnInit() {
    // Initial calculation
    this.updateCalculations();

    // Set up interval for live updates (every second)
    this.updateInterval = interval(1000).subscribe(() => {
      // Mark for check to trigger change detection
      this.lastUpdateTime.set(Date.now());
      this.updateCalculations();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    // Clean up interval
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
    }
  }

  private updateCalculations(): void {
    // Update revenue
    const revenue = this.sessionService.todayRevenue();
    this.todayRevenue.set(FormatUtils.formatCurrency(revenue));

    // Update total hours
    const totalMs = this.todaySessions()
      .filter((s) => s.endTime)
      .reduce((total, session) => {
        const duration =
          session.endTime!.getTime() - session.startTime.getTime() - session.totalPausedDuration;
        return total + duration;
      }, 0);

    this.totalHoursPlayed.set(FormatUtils.formatHours(totalMs) + ' ساعة');
  }

  // Helper method to force update for a specific session
  getSessionDuration(session: any): string {
    // This will be called frequently due to the interval
    const duration = this.sessionService.calculateActiveDuration(session);
    return FormatUtils.formatDuration(duration);
  }

  getSessionCost(session: any): number {
    // This will be called frequently due to the interval
    return Math.floor(this.sessionService.calculateSessionCost(session));
  }

  formatTime(date: Date): string {
    return FormatUtils.formatTime(date);
  }

  togglePause(sessionId: string): void {
    this.sessionService.togglePause(sessionId);
    // Force update after state change
    this.cdr.detectChanges();
  }

  endSession(sessionId: string): void {
    this.sessionService.endSession(sessionId);
    // Update calculations immediately
    this.updateCalculations();
    this.cdr.detectChanges();
  }

  formatCurrency(amount: number): string {
    return FormatUtils.formatCurrency(amount);
  }
  goToSessionDetails(sessionId: string): void {
    this.router.navigate(['/session', sessionId]);
  }

  isPinEnabled(): boolean {
    return !!localStorage.getItem('app_pin');
  }

  logout(): void {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('auth_expiry');
    this.router.navigate(['/pin']);
  }
}
