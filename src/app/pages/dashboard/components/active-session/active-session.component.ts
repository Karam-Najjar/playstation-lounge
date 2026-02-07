import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonBadge,
  IonChip
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  play, 
  pause, 
  stop, 
  timeOutline, 
  hourglassOutline,
  personOutline 
} from 'ionicons/icons';
import { Session } from '../../../../models/session.model';

@Component({
  selector: 'app-active-session',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonItem,
    IonButton,
    IonIcon,
    IonBadge,
    IonChip
  ],
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.scss']
})
export class ActiveSessionComponent {
  @Input() session!: Session;
  @Input() duration: string = '';
  @Input() cost: number = 0;
  
  @Output() togglePause = new EventEmitter<string>();
  @Output() endSession = new EventEmitter<string>();
  
  @Input() formatTime: (date: Date) => string = () => '';
  @Input() formatCurrency: (amount: number) => string = () => '';

  constructor() {
    addIcons({ 
      play, 
      pause, 
      stop, 
      timeOutline, 
      hourglassOutline,
      personOutline 
    });
  }
}