import { format, intervalToDuration } from 'date-fns';

export class FormatUtils {
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-SY', {
      style: 'currency',
      currency: 'SYP',
    }).format(amount);
  }

  static formatTime(date: Date): string {
    return format(date, 'HH:mm');
  }

  static formatDateTime(date: Date): string {
    return format(date, 'dd/MM/yyyy HH:mm');
  }

  static formatDuration(milliseconds: number): string {
    if (milliseconds < 0) return '00:00:00';

    const duration = intervalToDuration({ start: 0, end: milliseconds });
    const hours = String(duration.hours || 0).padStart(2, '0');
    const minutes = String(duration.minutes || 0).padStart(2, '0');
    const seconds = String(duration.seconds || 0).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  static formatHours(milliseconds: number): string {
    const hours = milliseconds / (1000 * 60 * 60);
    return hours.toFixed(2);
  }
}
