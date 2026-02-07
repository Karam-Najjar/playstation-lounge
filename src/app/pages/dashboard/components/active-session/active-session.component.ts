import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonItem, IonButton, IonIcon, IonBadge, IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { play, pause, stop, timeOutline, hourglassOutline, personOutline } from 'ionicons/icons';
import { Session } from '../../../../models/session.model';

@Component({
  selector: 'app-active-session',
  standalone: true,
  imports: [CommonModule, IonItem, IonButton, IonIcon, IonBadge, IonChip],
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.scss'],
})
export class ActiveSessionComponent {
  private router = inject(Router);

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
      personOutline,
    });
  }

  handleItemClick(event: MouseEvent): void {
    // Check if the click was on a button or within the actions area
    const target = event.target as HTMLElement;
    const isButtonClick =
      target.closest('ion-button') ||
      target.closest('.action-buttons') ||
      target.closest('.session-actions');

    if (!isButtonClick) {
      this.router.navigate(['/session', this.session.id]);
    }
  }

  handleTogglePause(event: Event): void {
    event.stopPropagation();
    this.togglePause.emit(this.session.id);
  }

  handleEndSession(event: Event): void {
    event.stopPropagation();
    this.endSession.emit(this.session.id);
  }
}
