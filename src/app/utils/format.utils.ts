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

  static formatHours(
    milliseconds: number,
    format: 'full' | 'compact' | 'time' = 'compact',
  ): string {
    if (milliseconds <= 0) {
      return format === 'time' ? '٠٠:٠٠' : '٠ ساعة';
    }

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    const arabicHours = this.toArabicNumbers(hours);
    const arabicMinutes = this.toArabicNumbers(minutes);

    switch (format) {
      case 'time':
        // "٠٥:٢١" format (cleanest for KPI)
        return `${arabicHours.padStart(2, '٠')}:${arabicMinutes.padStart(2, '٠')}`;

      case 'compact':
        // "٥س ٢١د" format
        if (hours === 0) return `${arabicMinutes}د`;
        if (minutes === 0) return `${arabicHours}س`;
        return `${arabicHours}س ${arabicMinutes}د`;

      case 'full':
      default:
        // "٥ ساعة ٢١ دقيقة" format (without و)
        if (hours === 0) return `${arabicMinutes} دقيقة`;
        if (minutes === 0) return `${arabicHours} ساعة`;
        return `${arabicHours} ساعة ${arabicMinutes} دقيقة`;
    }
  }

  static toArabicNumbers(number: number): string {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return number.toString().replace(/\d/g, (digit) => arabicNumbers[parseInt(digit)]);
  }
}
