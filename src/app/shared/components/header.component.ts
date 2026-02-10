import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonToggle,
  IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOut, moon, sunny, arrowBack } from 'ionicons/icons';
import { DarkModeService } from '../../services/dark-mode.service';
import { HeaderService } from '../services/header.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonToggle,
    IonBackButton
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private darkModeService = inject(DarkModeService);
  private headerService = inject(HeaderService);
  
  @Output() logout = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  
  // Get all header configuration from service
  title = this.headerService.title;
  showBackButton = this.headerService.showBackButton;
  backButtonText = this.headerService.backButtonText;
  defaultBackHref = this.headerService.defaultBackHref;
  showLogout = this.headerService.showLogout;
  showDarkModeToggle = this.headerService.showDarkModeToggle;
  customActions = this.headerService.customActions;
  
  // Dark mode state
  isDarkMode = this.darkModeService.isDarkMode;
  
  // Check if PIN is enabled
  get isPinEnabled(): boolean {
    return !!localStorage.getItem('app_pin');
  }

  constructor() {
    addIcons({ logOut, moon, sunny, arrowBack });
  }

  toggleDarkMode(): void {
    this.darkModeService.toggleDarkMode();
  }

  onBackClick(): void {
    this.back.emit();
  }

  handleCustomAction(action: any): void {
    action.handler();
  }
}