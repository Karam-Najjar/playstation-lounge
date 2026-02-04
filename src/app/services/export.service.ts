import { Injectable, inject } from '@angular/core';
import { format } from 'date-fns';
import { SessionService } from './session.service';
import { Session } from '../models/session.model';
import { 
  PDFDocument, 
  StandardFonts, 
  rgb, 
  PDFPage,
  PDFFont
} from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private sessionService = inject(SessionService);
  private arabicFontCache: Uint8Array | null = null;
  private loadingFont = false;

  // Export sessions as JSON
  exportToJson(sessions: Session[], fileName: string = 'playstation-data'): void {
    const settings = this.sessionService.getSettings();
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        totalSessions: sessions.length,
        version: '1.0'
      },
      settings: settings,
      sessions: sessions.map(session => this.prepareSessionForExport(session)),
      summary: this.generateSummary(sessions)
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    this.downloadFile(dataStr, `${fileName}-${format(new Date(), 'yyyy-MM-dd')}.json`, 'application/json');
  }

  // Export sessions as PDF using PDF-Lib with Arial font
  async exportToPdf(sessions: Session[], fileName: string = 'playstation-report'): Promise<void> {
  if (sessions.length === 0) {
    throw new Error('No sessions to export');
  }

  try {
    const settings = this.sessionService.getSettings();
    const summary = this.generateSummary(sessions);
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Use standard fonts that support English only
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add a page (A4 landscape)
    const page = pdfDoc.addPage([842, 595]); // A4 landscape dimensions in points
    
    // Draw content in English only
    this.drawReportHeaderEnglish(page, helveticaBold, helveticaFont);
    this.drawSummarySectionEnglish(page, summary, helveticaBold, helveticaFont);
    this.drawSessionsTableEnglish(page, sessions, settings, helveticaBold, helveticaFont);
    this.drawReportFooterEnglish(page, helveticaFont);
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    this.downloadPdfFile(pdfBytes, `${fileName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to export PDF. Please use JSON export instead.');
  }
}

// English-only methods
private drawReportHeaderEnglish(
  page: PDFPage, 
  boldFont: PDFFont, 
  regularFont: PDFFont
): void {
  const { width } = page.getSize();
  
  // Title - centered
  const title = 'PlayStation Lounge';
  const titleWidth = boldFont.widthOfTextAtSize(title, 24);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: 550,
    size: 24,
    font: boldFont,
    color: rgb(0.173, 0.243, 0.314)
  });
  
  // Subtitle - centered
  const subtitle = 'Sessions Report';
  const subtitleWidth = boldFont.widthOfTextAtSize(subtitle, 18);
  page.drawText(subtitle, {
    x: (width - subtitleWidth) / 2,
    y: 520,
    size: 18,
    font: boldFont,
    color: rgb(0.204, 0.286, 0.369)
  });
  
  // Date - centered
  const dateText = `Report Date: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
  const dateWidth = regularFont.widthOfTextAtSize(dateText, 12);
  page.drawText(dateText, {
    x: (width - dateWidth) / 2,
    y: 490,
    size: 12,
    font: regularFont
  });
  
  // Line separator
  page.drawLine({
    start: { x: 50, y: 470 },
    end: { x: width - 50, y: 470 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8)
  });
}

private drawSummarySectionEnglish(
  page: PDFPage,
  summary: any,
  boldFont: PDFFont,
  regularFont: PDFFont
): void {
  const { width } = page.getSize();
  
  // Section title
  const sectionTitle = 'Summary Statistics';
  page.drawText(sectionTitle, {
    x: 50,
    y: 440,
    size: 14,
    font: boldFont,
    color: rgb(0.173, 0.243, 0.314)
  });
  
  // Summary data - English only
  // Use plain text without currency symbols first
  const summaryData = [
    `Total Sessions: ${summary.totalSessions}`,
    `Paid Sessions: ${summary.paidSessions}`,
    `Unpaid Sessions: ${summary.unpaidSessions}`,
    `Total Revenue: ${summary.totalRevenue.toFixed(2)}`,
    `Total Unpaid: ${summary.totalUnpaid.toFixed(2)}`,
    `Total Hours: ${summary.totalHours.toFixed(2)} hours`
  ];
  
  let currentY = 410;
  summaryData.forEach(text => {
    page.drawText(text, {
      x: 50,
      y: currentY,
      size: 12,
      font: regularFont
    });
    currentY -= 20;
  });
  
  // Line separator
  page.drawLine({
    start: { x: 50, y: 360 },
    end: { x: width - 50, y: 360 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8)
  });
}

private drawSessionsTableEnglish(
  page: PDFPage,
  sessions: Session[],
  settings: any,
  boldFont: PDFFont,
  regularFont: PDFFont
): void {
  const { width } = page.getSize();
  
  // Table title
  const tableTitle = 'Session Details';
  page.drawText(tableTitle, {
    x: 50,
    y: 335,
    size: 14,
    font: boldFont,
    color: rgb(0.173, 0.243, 0.314)
  });
  
  // Table headers - English only
  const headers = ['Date', 'Device', 'Players', 'Customer', 'Start', 'End', 'Hours', 'Total', 'Status'];
  const columnWidth = (width - 100) / headers.length;
  
  // Table headers background
  page.drawRectangle({
    x: 50,
    y: 295,
    width: width - 100,
    height: 30,
    color: rgb(0.204, 0.596, 0.859),
  });
  
  // Draw headers
  headers.forEach((header, index) => {
    const headerWidth = boldFont.widthOfTextAtSize(header, 11);
    const xPos = 55 + (index * columnWidth) + (columnWidth - headerWidth) / 2;
    page.drawText(header, {
      x: xPos,
      y: 303,
      size: 11,
      font: boldFont,
      color: rgb(1, 1, 1)
    });
  });
  
  // Draw table rows
  let currentY = 265;
  const maxRows = Math.min(sessions.length, 15);
  
  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    const session = sessions[rowIndex];
    const duration = session.endTime 
      ? (new Date(session.endTime).getTime() - new Date(session.startTime).getTime() - session.totalPausedDuration) / (1000 * 60 * 60)
      : 0;
    
    const sessionCost = this.calculateSessionCost(session, settings);
    const ordersTotal = this.calculateOrdersTotal(session);
    const total = sessionCost + ordersTotal;
    
    // English data only - use plain numbers for currency
    const rowData = [
      format(new Date(session.createdAt), 'dd/MM/yy'),
      session.deviceName,
      session.playerCount === '1-2' ? '1-2' : '3-4',
      session.customerName || 'Customer',
      format(new Date(session.startTime), 'HH:mm'),
      session.endTime ? format(new Date(session.endTime), 'HH:mm') : 'Active',
      duration.toFixed(2),
      total.toFixed(2),
      session.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'
    ];
    
    // Draw row cells
    rowData.forEach((cell, cellIndex) => {
      const cellText = cell.toString();
      const cellWidth = regularFont.widthOfTextAtSize(cellText, 10);
      
      let xPos = 55 + (cellIndex * columnWidth);
      // Center numeric columns
      if (cellIndex === 6 || cellIndex === 7) {
        xPos += (columnWidth - cellWidth) / 2;
      }
      
      const color = cellIndex === 8 
        ? (session.paymentStatus === 'paid' ? rgb(0, 0.5, 0) : rgb(1, 0.5, 0))
        : rgb(0, 0, 0);
      
      page.drawText(cellText, {
        x: xPos,
        y: currentY,
        size: 10,
        font: regularFont,
        color: color,
        maxWidth: columnWidth - 10
      });
    });
    
    currentY -= 25;
    
    // Stop if we're running out of space
    if (currentY < 50) {
      break;
    }
  }
}

private drawReportFooterEnglish(
  page: PDFPage,
  regularFont: PDFFont
): void {
  const { width } = page.getSize();
  
  const footerText = `Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
  const footerWidth = regularFont.widthOfTextAtSize(footerText, 9);
  
  page.drawText(footerText, {
    x: (width - footerWidth) / 2,
    y: 30,
    size: 9,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4)
  });
}

  // Export invoice for a single session
  async exportSessionInvoice(session: Session): Promise<void> {
  try {
    const settings = this.sessionService.getSettings();
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Use standard fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add a page (A5 portrait)
    const page = pdfDoc.addPage([420, 595]); // A5 portrait dimensions in points
    
    // Draw invoice in English
    this.drawInvoiceHeaderEnglish(page, helveticaBold, helveticaFont);
    this.drawInvoiceDetailsEnglish(page, session, settings, helveticaBold, helveticaFont);
    this.drawInvoiceTableEnglish(page, session, settings, helveticaBold, helveticaFont);
    this.drawInvoiceFooterEnglish(page, helveticaFont, session);
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    this.downloadPdfFile(pdfBytes, `invoice-${session.id}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
  } catch (error) {
    console.error('Invoice export error:', error);
    throw new Error('Failed to generate invoice.');
  }
}

