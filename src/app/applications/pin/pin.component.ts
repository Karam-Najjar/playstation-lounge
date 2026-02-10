import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonText,
  IonAlert,
  IonButtons,
} from '@ionic/angular/standalone';
import { lockClosed, arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-pin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonText,
    IonAlert,
    IonButtons,
  ],
  templateUrl: './pin.component.html',
  styleUrl: './pin.components.scss',
})
export class PinComponent {
  private router = inject(Router);

  pinInput = signal<string>('');
  errorMessage = signal<string>('');
  showError = signal<boolean>(false);
  attempts = signal<number>(0);
  maxAttempts = 3;

  constructor() {
    addIcons({ lockClosed, arrowBack });
  }

  addDigit(digit: string): void {
    if (this.pinInput().length < 4) {
      this.pinInput.update((current) => current + digit);
    }
  }

  removeDigit(): void {
    if (this.pinInput().length > 0) {
      this.pinInput.update((current) => current.slice(0, -1));
    }
  }

  submitPin(): void {
    const savedPin = localStorage.getItem('app_pin');

    if (!savedPin) {
      // No PIN set, allow access
      this.authenticate();
      return;
    }

    if (this.pinInput() === savedPin) {
      this.authenticate();
    } else {
      this.attempts.update((a) => a + 1);
      this.errorMessage.set(
        `رمز PIN غير صحيح. المحاولات المتبقية: ${this.maxAttempts - this.attempts()}`,
      );
      this.showError.set(true);
      this.pinInput.set('');

      if (this.attempts() >= this.maxAttempts) {
        // Too many attempts
        this.errorMessage.set('تم تجاوز عدد المحاولات المسموح بها. حاول لاحقاً.');
        this.showError.set(true);
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      }
    }
  }

  private authenticate(): void {
    // Set authenticated flag
    localStorage.setItem('authenticated', 'true');

    // Set expiration (8 hours)
    const expiryTime = Date.now() + 8 * 60 * 60 * 1000;
    localStorage.setItem('auth_expiry', expiryTime.toString());

    // Navigate to dashboard
    this.router.navigate(['/']);
  }

  // Add logout functionality
  logout(): void {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('auth_expiry');
    this.router.navigate(['/pin']);
  }

  clearPin(): void {
    this.pinInput.set('');
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
