import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, time, settings, analytics, people, gameController } from 'ionicons/icons';

export interface QuickAction {
  label: string;
  icon: string;
  color: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'info';
  route: string | string[];
  disabled?: boolean;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol
  ],
  templateUrl: './quick-action.component.html',
  styleUrls: ['./quick-action.component.scss']
})
export class QuickActionsComponent {
  @Input() title: string = 'إجراءات سريعة';
  @Input() actions: QuickAction[] = [];
  
  trackByAction(index: number, action: QuickAction): string {
    return `${action.label}-${action.icon}-${index}`;
  }

  constructor() {
    addIcons({ add, time, settings, analytics, people, gameController });
  }
}