import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOut, moon, sunny } from 'ionicons/icons';
import { DarkModeService } from '../../services/dark-mode.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonToggle
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  private darkModeService = inject(DarkModeService);
  
  @Input() title: string = '';
  @Input() showLogout: boolean = true;
  @Input() showDarkModeToggle: boolean = true;
  @Input() isPinEnabled: boolean = false;
  
  @Output() logout = new EventEmitter<void>();
  
  // Dark mode state
  isDarkMode = this.darkModeService.isDarkMode;

  constructor() {
    addIcons({ logOut, moon, sunny });
  }

  toggleDarkMode(): void {
    this.darkModeService.toggleDarkMode();
  }
}