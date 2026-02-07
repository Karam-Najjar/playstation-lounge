import {
  Component,
  OnInit,
  inject,
  signal,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { LayoutComponent } from '../../../layout/layout/layout.component';
import { SessionService } from '../../../services/session.service';
import { FormatUtils } from '../../../utils/format.utils';
import { ActiveSessionComponent } from '../components/active-session/active-session.component';
import { Session } from '../../../models/session.model';
import { KpiCardComponent } from '../components/kpi-card/kpi-card.component';
import { QuickActionsComponent } from '../components/quick-actions/quick-action.component';
import { IonCardHeader, IonCardTitle, IonCard, IonCardContent, IonCol, IonRow, IonGrid } from "@ionic/angular/standalone";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    KpiCardComponent,
    ActiveSessionComponent,
    QuickActionsComponent,
    IonCardHeader,
    IonCardTitle,
    IonCard,
    IonCardContent,
    IonCol,
    IonRow,
    IonGrid
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private sessionService = inject(SessionService);
  private router = inject(Router);

  // Data signals
  activeSessions = this.sessionService.activeSessions;
  todaySessions = this.sessionService.todaySessions;

  // Computed values
  todayRevenue = signal<string>('0 SYP');
  totalHoursPlayed = signal<string>('0 ساعة');

  // Quick actions configuration
  quickActions = [
    {
      label: 'جلسة جديدة',
      icon: 'add',
      color: 'primary' as const,
      route: '/new-session'
    },
    {
      label: 'السجل',
      icon: 'time',
      color: 'secondary' as const,
      route: '/history'
    },
    {
      label: 'الإعدادات',
      icon: 'settings',
      color: 'tertiary' as const,
      route: '/settings'
    }
  ];

  private updateInterval?: Subscription;

  ngOnInit() {
    this.updateCalculations();
    
    this.updateInterval = interval(1000).subscribe(() => {
      this.updateCalculations();
    });
  }

  ngOnDestroy() {
    this.updateInterval?.unsubscribe();
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

  getSessionDuration(session: Session): string {
    const duration = this.sessionService.calculateActiveDuration(session);
    return FormatUtils.formatDuration(duration);
  }

  getSessionCost(session: Session): number {
    return Math.floor(this.sessionService.calculateSessionCost(session));
  }

  formatTime(date: Date): string {
    return FormatUtils.formatTime(date);
  }

  formatCurrency(amount: number): string {
    return FormatUtils.formatCurrency(amount);
  }

  handleTogglePause(sessionId: string): void {
    this.sessionService.togglePause(sessionId);
    this.updateCalculations();
  }

  handleEndSession(sessionId: string): void {
    this.sessionService.endSession(sessionId);
    this.updateCalculations();
  }

  isPinEnabled(): boolean {
    return !!localStorage.getItem('app_pin');
  }

  handleLogout(): void {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('auth_expiry');
    this.router.navigate(['/pin']);
  }
}