// English invoice methods
private drawInvoiceHeaderEnglish(
  page: PDFPage,
  boldFont: PDFFont,
  regularFont: PDFFont
): void {
  const { width, height } = page.getSize();
  
  // Title
  const title = 'PlayStation Lounge';
  const titleWidth = boldFont.widthOfTextAtSize(title, 20);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: height - 50,
    size: 20,
    font: boldFont,
    color: rgb(0.173, 0.243, 0.314)
  });
  
  // Subtitle
  const subtitle = 'Session Invoice';
  const subtitleWidth = boldFont.widthOfTextAtSize(subtitle, 16);
  page.drawText(subtitle, {
    x: (width - subtitleWidth) / 2,
    y: height - 80,
    size: 16,
    font: boldFont,
    color: rgb(0.204, 0.286, 0.369)
  });
  
  // Line separator
  page.drawLine({
    start: { x: 40, y: height - 100 },
    end: { x: width - 40, y: height - 100 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8)
  });
}

private drawInvoiceDetailsEnglish(
  page: PDFPage,
  session: Session,
  settings: any,
  boldFont: PDFFont,
  regularFont: PDFFont
): void {
  const { width, height } = page.getSize();
  
  // Left column
  page.drawText(`Invoice #: ${session.id}`, {
    x: 40,
    y: height - 130,
    size: 12,
    font: regularFont
  });
  
  page.drawText(`Date: ${format(new Date(session.createdAt), 'dd/MM/yyyy HH:mm')}`, {
    x: 40,
    y: height - 150,
    size: 12,
    font: regularFont
  });
  
  // Right column
  page.drawText(`Customer: ${session.customerName || 'Customer'}`, {
    x: width - 200,
    y: height - 130,
    size: 12,
    font: regularFont
  });
  
  page.drawText(`Device: ${session.deviceName}`, {
    x: width - 200,
    y: height - 150,
    size: 12,
    font: regularFont
  });
  
  // Line separator
  page.drawLine({
    start: { x: 40, y: height - 170 },
    end: { x: width - 40, y: height - 170 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8)
  });
}

