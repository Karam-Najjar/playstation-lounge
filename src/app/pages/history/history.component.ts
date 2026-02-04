// src/app/pages/history/history.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonBackButton,
  IonButtons,
  IonIcon,
  IonBadge,
  IonChip,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonDatetimeButton,
  IonModal,
  IonDatetime,
  IonText,
  IonAlert,
} from '@ionic/angular/standalone';
import {
  arrowBack,
  calendar,
  filter,
  download,
  cash,
  time,
  receipt,
  statsChart,
  search,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SessionService } from '../../services/session.service';
import { FormatUtils } from '../../utils/format.utils';
import { PaymentStatus } from '../../models/session.model';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonBackButton,
    IonButtons,
    IonIcon,
    IonChip,
    IonSelect,
    IonSelectOption,
    IonGrid,
    IonRow,
    IonCol,
    IonNote,
    IonSegment,
    IonSegmentButton,
    IonModal,
    IonDatetime,
    IonAlert,
  ],
  templateUrl: './history.component.html',
})
export class HistoryComponent {
  private sessionService = inject(SessionService);
  private exportService = inject(ExportService);

  // All sessions
  allSessions = computed(() => this.sessionService.todaySessions());

  // Filtering state
  selectedDate = signal<string>('today'); // 'today', 'yesterday', 'week', 'month', 'custom'
  selectedDevice = signal<string>('all');
  selectedStatus = signal<string>('all');

  public showAlert = signal<boolean>(false);
  public alertHeader = signal<string>('');
  public alertMessage = signal<string>('');

  // Date range for custom filter
  startDate = signal<string>('');
  endDate = signal<string>('');

  // UI state
  showDateModal = signal(false);
  dateModalType = signal<'start' | 'end'>('start');

  // Available devices
  devices = signal<string[]>(['all', 'PS5-1', 'PS5-2', 'PS4-1', 'PS4-2', 'PS4-3']);

  // Status options
  statusOptions = signal<{ value: string; label: string }[]>([
    { value: 'all', label: 'الكل' },
    { value: 'paid', label: 'مدفوعة' },
    { value: 'unpaid', label: 'غير مدفوعة' },
  ]);

  // Filtered sessions
  filteredSessions = computed(() => {
    let sessions = this.allSessions();

    // Filter by date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (this.selectedDate()) {
      case 'today':
        sessions = sessions.filter((s) => new Date(s.createdAt) >= today);
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        sessions = sessions.filter((s) => {
          const sessionDate = new Date(s.createdAt);
          return sessionDate >= yesterday && sessionDate < today;
        });
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        sessions = sessions.filter((s) => new Date(s.createdAt) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        sessions = sessions.filter((s) => new Date(s.createdAt) >= monthAgo);
        break;
      case 'custom':
        if (this.startDate() && this.endDate()) {
          const start = new Date(this.startDate());
          const end = new Date(this.endDate());
          end.setHours(23, 59, 59, 999);

          sessions = sessions.filter((s) => {
            const sessionDate = new Date(s.createdAt);
            return sessionDate >= start && sessionDate <= end;
          });
        }
        break;
    }

    // Filter by device
    if (this.selectedDevice() !== 'all') {
      sessions = sessions.filter((s) => s.deviceName === this.selectedDevice());
    }

    // Filter by payment status
    if (this.selectedStatus() !== 'all') {
      sessions = sessions.filter((s) => s.paymentStatus === this.selectedStatus());
    }

    // Sort by date (newest first)
    return sessions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  });

  // Alert methods
  private showAlertMessage(message: string, header: string = 'ملاحظة'): void {
    this.alertHeader.set(header);
    this.alertMessage.set(message);
    this.showAlert.set(true);
  }

  private showSuccess(message: string): void {
    this.showAlertMessage(message, 'تمت العملية');
  }

  private showError(message: string): void {
    this.showAlertMessage(message, 'خطأ');
  }

