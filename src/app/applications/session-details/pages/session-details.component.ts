import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
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
  IonAlert,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonNote,
  IonCardSubtitle,
} from '@ionic/angular/standalone';
import { arrowBack, add, pause, play, stop, receipt, cash, time, cafe, card } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Subscription, interval } from 'rxjs';
import { PaymentStatus } from '../../../models/session.model';
import { ExportService } from '../../../services/export.service';
import { SessionService } from '../../../services/session.service';
import { FormatUtils } from '../../../utils/format.utils';
import { HeaderService } from '../../../shared/services/header.service';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
    IonAlert,
    IonModal,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonNote,
    IonCardSubtitle,
  ],
  templateUrl: './session-details.component.html',
})
export class SessionDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private cdr = inject(ChangeDetectorRef);
  private exportService = inject(ExportService);
  private headerService = inject(HeaderService);

  // Session data
  sessionId = signal<string>('');
  session = signal<any>(null);

  // UI State
  isAddingOrder = signal(false);
  showEndSessionModal = signal(false);
  showAlert = signal(false);
  alertMessage = signal('');
  alertHeader = signal('');

  // New order form
  selectedProduct = signal<any>(null);
  orderQuantity = signal<number>(1);

  // Live updates tracker
  private updateInterval?: Subscription;
  private lastUpdateTime = signal<number>(Date.now());

  // Computed values that update automatically
  sessionDuration = computed(() => {
    const session = this.session();
    if (!session) return '00:00:00';

    // This computed property will re-run when lastUpdateTime changes
    this.lastUpdateTime();

    if (session.endTime) {
      // For ended sessions
      const duration =
        session.endTime.getTime() - session.startTime.getTime() - session.totalPausedDuration;
      return FormatUtils.formatDuration(duration);
    } else {
      // For active sessions
      return FormatUtils.formatDuration(this.sessionService.calculateActiveDuration(session));
    }
  });

  sessionCost = computed(() => {
    const session = this.session();
    if (!session) return 0;

    // Trigger recomputation on updates
    this.lastUpdateTime();

    if (session.endTime) {
      // For ended sessions
      const duration =
        session.endTime.getTime() - session.startTime.getTime() - session.totalPausedDuration;
      const hours = duration / (1000 * 60 * 60);

      const settings = this.sessionService.getSettings();
      const rate =
        session.playerCount === '1-2'
          ? settings?.rates.rateOneTwoPlayers || 7000
          : settings?.rates.rateThreeFourPlayers || 10000;

      return hours * rate;
    } else {
      // For active sessions
      return this.sessionService.calculateSessionCost(session);
    }
  });

  ordersTotal = computed(() => {
    const session = this.session();
    if (!session) return 0;
    return session.orders.reduce((total: number, order: any) => total + order.totalPrice, 0);
  });

  sessionTotal = computed(() => {
    return this.sessionCost() + this.ordersTotal();
  });

  // Available products from settings
  products = computed(() => {
    const settings = this.sessionService.getSettings();
    return settings?.products || [];
  });

  constructor() {
    addIcons({ arrowBack, add, pause, play, stop, receipt, cash, time, cafe, card });
  }

  ngOnInit() {
    // Get session ID from route
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.sessionId.set(id);
        this.loadSession();

        // Start live updates for active sessions
        if (!this.updateInterval) {
          this.updateInterval = interval(1000).subscribe(() => {
            // Update the trigger signal to force recomputation
            this.lastUpdateTime.set(Date.now());

            // Reload session data
            this.loadSession();

            // Manually trigger change detection
            this.cdr.detectChanges();
          });
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
    }
  }

  private loadSession(): void {
    const session = this.sessionService.getSession(this.sessionId());
    if (session) {
      this.session.set(session);
    } else {
      // Session not found, navigate back
      this.showError('الجلسة غير موجودة');
      setTimeout(() => this.router.navigate(['/']), 2000);
    }
  }

  // Session actions
  togglePause(): void {
    if (!this.session()) return;
    this.sessionService.togglePause(this.sessionId());
    this.loadSession();
    this.cdr.detectChanges();
  }

  addOrder(): void {
    this.isAddingOrder.set(true);
  }

  confirmAddOrder(): void {
    if (!this.selectedProduct() || this.orderQuantity() < 1) {
      this.showError('الرجاء اختيار منتج وكمية صحيحة');
      return;
    }

    this.sessionService.addOrder(this.sessionId(), {
      itemName: this.selectedProduct().name,
      quantity: this.orderQuantity(),
      unitPrice: this.selectedProduct().price,
    });

    this.showSuccess(`تم إضافة ${this.orderQuantity()} ${this.selectedProduct().name}`);

    // Reset form
    this.selectedProduct.set(null);
    this.orderQuantity.set(1);
    this.isAddingOrder.set(false);

    this.loadSession();
    this.cdr.detectChanges();
  }

  endSession(): void {
    if (!this.session()) return;

    // End the session first
    this.sessionService.endSession(this.sessionId());
    this.loadSession();

    // Show end session modal with invoice
    setTimeout(() => {
      this.showEndSessionModal.set(true);
      this.cdr.detectChanges();
    }, 100);
  }

  updatePaymentStatus(status: PaymentStatus): void {
    if (!this.session()) return;

    this.sessionService.updatePaymentStatus(this.sessionId(), status);
    this.loadSession();

    const statusText = status === 'paid' ? 'مدفوعة' : 'غير مدفوعة';
    this.showSuccess(`تم تحديث حالة الدفع إلى: ${statusText}`);
    this.cdr.detectChanges();
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/']);
  }

  // Helper methods
  formatCurrency(amount: number): string {
    return FormatUtils.formatCurrency(amount);
  }

  formatTime(date: Date): string {
    return FormatUtils.formatTime(date);
  }

  formatDateTime(date: Date): string {
    return FormatUtils.formatDateTime(date);
  }

  private showSuccess(message: string): void {
    this.alertHeader.set('تمت العملية');
    this.alertMessage.set(message);
    this.showAlert.set(true);
  }

  private showError(message: string): void {
    this.alertHeader.set('خطأ');
    this.alertMessage.set(message);
    this.showAlert.set(true);
  }

  // Get rate text for display
  getRateText(): string {
    const session = this.session();
    if (!session) return '';

    const settings = this.sessionService.getSettings();
    const rate =
      session.playerCount === '1-2'
        ? settings?.rates.rateOneTwoPlayers
        : settings?.rates.rateThreeFourPlayers;

    return this.formatCurrency(rate || 0) + ' / ساعة';
  }

  exportInvoice(): void {
    if (!this.session()) {
      this.showError('لا يمكن تصدير الفاتورة بدون بيانات الجلسة');
      return;
    }

    try {
      this.exportService.exportSessionInvoice(this.session());
      this.showSuccess('تم تصدير الفاتورة بصيغة PDF');
    } catch (error) {
      console.error('Invoice export error:', error);
      this.showError('حدث خطأ أثناء تصدير الفاتورة');
    }
  }
}
