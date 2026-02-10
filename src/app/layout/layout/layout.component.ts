import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../../shared/components/header.component';
import { HeaderService } from '../../shared/services/header.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    IonContent,
    HeaderComponent
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnDestroy {
  private headerService = inject(HeaderService);
  
  // Check if PIN is enabled
  get isPinEnabled(): boolean {
    return !!localStorage.getItem('app_pin');
  }

  handleLogout(): void {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('auth_expiry');
    // Navigation to pin page would be handled by route guard
  }

  handleBack(): void {
    // Navigation is handled by the back button href
  }
  
  // Reset header when layout is destroyed
  ngOnDestroy(): void {
    this.headerService.reset();
  }
}