  // Statistics
  stats = computed(() => {
    const sessions = this.filteredSessions();
    const endedSessions = sessions.filter((s) => s.endTime);

    const totalRevenue = endedSessions
      .filter((s) => s.paymentStatus === 'paid')
      .reduce((total, session) => {
        const duration =
          session.endTime!.getTime() - session.startTime.getTime() - session.totalPausedDuration;
        const hours = duration / (1000 * 60 * 60);

        const rate =
          session.playerCount === '1-2'
            ? this.sessionService.getSettings()?.rates.rateOneTwoPlayers || 7000
            : this.sessionService.getSettings()?.rates.rateThreeFourPlayers || 10000;

        const sessionCost = hours * rate;
        const ordersTotal = session.orders.reduce(
          (sum: number, order: any) => sum + order.totalPrice,
          0,
        );

        return total + sessionCost + ordersTotal;
      }, 0);

    const totalHours = endedSessions.reduce((total, session) => {
      const duration =
        session.endTime!.getTime() - session.startTime.getTime() - session.totalPausedDuration;
      return total + duration / (1000 * 60 * 60);
    }, 0);

    const unpaidAmount = endedSessions
      .filter((s) => s.paymentStatus === 'unpaid')
      .reduce((total, session) => {
        const duration =
          session.endTime!.getTime() - session.startTime.getTime() - session.totalPausedDuration;
        const hours = duration / (1000 * 60 * 60);

        const rate =
          session.playerCount === '1-2'
            ? this.sessionService.getSettings()?.rates.rateOneTwoPlayers || 7000
            : this.sessionService.getSettings()?.rates.rateThreeFourPlayers || 10000;

        const sessionCost = hours * rate;
        const ordersTotal = session.orders.reduce(
          (sum: number, order: any) => sum + order.totalPrice,
          0,
        );

        return total + sessionCost + ordersTotal;
      }, 0);

    return {
      totalSessions: sessions.length,
      endedSessions: endedSessions.length,
      totalRevenue,
      totalHours: parseFloat(totalHours.toFixed(2)),
      unpaidAmount,
    };
  });

  constructor() {
    addIcons({ arrowBack, calendar, filter, download, cash, time, receipt, statsChart, search });

    // Set default dates for custom filter
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    this.startDate.set(weekAgo.toISOString().split('T')[0]);
    this.endDate.set(today.toISOString().split('T')[0]);
  }

  // Helper methods
  formatCurrency(amount: number): string {
    return FormatUtils.formatCurrency(amount);
  }

  formatTime(date: Date): string {
    return FormatUtils.formatTime(date);
  }

  formatDate(date: Date): string {
    return FormatUtils.formatDateTime(date);
  }

  formatDuration(milliseconds: number): string {
    return FormatUtils.formatDuration(milliseconds);
  }

  calculateSessionTotal(session: any): number {
    if (!session.endTime) return 0;

    const duration =
      session.endTime.getTime() - session.startTime.getTime() - session.totalPausedDuration;
    const hours = duration / (1000 * 60 * 60);

    const rate =
      session.playerCount === '1-2'
        ? this.sessionService.getSettings()?.rates.rateOneTwoPlayers || 7000
        : this.sessionService.getSettings()?.rates.rateThreeFourPlayers || 10000;

    const sessionCost = hours * rate;
    const ordersTotal = session.orders.reduce(
      (sum: number, order: any) => sum + order.totalPrice,
      0,
    );

    return sessionCost + ordersTotal;
  }

  // Export data
  exportData(format: 'json' | 'pdf' = 'json'): void {
    const sessions = this.filteredSessions();

    if (sessions.length === 0) {
      this.showAlertMessage('لا توجد جلسات لتصديرها');
      return;
    }

    try {
      if (format === 'pdf') {
        this.exportService.exportToPdf(sessions, 'playstation-report');
        this.showSuccess('تم تصدير التقرير بصيغة PDF بنجاح');
      } else {
        this.exportService.exportToJson(sessions, 'playstation-data');
        this.showSuccess('تم تصدير البيانات بصيغة JSON بنجاح');
      }
    } catch (error) {
      console.error('Export error:', error);
      this.showError('حدث خطأ أثناء تصدير البيانات');
    }
  }

  // Reset filters
  resetFilters(): void {
    this.selectedDate.set('today');
    this.selectedDevice.set('all');
    this.selectedStatus.set('all');

    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    this.startDate.set(weekAgo.toISOString().split('T')[0]);
    this.endDate.set(today.toISOString().split('T')[0]);
  }

  // Open date modal
  openDateModal(type: 'start' | 'end'): void {
    this.dateModalType.set(type);
    this.showDateModal.set(true);
  }

  // Handle date change
  onDateChange(event: any): void {
    const date = event.detail.value;
    if (this.dateModalType() === 'start') {
      this.startDate.set(date.split('T')[0]);
    } else {
      this.endDate.set(date.split('T')[0]);
    }
    this.showDateModal.set(false);
  }
}
