import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private readonly DARK_MODE_KEY = 'app_dark_mode';
  
  // Signal for dark mode state
  isDarkMode = signal<boolean>(false);
  
  constructor() {
    // Initialize from localStorage or system preference
    this.initializeDarkMode();
    
    // Watch for changes and apply them
    effect(() => {
      this.applyDarkMode(this.isDarkMode());
      this.saveDarkModePreference(this.isDarkMode());
    });
  }
  
  private initializeDarkMode(): void {
    const savedPreference = localStorage.getItem(this.DARK_MODE_KEY);
    
    if (savedPreference !== null) {
      // Use saved preference
      this.isDarkMode.set(savedPreference === 'true');
    } else {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    }
  }
  
  private applyDarkMode(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.documentElement.style.colorScheme = 'light';
    }
  }
  
  private saveDarkModePreference(isDark: boolean): void {
    localStorage.setItem(this.DARK_MODE_KEY, String(isDark));
  }
  
  toggleDarkMode(): void {
    this.isDarkMode.update(mode => !mode);
  }
  
  setDarkMode(isDark: boolean): void {
    this.isDarkMode.set(isDark);
  }
  
  // Watch system preference changes
  watchSystemPreference(): void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only follow system if user hasn't set a preference
      if (!localStorage.getItem(this.DARK_MODE_KEY)) {
        this.isDarkMode.set(e.matches);
      }
    });
  }
}