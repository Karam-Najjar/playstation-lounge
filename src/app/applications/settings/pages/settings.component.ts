import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonAlert, IonGrid, IonRow, IonCol, IonNote, IonSegment, IonSegmentButton, IonText, IonModal, IonToggle, IonTextarea, IonBadge, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent } from '@ionic/angular/standalone';
import {
  settings,
  save,
  trash,
  download,
  cloudUpload,
  lockClosed,
  lockOpen,
  add,
  remove,
  shieldCheckmark,
  cash,
  cafe,
  gameController,
  refresh,
  create,
  warning,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RateSettings, Product } from '../../../models/settings.model';
import { SessionService } from '../../../services/session.service';
import { StorageService } from '../../../services/storage.service';
import { HeaderService } from '../../../shared/services/header.service';
import { FormatUtils } from '../../../utils/format.utils';

@Component({
  selector: 'app-settings',
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
    IonButton,
    IonIcon,
    IonAlert,
    IonSegment,
    IonSegmentButton,
    IonModal,
    IonToggle,
    IonTextarea,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBadge,
    IonContent
],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private sessionService = inject(SessionService);
  private storageService = inject(StorageService);
  private headerService = inject(HeaderService);

  // Active tab
  activeTab = signal<'rates' | 'products' | 'devices' | 'security' | 'backup'>('rates');

  // Rate settings
  rates = signal<RateSettings>({
    rateOneTwoPlayers: 7000,
    rateThreeFourPlayers: 10000,
  });

  // Products management
  products = signal<Product[]>([]);
  newProduct = signal<Omit<Product, 'id'>>({
    name: '',
    price: 0,
  });
  editingProductId = signal<string | null>(null);

  // Devices management
  devices = signal<string[]>(['PS5-1', 'PS5-2', 'PS4-1', 'PS4-2', 'PS4-3']);
  newDevice = signal<string>('');
  editingDeviceIndex = signal<number | null>(null);

  // Security settings
  pinEnabled = signal<boolean>(false);
  currentPin = signal<string>('');
  newPin = signal<string>('');
  confirmPin = signal<string>('');
  showPinSetup = signal<boolean>(false);

  // Backup settings
  backupData = signal<string>('');
  importStatus = signal<'idle' | 'success' | 'error'>('idle');
  importMessage = signal<string>('');

  // UI State
  showDeleteConfirm = signal<boolean>(false);
  deleteConfirmMessage = signal<string>('');
  deleteAction = signal<() => void>(() => {});

  // Alert state
  showAlert = signal<boolean>(false);
  alertHeader = signal<string>('');
  alertMessage = signal<string>('');

  constructor() {
    addIcons({
      settings,
      save,
      trash,
      download,
      cloudUpload,
      lockClosed,
      lockOpen,
      add,
      remove,
      shieldCheckmark,
      cash,
      cafe,
      gameController,
      refresh,
      create,
      warning,
    });
  }

  ngOnInit() {
    // Set header configuration
    this.headerService.setConfig({
      title: 'الإعدادات',
      showBackButton: true,
      showLogout: true,
      showDarkModeToggle: true,
      customActions: [
        {
          icon: 'refresh',
          label: 'استعادة الإعدادات الافتراضية',
          handler: () => this.resetToDefaults()
        }
      ]
    });

    this.loadSettings();
  }

  private async loadSettings(): Promise<void> {
    // Load rates
    const settings = this.sessionService.getSettings();
    if (settings) {
      this.rates.set(settings.rates);
      this.products.set(settings.products || []);
    }

    // Check if PIN is set
    const savedPin = localStorage.getItem('app_pin');
    this.pinEnabled.set(!!savedPin);
  }

  // Rate Settings
  saveRates(): void {
    const newSettings = { ...this.sessionService.getSettings() };
    newSettings.rates = this.rates();

    this.sessionService.updateSettings(newSettings);
    this.showSuccess('تم حفظ الأسعار بنجاح');
  }

  // Products Management
  addProduct(): void {
    if (!this.newProduct().name || this.newProduct().price <= 0) {
      this.showError('الرجاء إدخال اسم المنتج وسعر صحيح');
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      ...this.newProduct(),
    };

    this.products.update((products) => [...products, product]);
    this.saveProducts();
    this.newProduct.set({ name: '', price: 0 });

    this.showSuccess('تم إضافة المنتج بنجاح');
  }

  editProduct(product: Product): void {
    this.editingProductId.set(product.id);
    this.newProduct.set({
      name: product.name,
      price: product.price,
    });
  }

  updateProduct(): void {
    if (!this.editingProductId() || !this.newProduct().name || this.newProduct().price <= 0) {
      this.showError('الرجاء إدخال بيانات صحيحة');
      return;
    }

    this.products.update((products) =>
      products.map((p) => (p.id === this.editingProductId() ? { ...p, ...this.newProduct() } : p)),
    );

    this.saveProducts();
    this.cancelEdit();
    this.showSuccess('تم تحديث المنتج بنجاح');
  }

  deleteProduct(productId: string): void {
    this.showDeleteConfirmModal('حذف المنتج', 'هل أنت متأكد من حذف هذا المنتج؟', () => {
      this.products.update((products) => products.filter((p) => p.id !== productId));
      this.saveProducts();
      this.showSuccess('تم حذف المنتج بنجاح');
    });
  }

  saveProducts(): void {
    const newSettings = { ...this.sessionService.getSettings() };
    newSettings.products = this.products();

    this.sessionService.updateSettings(newSettings);
  }

  cancelEdit(): void {
    this.editingProductId.set(null);
    this.newProduct.set({ name: '', price: 0 });
  }

  // Devices Management
  addDevice(): void {
    if (!this.newDevice().trim()) {
      this.showError('الرجاء إدخال اسم الجهاز');
      return;
    }

    if (this.devices().includes(this.newDevice())) {
      this.showError('هذا الجهاز موجود بالفعل');
      return;
    }

    this.devices.update((devices) => [...devices, this.newDevice()]);
    this.newDevice.set('');
    this.showSuccess('تم إضافة الجهاز بنجاح');
  }

  editDevice(index: number): void {
    this.editingDeviceIndex.set(index);
    this.newDevice.set(this.devices()[index]);
  }

  updateDevice(): void {
    if (this.editingDeviceIndex() === null || !this.newDevice().trim()) {
      this.showError('الرجاء إدخال اسم الجهاز');
      return;
    }

    this.devices.update((devices) =>
      devices.map((device, i) => (i === this.editingDeviceIndex() ? this.newDevice() : device)),
    );

    this.cancelDeviceEdit();
    this.showSuccess('تم تحديث الجهاز بنجاح');
  }

  deleteDevice(index: number): void {
    this.showDeleteConfirmModal('حذف الجهاز', 'هل أنت متأكد من حذف هذا الجهاز؟', () => {
      this.devices.update((devices) => devices.filter((_, i) => i !== index));
      this.showSuccess('تم حذف الجهاز بنجاح');
    });
  }

  cancelDeviceEdit(): void {
    this.editingDeviceIndex.set(null);
    this.newDevice.set('');
  }

  // Security Settings
  togglePin(): void {
    if (this.pinEnabled()) {
      // Disable PIN
      localStorage.removeItem('app_pin');
      this.pinEnabled.set(false);
      this.showSuccess('تم تعطيل رمز PIN بنجاح');
    } else {
      // Show PIN setup
      this.showPinSetup.set(true);
    }
  }

  setupPin(): void {
    if (!this.newPin() || this.newPin().length !== 4) {
      this.showError('الرجاء إدخال رمز PIN مكون من 4 أرقام');
      return;
    }

    if (this.newPin() !== this.confirmPin()) {
      this.showError('كلمة المرور غير متطابقة');
      return;
    }

    localStorage.setItem('app_pin', this.newPin());
    this.pinEnabled.set(true);
    this.showPinSetup.set(false);
    this.newPin.set('');
    this.confirmPin.set('');

    this.showSuccess('تم تفعيل رمز PIN بنجاح');
  }

  cancelPinSetup(): void {
    this.showPinSetup.set(false);
    this.newPin.set('');
    this.confirmPin.set('');
  }

  // Backup & Restore
  async exportData(): Promise<void> {
    try {
      const data = await this.storageService.exportData();
      this.backupData.set(data);

      // Create download
      const blob = new Blob([data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `playstation-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      window.URL.revokeObjectURL(url);
      this.showSuccess('تم تصدير البيانات بنجاح');
    } catch (error) {
      this.showError('حدث خطأ أثناء تصدير البيانات');
      console.error('Export error:', error);
    }
  }

  async importData(): Promise<void> {
    if (!this.backupData().trim()) {
      this.showError('الرجاء لصق البيانات أولاً');
      return;
    }

    try {
      await this.storageService.importData(this.backupData());
      this.importStatus.set('success');
      this.importMessage.set('تم استيراد البيانات بنجاح');

      // Reload settings
      setTimeout(() => {
        this.loadSettings();
        this.importStatus.set('idle');
        this.backupData.set('');
      }, 2000);
    } catch (error) {
      this.importStatus.set('error');
      this.importMessage.set('خطأ في تنسيق البيانات');
      console.error('Import error:', error);
    }
  }

  async clearAllData(): Promise<void> {
    this.showDeleteConfirmModal(
      'مسح جميع البيانات',
      '⚠️ تحذير: هذا الإجراء سيحذف جميع الجلسات والإعدادات. هل أنت متأكد؟',
      async () => {
        try {
          await this.storageService.clearAllData();
          this.loadSettings();
          this.showSuccess('تم مسح جميع البيانات بنجاح');
        } catch (error) {
          this.showError('حدث خطأ أثناء مسح البيانات');
        }
      },
    );
  }

  // Helper methods
  formatCurrency(amount: number): string {
    return FormatUtils.formatCurrency(amount);
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

  private showDeleteConfirmModal(header: string, message: string, action: () => void): void {
    this.deleteConfirmMessage.set(message);
    this.deleteAction.set(action);
    this.showDeleteConfirm.set(true);
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.showDeleteConfirmModal(
      'استعادة الإعدادات الافتراضية',
      'هل تريد استعادة جميع الإعدادات إلى القيم الافتراضية؟',
      () => {
        // Reset rates
        this.rates.set({
          rateOneTwoPlayers: 7000,
          rateThreeFourPlayers: 10000,
        });
        this.saveRates();

        // Reset products
        const defaultProducts: Product[] = [
          { id: '1', name: 'شاي', price: 1000 },
          { id: '2', name: 'قهوة', price: 2000 },
          { id: '3', name: 'مشروبات غازية', price: 1500 },
          { id: '4', name: 'سناك', price: 2500 },
        ];
        this.products.set(defaultProducts);
        this.saveProducts();

        // Reset devices
        this.devices.set(['PS5-1', 'PS5-2', 'PS4-1', 'PS4-2', 'PS4-3']);

        this.showSuccess('تم استعادة الإعدادات الافتراضية بنجاح');
      },
    );
  }

  // Alert buttons
  getAlertButtons(): any[] {
    return [
      {
        text: 'إلغاء',
        role: 'cancel',
        handler: () => {
          this.showDeleteConfirm.set(false);
        },
      },
      {
        text: 'حذف',
        role: 'destructive',
        handler: () => {
          if (this.deleteAction()) {
            this.deleteAction()();
          }
          this.showDeleteConfirm.set(false);
        },
      },
    ];
  }
}