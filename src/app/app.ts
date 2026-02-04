import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('playstation-lounge-dashboard');

  constructor(private router: Router) {}

  ngOnInit() {
    // Check PIN on app startup
    this.checkPinOnStartup();
  }

  private checkPinOnStartup(): void {
    const pin = localStorage.getItem('app_pin');
    const authenticated = localStorage.getItem('authenticated') === 'true';

    // If PIN is enabled but user is not authenticated, redirect to PIN page
    if (pin && !authenticated) {
      this.router.navigate(['/pin']);
    }
  }
}