private drawInvoiceTableEnglish(
  page: PDFPage,
  session: Session,
  settings: any,
  boldFont: PDFFont,
  regularFont: PDFFont
): void {
  const { width, height } = page.getSize();
  
  const sessionCost = this.calculateSessionCost(session, settings);
  const ordersTotal = this.calculateOrdersTotal(session);
  const grandTotal = sessionCost + ordersTotal;
  
  const duration = session.endTime 
    ? (new Date(session.endTime).getTime() - new Date(session.startTime).getTime() - session.totalPausedDuration) / (1000 * 60 * 60)
    : 0;
  
  // Table headers
  const headers = ['Description', 'Quantity', 'Price', 'Total'];
  const columnWidth = (width - 80) / headers.length;
  
  // Table headers background
  page.drawRectangle({
    x: 40,
    y: height - 220,
    width: width - 80,
    height: 25,
    color: rgb(0.204, 0.596, 0.859),
  });
  
  // Draw headers
  headers.forEach((header, index) => {
    const headerWidth = boldFont.widthOfTextAtSize(header, 11);
    const xPos = 45 + (index * columnWidth) + (columnWidth - headerWidth) / 2;
    page.drawText(header, {
      x: xPos,
      y: height - 215,
      size: 11,
      font: boldFont,
      color: rgb(1, 1, 1)
    });
  });
  
  let currentY = height - 250;
  
  // Session row - use plain numbers
  page.drawText('Play Time', {
    x: 45,
    y: currentY,
    size: 11,
    font: regularFont
  });
  
  const durationText = `${duration.toFixed(2)} hours`;
  const durationWidth = regularFont.widthOfTextAtSize(durationText, 11);
  page.drawText(durationText, {
    x: 45 + columnWidth + (columnWidth - durationWidth) / 2,
    y: currentY,
    size: 11,
    font: regularFont
  });
  
  const ratePerHour = session.playerCount === '1-2' 
    ? settings.rates.rateOneTwoPlayers 
    : settings.rates.rateThreeFourPlayers;
  
  const rateText = `${ratePerHour.toFixed(2)}/hour`; // Plain number
  const rateWidth = regularFont.widthOfTextAtSize(rateText, 11);
  page.drawText(rateText, {
    x: 45 + (columnWidth * 2) + (columnWidth - rateWidth) / 2,
    y: currentY,
    size: 11,
    font: regularFont
  });
  
  const sessionCostText = sessionCost.toFixed(2); // Plain number
  const sessionCostWidth = regularFont.widthOfTextAtSize(sessionCostText, 11);
  page.drawText(sessionCostText, {
    x: 45 + (columnWidth * 3) + (columnWidth - sessionCostWidth) / 2,
    y: currentY,
    size: 11,
    font: regularFont
  });
  
  currentY -= 25;
  
  // Orders rows - use plain numbers
  session.orders.forEach(order => {
    page.drawText(order.itemName, {
      x: 45,
      y: currentY,
      size: 11,
      font: regularFont
    });
    
    const quantityText = order.quantity.toString();
    const quantityWidth = regularFont.widthOfTextAtSize(quantityText, 11);
    page.drawText(quantityText, {
      x: 45 + columnWidth + (columnWidth - quantityWidth) / 2,
      y: currentY,
      size: 11,
      font: regularFont
    });
    
    const unitPriceText = order.unitPrice.toFixed(2); // Plain number
    const unitPriceWidth = regularFont.widthOfTextAtSize(unitPriceText, 11);
    page.drawText(unitPriceText, {
      x: 45 + (columnWidth * 2) + (columnWidth - unitPriceWidth) / 2,
      y: currentY,
      size: 11,
      font: regularFont
    });
    
    const totalPriceText = order.totalPrice.toFixed(2); // Plain number
    const totalPriceWidth = regularFont.widthOfTextAtSize(totalPriceText, 11);
    page.drawText(totalPriceText, {
      x: 45 + (columnWidth * 3) + (columnWidth - totalPriceWidth) / 2,
      y: currentY,
      size: 11,
      font: regularFont
    });
    
    currentY -= 25;
  });
  
  // Total row
  currentY -= 10;
  
  page.drawText('TOTAL', {
    x: 45,
    y: currentY,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  const grandTotalText = grandTotal.toFixed(2); // Plain number
  const grandTotalWidth = boldFont.widthOfTextAtSize(grandTotalText, 12);
  page.drawText(grandTotalText, {
    x: 45 + (columnWidth * 3) + (columnWidth - grandTotalWidth) / 2,
    y: currentY,
    size: 12,
    font: boldFont,
    color: rgb(0, 0, 0)
  });
  
  // Payment status
  currentY -= 40;
  
  const paymentText = `Status: ${session.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}`;
  page.drawText(paymentText, {
    x: 40,
    y: currentY,
    size: 12,
    font: boldFont,
    color: session.paymentStatus === 'paid' ? rgb(0, 0.5, 0) : rgb(1, 0.5, 0)
  });
}

private drawInvoiceFooterEnglish(
  page: PDFPage,
  regularFont: PDFFont,
  session: Session
): void {
  const { width } = page.getSize();
  
  const footerText = 'Thank you for your visit!';
  const footerWidth = regularFont.widthOfTextAtSize(footerText, 11);
  
  page.drawText(footerText, {
    x: (width - footerWidth) / 2,
    y: 50,
    size: 11,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4)
  });
}


  // Existing private helper methods
  private prepareSessionForExport(session: Session): any {
    return {
      ...session,
      startTime: format(new Date(session.startTime), 'yyyy-MM-dd HH:mm:ss'),
      endTime: session.endTime ? format(new Date(session.endTime), 'yyyy-MM-dd HH:mm:ss') : null,
      pauseStartTime: session.pauseStartTime ? format(new Date(session.pauseStartTime), 'yyyy-MM-dd HH:mm:ss') : null,
      createdAt: format(new Date(session.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      orders: session.orders.map(order => ({
        ...order,
        createdAt: format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm:ss')
      }))
    };
  }

  private generateSummary(sessions: Session[]): any {
    const endedSessions = sessions.filter(s => s.endTime);
    
    const totalRevenue = endedSessions
      .filter(s => s.paymentStatus === 'paid')
      .reduce((total, session) => {
        const settings = this.sessionService.getSettings();
        return total + this.calculateSessionCost(session, settings) + this.calculateOrdersTotal(session);
      }, 0);
    
    const totalUnpaid = endedSessions
      .filter(s => s.paymentStatus === 'unpaid')
      .reduce((total, session) => {
        const settings = this.sessionService.getSettings();
        return total + this.calculateSessionCost(session, settings) + this.calculateOrdersTotal(session);
      }, 0);
    
    const totalHours = endedSessions.reduce((total, session) => {
      const duration = (new Date(session.endTime!).getTime() - new Date(session.startTime).getTime() - session.totalPausedDuration) / (1000 * 60 * 60);
      return total + duration;
    }, 0);
    
    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => !s.endTime).length,
      endedSessions: endedSessions.length,
      paidSessions: endedSessions.filter(s => s.paymentStatus === 'paid').length,
      unpaidSessions: endedSessions.filter(s => s.paymentStatus === 'unpaid').length,
      totalRevenue,
      totalUnpaid,
      totalHours
    };
  }

  private calculateSessionCost(session: Session, settings: any): number {
    if (!session.endTime) return 0;
    
    const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime() - session.totalPausedDuration) / (1000 * 60 * 60);
    const rate = session.playerCount === '1-2' 
      ? settings.rates.rateOneTwoPlayers 
      : settings.rates.rateThreeFourPlayers;
    
    return duration * rate;
  }

  private calculateOrdersTotal(session: Session): number {
    return session.orders.reduce((total, order) => total + order.totalPrice, 0);
  }

  private downloadFile(data: string, fileName: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

private downloadPdfFile(pdfBytes: Uint8Array, fileName: string): void {
  try {
    // Convert to regular ArrayBuffer to avoid SharedArrayBuffer issues
    const arrayBuffer = new ArrayBuffer(pdfBytes.length);
    const view = new Uint8Array(arrayBuffer);
    view.set(pdfBytes);
    
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}
}