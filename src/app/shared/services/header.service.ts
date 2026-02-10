import { Injectable, signal, computed } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface HeaderConfig {
  title: string;
  showBackButton: boolean;
  backButtonText?: string;
  defaultBackHref?: string;
  showLogout: boolean;
  showDarkModeToggle: boolean;
  customActions?: Array<{
    icon: string;
    handler: () => void;
    label?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  // Default configuration
  private defaultConfig: HeaderConfig = {
    title: '🎮 PlayStation Lounge',
    showBackButton: false,
    backButtonText: 'رجوع',
    defaultBackHref: '/',
    showLogout: true,
    showDarkModeToggle: true,
    customActions: []
  };

  // Current configuration signal
  private config = signal<HeaderConfig>(this.defaultConfig);

  // Individual signals for easy access
  title = computed(() => this.config().title);
  showBackButton = computed(() => this.config().showBackButton);
  backButtonText = computed(() => this.config().backButtonText || 'رجوع');
  defaultBackHref = computed(() => this.config().defaultBackHref || '/');
  showLogout = computed(() => this.config().showLogout);
  showDarkModeToggle = computed(() => this.config().showDarkModeToggle);
  customActions = computed(() => this.config().customActions || []);

  constructor(private router: Router) {
    // Reset to default when navigation ends (optional)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // You can optionally reset to default here
      // or keep the current config until explicitly changed
    });
  }

  // Update entire configuration
  setConfig(config: Partial<HeaderConfig>): void {
    this.config.update(current => ({
      ...this.defaultConfig,
      ...current, // Keep existing values for unspecified properties
      ...config   // Apply new values
    }));
  }

  // Update individual properties
  setTitle(title: string): void {
    this.config.update(current => ({ ...current, title }));
  }

  setShowBackButton(show: boolean): void {
    this.config.update(current => ({ ...current, showBackButton: show }));
  }

  setBackButtonText(text: string): void {
    this.config.update(current => ({ ...current, backButtonText: text }));
  }

  setDefaultBackHref(href: string): void {
    this.config.update(current => ({ ...current, defaultBackHref: href }));
  }

  setShowLogout(show: boolean): void {
    this.config.update(current => ({ ...current, showLogout: show }));
  }

  setShowDarkModeToggle(show: boolean): void {
    this.config.update(current => ({ ...current, showDarkModeToggle: show }));
  }

  setCustomActions(actions: HeaderConfig['customActions']): void {
    this.config.update(current => ({ ...current, customActions: actions }));
  }

  addCustomAction(action: NonNullable<HeaderConfig['customActions']>[0]): void {
    this.config.update(current => ({
      ...current,
      customActions: [...(current.customActions || []), action]
    }));
  }

  clearCustomActions(): void {
    this.config.update(current => ({ ...current, customActions: [] }));
  }

  // Reset to default configuration
  reset(): void {
    this.config.set(this.defaultConfig);
  }

  // Quick preset configurations
  setDashboardConfig(): void {
    this.setConfig({
      title: '🎮 PlayStation Lounge',
      showBackButton: false,
      showLogout: true,
      showDarkModeToggle: true
    });
  }

  setFormConfig(options?: { title?: string; showBackButton?: boolean }): void {
    this.setConfig({
      title: options?.title || 'نموذج',
      showBackButton: options?.showBackButton ?? true,
      showLogout: true,
      showDarkModeToggle: true
    });
  }

  setDetailConfig(title: string): void {
    this.setConfig({
      title,
      showBackButton: true,
      showLogout: true,
      showDarkModeToggle: true
    });
  }
}