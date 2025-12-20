import * as XLSX from 'xlsx';

// ====================================
// EXPORT EXCEL
// ====================================

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: (value: any) => string;
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string = 'export'
): void {
  // Prepara i dati con le colonne specificate
  const exportData = data.map(row => {
    const exportRow: Record<string, any> = {};
    columns.forEach(col => {
      const value = row[col.key];
      exportRow[col.header] = col.format ? col.format(value) : value;
    });
    return exportRow;
  });

  // Crea workbook e worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();

  // Imposta larghezza colonne
  const colWidths = columns.map(col => ({ wch: col.width || 15 }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Dati');

  // Genera e scarica il file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
}

// ====================================
// EXPORT CSV
// ====================================

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string = 'export'
): void {
  // Header
  const headers = columns.map(col => col.header).join(';');

  // Rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key];
      const formatted = col.format ? col.format(value) : value;
      // Escape semicolons and quotes
      if (typeof formatted === 'string') {
        return `"${formatted.replace(/"/g, '""')}"`;
      }
      return formatted ?? '';
    }).join(';');
  });

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ====================================
// FORMATTATORI COMUNI
// ====================================

export const formatters = {
  currency: (value: number) => 
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0),
  
  date: (value: string) => 
    value ? new Date(value).toLocaleDateString('it-IT') : '',
  
  dateTime: (value: string) => 
    value ? new Date(value).toLocaleString('it-IT') : '',
  
  percentage: (value: number) => 
    `${(value || 0).toFixed(1)}%`,
  
  boolean: (value: boolean) => 
    value ? 'Sì' : 'No',
  
  capitalize: (value: string) => 
    value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '',
};

// ====================================
// GENERAZIONE PDF (HTML to Print)
// ====================================

interface PDFOptions {
  title: string;
  subtitle?: string;
  logoUrl?: string;
  companyInfo?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    piva?: string;
  };
  footer?: string;
}

export function generatePrintableHTML(
  content: string,
  options: PDFOptions
): string {
  const { title, subtitle, logoUrl, companyInfo, footer } = options;

  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page { 
          margin: 2cm; 
          size: A4;
        }
        * { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0; 
        }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1a1a1a;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #2563eb;
        }
        .logo {
          max-height: 60px;
        }
        .company-info {
          text-align: right;
          font-size: 9pt;
          color: #666;
        }
        .company-name {
          font-size: 14pt;
          font-weight: bold;
          color: #1a1a1a;
          margin-bottom: 5px;
        }
        .document-title {
          font-size: 20pt;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 5px;
        }
        .document-subtitle {
          font-size: 12pt;
          color: #666;
          margin-bottom: 20px;
        }
        .content {
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          font-size: 9pt;
          letter-spacing: 0.5px;
        }
        tr:hover {
          background: #f9fafb;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 9pt;
          color: #666;
        }
        .totals {
          margin-top: 20px;
          text-align: right;
        }
        .totals table {
          width: auto;
          margin-left: auto;
        }
        .totals td {
          padding: 8px 15px;
        }
        .totals .total-row {
          font-weight: bold;
          font-size: 14pt;
          background: #f0f9ff;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo" />` : ''}
          <h1 class="document-title">${title}</h1>
          ${subtitle ? `<p class="document-subtitle">${subtitle}</p>` : ''}
        </div>
        ${companyInfo ? `
          <div class="company-info">
            <div class="company-name">${companyInfo.name}</div>
            ${companyInfo.address ? `<div>${companyInfo.address}</div>` : ''}
            ${companyInfo.phone ? `<div>Tel: ${companyInfo.phone}</div>` : ''}
            ${companyInfo.email ? `<div>${companyInfo.email}</div>` : ''}
            ${companyInfo.piva ? `<div>P.IVA: ${companyInfo.piva}</div>` : ''}
          </div>
        ` : ''}
      </div>
      
      <div class="content">
        ${content}
      </div>
      
      ${footer ? `<div class="footer">${footer}</div>` : ''}
    </body>
    </html>
  `;
}

export function printDocument(html: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

// ====================================
// EXPORT FATTURA
// ====================================

interface FatturaData {
  numero: string;
  data: string;
  scadenza: string;
  tipo: string;
  cliente_fornitore: string;
  descrizione?: string;
  imponibile: number;
  aliquota_iva: number;
  iva?: number;
  totale?: number;
}

export function exportFatturaToPrint(
  fattura: FatturaData,
  companyInfo?: PDFOptions['companyInfo']
): void {
  const iva = fattura.iva || (fattura.imponibile * fattura.aliquota_iva / 100);
  const totale = fattura.totale || (fattura.imponibile + iva);

  const content = `
    <table style="margin-bottom: 30px;">
      <tr>
        <td style="width: 50%;">
          <strong>Numero Fattura:</strong> ${fattura.numero}<br>
          <strong>Data:</strong> ${new Date(fattura.data).toLocaleDateString('it-IT')}<br>
          <strong>Scadenza:</strong> ${new Date(fattura.scadenza).toLocaleDateString('it-IT')}
        </td>
        <td style="width: 50%;">
          <strong>${fattura.tipo === 'attiva' ? 'Cliente' : 'Fornitore'}:</strong><br>
          ${fattura.cliente_fornitore}
        </td>
      </tr>
    </table>

    ${fattura.descrizione ? `
      <div style="margin-bottom: 30px;">
        <strong>Descrizione:</strong><br>
        ${fattura.descrizione}
      </div>
    ` : ''}

    <div class="totals">
      <table>
        <tr>
          <td>Imponibile:</td>
          <td style="text-align: right;">€ ${fattura.imponibile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td>IVA (${fattura.aliquota_iva}%):</td>
          <td style="text-align: right;">€ ${iva.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr class="total-row">
          <td>Totale:</td>
          <td style="text-align: right;">€ ${totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>
    </div>
  `;

  const html = generatePrintableHTML(content, {
    title: `Fattura ${fattura.numero}`,
    subtitle: fattura.tipo === 'attiva' ? 'Fattura Attiva' : 'Fattura Passiva',
    companyInfo,
    footer: 'Documento generato da E-gest',
  });

  printDocument(html);
}
