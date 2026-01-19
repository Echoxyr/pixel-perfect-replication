import { useState, useMemo, useRef } from 'react';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { 
  SAL, 
  ContrattoLavorazione, 
  TipoLavorazione,
  StatoSAL,
  StatoContratto,
  PrevisioneSAL,
  generateId, 
  formatCurrency, 
  formatDateFull,
  TIPO_LAVORAZIONE_LABELS,
  STATO_SAL_LABELS,
  STATO_SAL_COLORS,
  STATO_CONTRATTO_LABELS
} from '@/types/workhub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  TrendingUp,
  Euro,
  Calendar,
  FileText,
  BarChart3,
  GanttChart,
  Trash2,
  Edit,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SALComparisonChart } from '@/components/workhub/SALComparisonChart';
import VariantiManager from '@/components/workhub/VariantiManager';
import * as XLSX from 'xlsx';

export default function SALPage() {
  const { cantieri, imprese, sal, contratti, previsioni, addSAL, updateSAL, deleteSAL, addContratto, updateContratto, deleteContratto, addPrevisione } = useWorkHub();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedCantiereId, setSelectedCantiereId] = useState<string>('all');
  const [selectedTipoLavorazione, setSelectedTipoLavorazione] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewSALDialog, setShowNewSALDialog] = useState(false);
  const [showNewContrattoDialog, setShowNewContrattoDialog] = useState(false);
  const [showNewPrevisioneDialog, setShowNewPrevisioneDialog] = useState(false);
  const [editingSAL, setEditingSAL] = useState<SAL | null>(null);

  // Previsione Form
  const [previsioneForm, setPrevisioneForm] = useState({
    cantiereId: '',
    mese: new Date().toISOString().slice(0, 7),
    tipoLavorazione: 'elettrico' as TipoLavorazione,
    importoPrevisto: 0,
    percentualePrevista: 0,
    note: ''
  });

  // Handle Excel file upload for previsioni
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let imported = 0;
        jsonData.forEach((row: any) => {
          // Expected columns: cantiereId/cantiere, mese, tipoLavorazione/tipo, importoPrevisto/importo, percentualePrevista/percentuale, note
          const cantiereId = row.cantiereId || row.cantiere || selectedCantiereId;
          const mese = row.mese || new Date().toISOString().slice(0, 7);
          const tipoLavorazione = row.tipoLavorazione || row.tipo || 'elettrico';
          const importoPrevisto = parseFloat(row.importoPrevisto || row.importo || 0);
          const percentualePrevista = parseFloat(row.percentualePrevista || row.percentuale || 0);
          const note = row.note || '';

          if (cantiereId && cantiereId !== 'all' && importoPrevisto > 0) {
            addPrevisione({
              cantiereId,
              mese,
              tipoLavorazione: tipoLavorazione as TipoLavorazione,
              importoPrevisto,
              percentualePrevista,
              note
            });
            imported++;
          }
        });

        toast({ 
          title: "Import completato", 
          description: `${imported} previsioni importate da ${file.name}` 
        });
      } catch (error) {
        toast({ 
          title: "Errore import", 
          description: "Formato file non valido", 
          variant: "destructive" 
        });
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  // Download template Excel
  const downloadTemplate = () => {
    const template = [
      { cantiere: 'ID_CANTIERE', mese: '2024-01', tipo: 'elettrico', importo: 50000, percentuale: 10, note: 'Previsione gennaio' },
      { cantiere: 'ID_CANTIERE', mese: '2024-02', tipo: 'elettrico', importo: 75000, percentuale: 25, note: 'Previsione febbraio' },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Previsioni');
    XLSX.writeFile(wb, 'template_previsioni_sal.xlsx');
  };

  // Generate professional HTML document for SAL
  const generateSALDocument = (salItem: SAL): string => {
    const cantiere = cantieri.find(c => c.id === salItem.cantiereId);
    const contratto = contratti.find(c => c.cantiereId === salItem.cantiereId && c.tipoLavorazione === salItem.tipoLavorazione);
    const impresa = contratto ? imprese.find(i => i.id === contratto.impresaId) : undefined;
    
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const importoVarianti = contratto?.importoVarianti || 0;
    const importoTotaleContratto = salItem.importoContratto + importoVarianti;
    const ritenutaPerc = contratto?.ritenute || 5;
    const importoRitenuta = salItem.importoLavoriPeriodo * (ritenutaPerc / 100);
    const importoNettoFatturare = salItem.importoLavoriPeriodo - importoRitenuta;
    const lavoriDaEseguire = importoTotaleContratto - salItem.importoLavoriEseguiti;

    return `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <title>SAL ${salItem.numeroSAL} - ${cantiere?.codiceCommessa || 'Documento'}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #1a1a1a;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .document-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 25mm 20mm;
            min-height: 297mm;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 15px;
            border-bottom: 2px solid #2563eb;
            margin-bottom: 20px;
          }
          .company-info {
            flex: 1;
          }
          .company-name {
            font-size: 16pt;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .company-details {
            font-size: 9pt;
            color: #4b5563;
            line-height: 1.5;
          }
          .document-number {
            text-align: right;
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
          }
          .document-number h2 {
            margin: 0;
            font-size: 11pt;
            font-weight: 600;
            letter-spacing: 1px;
          }
          .document-number .sal-num {
            font-size: 20pt;
            font-weight: 700;
            margin-top: 5px;
          }
          .document-title {
            text-align: center;
            font-size: 14pt;
            font-weight: 700;
            color: #1e40af;
            margin: 25px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
            padding: 15px;
            background: #eff6ff;
            border-radius: 6px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
          }
          .info-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            border-left: 4px solid #2563eb;
          }
          .info-box h3 {
            margin: 0 0 12px 0;
            font-size: 10pt;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
          }
          .info-box .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 9pt;
          }
          .info-box .label {
            color: #6b7280;
            font-weight: 500;
          }
          .info-box .value {
            color: #1f2937;
            font-weight: 600;
            text-align: right;
          }
          .sal-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 9pt;
          }
          .sal-table th {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .sal-table th:last-child {
            text-align: right;
          }
          .sal-table td {
            padding: 10px 15px;
            border-bottom: 1px solid #e2e8f0;
          }
          .sal-table td:last-child {
            text-align: right;
            font-weight: 600;
            font-family: 'Consolas', monospace;
          }
          .sal-table tr:nth-child(even) {
            background: #f8fafc;
          }
          .sal-table tr.subtotal {
            background: #eff6ff;
            font-weight: 600;
          }
          .sal-table tr.total {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            font-weight: 700;
          }
          .sal-table tr.total td {
            border: none;
            font-size: 10pt;
          }
          .progress-section {
            margin: 25px 0;
            padding: 20px;
            background: #f0fdf4;
            border-radius: 8px;
            border: 1px solid #bbf7d0;
          }
          .progress-section h3 {
            margin: 0 0 15px 0;
            color: #166534;
            font-size: 11pt;
          }
          .progress-bar-container {
            background: #dcfce7;
            border-radius: 10px;
            height: 25px;
            overflow: hidden;
            position: relative;
          }
          .progress-bar {
            background: linear-gradient(90deg, #22c55e, #16a34a);
            height: 100%;
            border-radius: 10px;
            transition: width 0.3s;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 10px;
            color: white;
            font-weight: 700;
            font-size: 11pt;
          }
          .notes-section {
            margin: 25px 0;
            padding: 15px;
            background: #fffbeb;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
          }
          .notes-section h3 {
            margin: 0 0 10px 0;
            color: #b45309;
            font-size: 10pt;
          }
          .notes-section p {
            margin: 0;
            color: #78350f;
            font-style: italic;
          }
          .signature-section {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .signature-box {
            text-align: center;
            padding: 20px;
            border: 1px dashed #d1d5db;
            border-radius: 8px;
            background: #fafafa;
          }
          .signature-box h4 {
            margin: 0 0 30px 0;
            font-size: 10pt;
            color: #374151;
            font-weight: 600;
          }
          .signature-line {
            border-top: 1px solid #1f2937;
            padding-top: 8px;
            margin-top: 50px;
            font-size: 9pt;
            color: #6b7280;
          }
          .signature-date {
            margin-top: 15px;
            font-size: 9pt;
            color: #6b7280;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 8pt;
            color: #9ca3af;
          }
          .toolbar {
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 1000;
          }
          .toolbar button {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 11pt;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .toolbar button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.25);
          }
          .btn-print {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
          }
          .btn-close {
            background: #6b7280;
            color: white;
          }
          [contenteditable="true"] {
            outline: 2px dashed #3b82f6;
            outline-offset: 2px;
            border-radius: 4px;
            padding: 2px 4px;
            min-width: 50px;
            background: #fef3c7;
          }
          [contenteditable="true"]:focus {
            outline-color: #1e40af;
            background: #fef9c3;
          }
        </style>
      </head>
      <body>
        <div class="document-container">
          <!-- Header -->
          <div class="header">
            <div class="company-info">
              <div class="company-name" contenteditable="true">GEST-E S.r.l.</div>
              <div class="company-details">
                <span contenteditable="true">Via Example 123, 35100 Padova (PD)</span><br>
                <span contenteditable="true">P.IVA: IT01234567890</span> | <span contenteditable="true">Tel: +39 049 1234567</span><br>
                <span contenteditable="true">info@gest-e.it</span> | <span contenteditable="true">PEC: gest-e@pec.it</span>
              </div>
            </div>
            <div class="document-number">
              <h2>STATO AVANZAMENTO LAVORI</h2>
              <div class="sal-num">N° ${salItem.numeroSAL}</div>
            </div>
          </div>

          <!-- Title -->
          <div class="document-title">
            Certificato Stato Avanzamento Lavori
          </div>

          <!-- Info Grid -->
          <div class="info-grid">
            <div class="info-box">
              <h3>📋 Dati Commessa</h3>
              <div class="row"><span class="label">Codice:</span><span class="value">${cantiere?.codiceCommessa || '-'}</span></div>
              <div class="row"><span class="label">Denominazione:</span><span class="value">${cantiere?.nome || '-'}</span></div>
              <div class="row"><span class="label">Indirizzo:</span><span class="value">${cantiere?.indirizzo || '-'}</span></div>
              <div class="row"><span class="label">Committente:</span><span class="value">${cantiere?.committente || '-'}</span></div>
            </div>
            <div class="info-box">
              <h3>🏢 Impresa Esecutrice</h3>
              <div class="row"><span class="label">Ragione Sociale:</span><span class="value">${impresa?.ragioneSociale || '-'}</span></div>
              <div class="row"><span class="label">Tipo Lavorazione:</span><span class="value">${TIPO_LAVORAZIONE_LABELS[salItem.tipoLavorazione]}</span></div>
              <div class="row"><span class="label">Periodo:</span><span class="value">${salItem.mese}</span></div>
              <div class="row"><span class="label">Stato:</span><span class="value">${STATO_SAL_LABELS[salItem.stato]}</span></div>
            </div>
          </div>

          <!-- SAL Table -->
          <table class="sal-table">
            <thead>
              <tr>
                <th>Descrizione</th>
                <th>Importo (€)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Importo Contratto Originale</td>
                <td>${formatCurrency(salItem.importoContratto)}</td>
              </tr>
              <tr>
                <td>Importo Varianti Approvate</td>
                <td contenteditable="true">${formatCurrency(importoVarianti)}</td>
              </tr>
              <tr class="subtotal">
                <td><strong>IMPORTO TOTALE CONTRATTUALE</strong></td>
                <td><strong>${formatCurrency(importoTotaleContratto)}</strong></td>
              </tr>
              <tr><td colspan="2" style="height: 10px; border: none;"></td></tr>
              <tr>
                <td>Lavori a tutto il mese precedente</td>
                <td>${formatCurrency(salItem.importoLavoriPrecedenti)}</td>
              </tr>
              <tr>
                <td>Lavori eseguiti nel periodo corrente</td>
                <td contenteditable="true">${formatCurrency(salItem.importoLavoriPeriodo)}</td>
              </tr>
              <tr class="subtotal">
                <td><strong>TOTALE LAVORI ESEGUITI AD OGGI</strong></td>
                <td><strong>${formatCurrency(salItem.importoLavoriEseguiti)}</strong></td>
              </tr>
              <tr>
                <td>Lavori ancora da eseguire</td>
                <td>${formatCurrency(lavoriDaEseguire)}</td>
              </tr>
              <tr><td colspan="2" style="height: 10px; border: none;"></td></tr>
              <tr>
                <td>Ritenuta a garanzia (${ritenutaPerc}%)</td>
                <td>- ${formatCurrency(importoRitenuta)}</td>
              </tr>
              <tr class="total">
                <td>IMPORTO NETTO A FATTURARE</td>
                <td>${formatCurrency(importoNettoFatturare)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Progress Section -->
          <div class="progress-section">
            <h3>📊 Percentuale Avanzamento Lavori</h3>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: ${Math.min(salItem.percentualeAvanzamento, 100)}%;">
                ${salItem.percentualeAvanzamento.toFixed(1)}%
              </div>
            </div>
          </div>

          <!-- Notes -->
          ${salItem.note ? `
          <div class="notes-section">
            <h3>📝 Note e Osservazioni</h3>
            <p contenteditable="true">${salItem.note}</p>
          </div>
          ` : ''}

          <!-- Signatures -->
          <div class="signature-section">
            <div class="signature-box">
              <h4>DIRETTORE LAVORI</h4>
              <div class="signature-line">Firma e Timbro</div>
              <div class="signature-date">Data: <span contenteditable="true">____/____/________</span></div>
            </div>
            <div class="signature-box">
              <h4>IMPRESA ESECUTRICE</h4>
              <div class="signature-line">Firma e Timbro</div>
              <div class="signature-date">Data: <span contenteditable="true">____/____/________</span></div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            Documento generato da GEST-E il ${new Date().toLocaleString('it-IT')}<br>
            I campi evidenziati in giallo sono editabili prima della stampa
          </div>
        </div>

        <!-- Toolbar -->
        <div class="toolbar no-print">
          <button class="btn-print" onclick="window.print()">
            🖨️ Stampa / Salva PDF
          </button>
          <button class="btn-close" onclick="window.close()">
            ✕ Chiudi
          </button>
        </div>
      </body>
      </html>
    `;
  };

  // Export SAL as professional editable document
  const exportSALDocument = (salItem: SAL) => {
    const htmlContent = generateSALDocument(salItem);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      toast({ 
        title: 'Documento SAL Aperto', 
        description: 'Modifica i campi evidenziati, poi usa "Stampa / Salva PDF" per scaricare' 
      });
    } else {
      toast({ 
        title: 'Errore', 
        description: 'Abilita i popup per aprire il documento', 
        variant: 'destructive' 
      });
    }
  };

  const handleCreatePrevisione = () => {
    if (!previsioneForm.cantiereId) {
      toast({ title: "Errore", description: "Seleziona un cantiere", variant: "destructive" });
      return;
    }

    addPrevisione(previsioneForm);
    toast({ title: "Previsione creata", description: `Previsione per ${previsioneForm.mese} aggiunta` });
    setPrevisioneForm({
      cantiereId: '',
      mese: new Date().toISOString().slice(0, 7),
      tipoLavorazione: 'elettrico',
      importoPrevisto: 0,
      percentualePrevista: 0,
      note: ''
    });
    setShowNewPrevisioneDialog(false);
  };
  
  // SAL Form - now with contrattoId for auto-population
  const [salForm, setSalForm] = useState({
    cantiereId: '',
    contrattoId: '', // NEW: select existing contract
    impresaId: '',
    numeroSAL: 1,
    mese: new Date().toISOString().slice(0, 7),
    tipoLavorazione: 'elettrico' as TipoLavorazione,
    stato: 'in_preparazione' as StatoSAL,
    importoContratto: 0,
    importoLavoriEseguiti: 0,
    importoLavoriPrecedenti: 0,
    importoLavoriPeriodo: 0,
    note: ''
  });

  // Contratto Form - with all new fields
  const [contrattoForm, setContrattoForm] = useState({
    codiceContratto: '',
    cantiereId: '',
    impresaId: '',
    tipoLavorazione: 'elettrico' as TipoLavorazione,
    descrizione: '',
    importoContratto: 0,
    importoVarianti: 0,
    ritenute: 5, // default 5%
    anticipi: 0,
    stato: 'attivo' as StatoContratto,
    dataInizio: '',
    dataFine: '',
    note: ''
  });

  // Get contracts for selected cantiere
  const contrattiForCantiere = useMemo(() => {
    if (!salForm.cantiereId) return [];
    return contratti.filter(c => c.cantiereId === salForm.cantiereId);
  }, [contratti, salForm.cantiereId]);

  // Handle contract selection - auto-populate amounts
  const handleContrattoSelect = (contrattoId: string) => {
    const selectedContratto = contratti.find(c => c.id === contrattoId);
    if (selectedContratto) {
      // Calculate lavori precedenti from existing SAL for this contract
      const previousSAL = sal.filter(s => 
        s.cantiereId === selectedContratto.cantiereId && 
        s.tipoLavorazione === selectedContratto.tipoLavorazione
      );
      const lavoriPrecedenti = previousSAL.reduce((sum, s) => sum + s.importoLavoriPeriodo, 0);
      
      setSalForm({
        ...salForm,
        contrattoId,
        impresaId: selectedContratto.impresaId,
        tipoLavorazione: selectedContratto.tipoLavorazione,
        importoContratto: selectedContratto.importoTotale,
        importoLavoriPrecedenti: lavoriPrecedenti,
        importoLavoriEseguiti: lavoriPrecedenti
      });
    }
  };

  const activeCantieri = cantieri.filter(c => c.stato === 'attivo');

  // Filter SAL
  const filteredSAL = useMemo(() => {
    return sal.filter(s => {
      if (selectedCantiereId !== 'all' && s.cantiereId !== selectedCantiereId) return false;
      if (selectedTipoLavorazione !== 'all' && s.tipoLavorazione !== selectedTipoLavorazione) return false;
      return true;
    });
  }, [sal, selectedCantiereId, selectedTipoLavorazione]);

  // Filter Contratti
  const filteredContratti = useMemo(() => {
    return contratti.filter(c => {
      if (selectedCantiereId !== 'all' && c.cantiereId !== selectedCantiereId) return false;
      if (selectedTipoLavorazione !== 'all' && c.tipoLavorazione !== selectedTipoLavorazione) return false;
      return true;
    });
  }, [contratti, selectedCantiereId, selectedTipoLavorazione]);

  // Stats
  const stats = useMemo(() => {
    const filtered = selectedCantiereId !== 'all' 
      ? sal.filter(s => s.cantiereId === selectedCantiereId)
      : sal;
    
    const filteredContr = selectedCantiereId !== 'all'
      ? contratti.filter(c => c.cantiereId === selectedCantiereId)
      : contratti;

    const totaleContratti = filteredContr.reduce((sum, c) => sum + c.importoTotale, 0);
    const totaleLavoriEseguiti = filtered.reduce((sum, s) => sum + s.importoLavoriEseguiti, 0);
    const avanzamentoMedio = totaleContratti > 0 ? (totaleLavoriEseguiti / totaleContratti) * 100 : 0;
    const salApprovati = filtered.filter(s => s.stato === 'approvato' || s.stato === 'pagato').length;
    const salInAttesa = filtered.filter(s => s.stato === 'presentato').length;

    return {
      totaleContratti,
      totaleLavoriEseguiti,
      avanzamentoMedio,
      salApprovati,
      salInAttesa,
      totaleSAL: filtered.length
    };
  }, [sal, contratti, selectedCantiereId]);

  const getCantiereName = (id: string) => {
    const c = cantieri.find(c => c.id === id);
    return c ? `${c.codiceCommessa} - ${c.nome}` : '-';
  };

  const handleCreateSAL = () => {
    if (!salForm.cantiereId) {
      toast({ title: "Errore", description: "Seleziona un cantiere", variant: "destructive" });
      return;
    }

    const percentuale = salForm.importoContratto > 0 
      ? (salForm.importoLavoriEseguiti / salForm.importoContratto) * 100 
      : 0;

    addSAL({
      ...salForm,
      percentualeAvanzamento: percentuale,
      vociSAL: []
    });

    toast({ title: "SAL creato", description: `SAL n.${salForm.numeroSAL} aggiunto` });
    setSalForm({
      cantiereId: '',
      contrattoId: '',
      impresaId: '',
      numeroSAL: sal.length + 2,
      mese: new Date().toISOString().slice(0, 7),
      tipoLavorazione: 'elettrico',
      stato: 'in_preparazione',
      importoContratto: 0,
      importoLavoriEseguiti: 0,
      importoLavoriPrecedenti: 0,
      importoLavoriPeriodo: 0,
      note: ''
    });
    setShowNewSALDialog(false);
  };

  const handleCreateContratto = () => {
    if (!contrattoForm.cantiereId || !contrattoForm.impresaId || !contrattoForm.descrizione) {
      toast({ title: "Errore", description: "Compila i campi obbligatori (Cantiere, Impresa, Descrizione)", variant: "destructive" });
      return;
    }

    addContratto({
      codiceContratto: contrattoForm.codiceContratto || `CTR-${Date.now()}`,
      cantiereId: contrattoForm.cantiereId,
      impresaId: contrattoForm.impresaId,
      tipoLavorazione: contrattoForm.tipoLavorazione,
      descrizione: contrattoForm.descrizione,
      importoContratto: contrattoForm.importoContratto,
      importoVarianti: contrattoForm.importoVarianti,
      importoTotale: contrattoForm.importoContratto + contrattoForm.importoVarianti,
      ritenute: contrattoForm.ritenute,
      anticipi: contrattoForm.anticipi,
      stato: contrattoForm.stato,
      dataInizio: contrattoForm.dataInizio,
      dataFine: contrattoForm.dataFine,
      note: contrattoForm.note,
      percentualeAvanzamento: 0
    });

    toast({ title: "Contratto creato", description: `Contratto ${contrattoForm.codiceContratto || 'nuovo'} aggiunto` });
    setContrattoForm({
      codiceContratto: '',
      cantiereId: '',
      impresaId: '',
      tipoLavorazione: 'elettrico',
      descrizione: '',
      importoContratto: 0,
      importoVarianti: 0,
      ritenute: 5,
      anticipi: 0,
      stato: 'attivo',
      dataInizio: '',
      dataFine: '',
      note: ''
    });
    setShowNewContrattoDialog(false);
  };

  const getImpresaName = (id: string) => {
    const i = imprese.find(imp => imp.id === id);
    return i ? i.ragioneSociale : '-';
  };

  const handleDeleteSAL = (id: string) => {
    if (confirm('Eliminare questo SAL?')) {
      deleteSAL(id);
      toast({ title: "SAL eliminato" });
    }
  };

  const handleUpdateSALStatus = (id: string, newStatus: StatoSAL) => {
    updateSAL(id, { stato: newStatus });
    toast({ title: "Stato aggiornato" });
  };

  // Gantt data for timeline
  const ganttData = useMemo(() => {
    return filteredContratti.map(c => ({
      id: c.id,
      name: `${TIPO_LAVORAZIONE_LABELS[c.tipoLavorazione]} - ${getCantiereName(c.cantiereId).split(' - ')[0]}`,
      start: c.dataInizio || new Date().toISOString().slice(0, 10),
      end: c.dataFine || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      progress: c.percentualeAvanzamento,
      tipo: c.tipoLavorazione
    }));
  }, [filteredContratti, cantieri]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SAL - Stato Avanzamento Lavori</h1>
          <p className="text-muted-foreground">Gestione contabilità lavori e SAL mensili</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewContrattoDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuovo Contratto
          </Button>
          <Button onClick={() => setShowNewSALDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuovo SAL
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={selectedCantiereId} onValueChange={setSelectedCantiereId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Seleziona commessa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le commesse</SelectItem>
            {activeCantieri.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.codiceCommessa} - {c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTipoLavorazione} onValueChange={setSelectedTipoLavorazione}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo lavorazione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le lavorazioni</SelectItem>
            {Object.entries(TIPO_LAVORAZIONE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Euro className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Importo Contratti</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(stats.totaleContratti)}</p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-sm text-muted-foreground">Lavori Eseguiti</span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">{formatCurrency(stats.totaleLavoriEseguiti)}</p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-sky-500/10">
              <BarChart3 className="w-5 h-5 text-sky-500" />
            </div>
            <span className="text-sm text-muted-foreground">Avanzamento Medio</span>
          </div>
          <p className="text-2xl font-bold text-sky-500">{stats.avanzamentoMedio.toFixed(1)}%</p>
          <Progress value={stats.avanzamentoMedio} className="h-2 mt-2" />
        </div>
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-sm text-muted-foreground">SAL Totali</span>
          </div>
          <p className="text-2xl font-bold">{stats.totaleSAL}</p>
          <div className="flex gap-2 mt-1 text-xs">
            <span className="text-emerald-500">{stats.salApprovati} approvati</span>
            <span className="text-amber-500">{stats.salInAttesa} in attesa</span>
          </div>
        </div>
      </div>

      {/* SAL Comparison Chart */}
      <SALComparisonChart 
        sal={selectedCantiereId !== 'all' ? sal.filter(s => s.cantiereId === selectedCantiereId) : sal}
        previsioni={selectedCantiereId !== 'all' ? previsioni.filter(p => p.cantiereId === selectedCantiereId) : previsioni}
        cantiereId={selectedCantiereId !== 'all' ? selectedCantiereId : undefined}
        onAddPrevisione={selectedCantiereId !== 'all' ? addPrevisione : undefined}
      />

      {/* Tabs */}
      <Tabs defaultValue="sal" className="w-full overflow-hidden">
        <div className="tabs-scrollable-header">
          <TabsList className="inline-flex w-auto min-w-max">
            <TabsTrigger value="sal">SAL Mensili</TabsTrigger>
            <TabsTrigger value="contratti">Contratti Lavorazioni</TabsTrigger>
            <TabsTrigger value="varianti">Varianti</TabsTrigger>
            <TabsTrigger value="previsioni">Previsioni</TabsTrigger>
            <TabsTrigger value="gantt">Timeline Gantt</TabsTrigger>
          </TabsList>
        </div>

        {/* SAL Tab */}
        <TabsContent value="sal" className="mt-6">
          <div className="space-y-4">
            {filteredSAL.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessun SAL trovato</p>
                <Button onClick={() => setShowNewSALDialog(true)} variant="outline" className="mt-4">
                  Crea il primo SAL
                </Button>
              </div>
            ) : (
              filteredSAL.map(s => (
                <div key={s.id} className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'p-3 rounded-lg',
                        s.tipoLavorazione === 'elettrico' ? 'bg-yellow-500/10' :
                        s.tipoLavorazione === 'meccanico' ? 'bg-blue-500/10' :
                        s.tipoLavorazione === 'idraulico' ? 'bg-cyan-500/10' :
                        'bg-gray-500/10'
                      )}>
                        <Building2 className={cn(
                          'w-6 h-6',
                          s.tipoLavorazione === 'elettrico' ? 'text-yellow-500' :
                          s.tipoLavorazione === 'meccanico' ? 'text-blue-500' :
                          s.tipoLavorazione === 'idraulico' ? 'text-cyan-500' :
                          'text-gray-500'
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">SAL n.{s.numeroSAL} - {s.mese}</h3>
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            s.stato === 'approvato' ? 'bg-emerald-500/20 text-emerald-500' :
                            s.stato === 'pagato' ? 'bg-green-600/20 text-green-500' :
                            s.stato === 'presentato' ? 'bg-primary/20 text-primary' :
                            s.stato === 'contestato' ? 'bg-red-500/20 text-red-500' :
                            'bg-gray-500/20 text-gray-500'
                          )}>
                            {STATO_SAL_LABELS[s.stato]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{getCantiereName(s.cantiereId)}</p>
                        <p className="text-sm text-muted-foreground">{TIPO_LAVORAZIONE_LABELS[s.tipoLavorazione]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(s.importoLavoriPeriodo)}</p>
                      <p className="text-sm text-muted-foreground">Lavori periodo</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={s.percentualeAvanzamento} className="w-24 h-2" />
                        <span className="text-sm font-medium">{s.percentualeAvanzamento.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Importo Contratto</p>
                      <p className="font-medium">{formatCurrency(s.importoContratto)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lavori Precedenti</p>
                      <p className="font-medium">{formatCurrency(s.importoLavoriPrecedenti)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Totale Eseguito</p>
                      <p className="font-medium text-emerald-500">{formatCurrency(s.importoLavoriEseguiti)}</p>
                    </div>
                    <div className="flex-1" />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => exportSALDocument(s)}
                      className="gap-1"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Esporta
                    </Button>
                    <Select 
                      value={s.stato} 
                      onValueChange={(v) => handleUpdateSALStatus(s.id, v as StatoSAL)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATO_SAL_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSAL(s.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Contratti Tab */}
        <TabsContent value="contratti" className="mt-6">
          <div className="space-y-4">
            {filteredContratti.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Euro className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessun contratto lavorazione trovato</p>
                <Button onClick={() => setShowNewContrattoDialog(true)} variant="outline" className="mt-4">
                  Crea il primo contratto
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredContratti.map(c => (
                  <div key={c.id} className="p-4 rounded-xl border border-border bg-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            c.tipoLavorazione === 'elettrico' ? 'bg-yellow-500/20 text-yellow-500' :
                            c.tipoLavorazione === 'meccanico' ? 'bg-blue-500/20 text-blue-500' :
                            c.tipoLavorazione === 'idraulico' ? 'bg-cyan-500/20 text-cyan-500' :
                            'bg-gray-500/20 text-gray-500'
                          )}>
                            {TIPO_LAVORAZIONE_LABELS[c.tipoLavorazione]}
                          </span>
                        </div>
                        <h3 className="font-semibold">{c.descrizione}</h3>
                        <p className="text-sm text-muted-foreground">{getCantiereName(c.cantiereId)}</p>
                        {c.dataInizio && c.dataFine && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatDateFull(c.dataInizio)} → {formatDateFull(c.dataFine)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Importo Totale</p>
                        <p className="text-xl font-bold">{formatCurrency(c.importoTotale)}</p>
                        <div className="flex items-center gap-2 mt-2 justify-end">
                          <Progress value={c.percentualeAvanzamento} className="w-24 h-2" />
                          <span className="text-sm">{c.percentualeAvanzamento.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4 pt-4 border-t border-border text-sm">
                      <div>
                        <p className="text-muted-foreground">Contratto base</p>
                        <p className="font-medium">{formatCurrency(c.importoContratto)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Varianti</p>
                        <p className="font-medium">{formatCurrency(c.importoVarianti)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Previsioni Tab */}
        <TabsContent value="previsioni" className="mt-6">
          <div className="space-y-4">
            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setShowNewPrevisioneDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Nuova Previsione
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="w-4 h-4" />
                Importa Excel
              </Button>
              <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                <Download className="w-4 h-4" />
                Scarica Template
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Previsioni List */}
            {previsioni.filter(p => selectedCantiereId === 'all' || p.cantiereId === selectedCantiereId).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessuna previsione trovata</p>
                <p className="text-sm mt-2">Crea una previsione manualmente o importa da file Excel</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {previsioni
                  .filter(p => selectedCantiereId === 'all' || p.cantiereId === selectedCantiereId)
                  .sort((a, b) => a.mese.localeCompare(b.mese))
                  .map(p => (
                    <div key={p.id} className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'p-2 rounded-lg',
                            p.tipoLavorazione === 'elettrico' ? 'bg-yellow-500/10' :
                            p.tipoLavorazione === 'meccanico' ? 'bg-blue-500/10' :
                            p.tipoLavorazione === 'idraulico' ? 'bg-cyan-500/10' :
                            'bg-gray-500/10'
                          )}>
                            <TrendingUp className={cn(
                              'w-5 h-5',
                              p.tipoLavorazione === 'elettrico' ? 'text-yellow-500' :
                              p.tipoLavorazione === 'meccanico' ? 'text-blue-500' :
                              p.tipoLavorazione === 'idraulico' ? 'text-cyan-500' :
                              'text-gray-500'
                            )} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{p.mese}</h3>
                              <span className={cn(
                                'px-2 py-0.5 text-xs font-medium rounded-full',
                                p.tipoLavorazione === 'elettrico' ? 'bg-yellow-500/20 text-yellow-500' :
                                p.tipoLavorazione === 'meccanico' ? 'bg-blue-500/20 text-blue-500' :
                                p.tipoLavorazione === 'idraulico' ? 'bg-cyan-500/20 text-cyan-500' :
                                'bg-gray-500/20 text-gray-500'
                              )}>
                                {TIPO_LAVORAZIONE_LABELS[p.tipoLavorazione]}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{getCantiereName(p.cantiereId)}</p>
                            {p.note && <p className="text-xs text-muted-foreground mt-1">{p.note}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(p.importoPrevisto)}</p>
                          <p className="text-sm text-muted-foreground">{p.percentualePrevista.toFixed(1)}% avanzamento</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Gantt Tab */}
        <TabsContent value="gantt" className="mt-6">
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <GanttChart className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Timeline Lavorazioni</h3>
            </div>
            {ganttData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nessuna lavorazione con date definite</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ganttData.map(item => {
                  const start = new Date(item.start);
                  const end = new Date(item.end);
                  const today = new Date();
                  const totalDays = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                  const elapsed = Math.max(0, (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                  const timeProgress = Math.min(100, (elapsed / totalDays) * 100);
                  
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-48 flex-shrink-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateFull(item.start)} - {formatDateFull(item.end)}
                        </p>
                      </div>
                      <div className="flex-1 relative h-8 bg-muted rounded-lg overflow-hidden">
                        {/* Time progress */}
                        <div 
                          className="absolute inset-y-0 left-0 bg-muted-foreground/20"
                          style={{ width: `${timeProgress}%` }}
                        />
                        {/* Work progress */}
                        <div 
                          className={cn(
                            'absolute inset-y-0 left-0 rounded-r-lg transition-all',
                            item.tipo === 'elettrico' ? 'bg-yellow-500' :
                            item.tipo === 'meccanico' ? 'bg-blue-500' :
                            item.tipo === 'idraulico' ? 'bg-cyan-500' :
                            'bg-primary'
                          )}
                          style={{ width: `${item.progress}%` }}
                        />
                        {/* Progress label */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-foreground drop-shadow-sm">
                            {item.progress.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        {item.progress >= timeProgress ? (
                          <span className="text-xs text-emerald-500 flex items-center gap-1 justify-end">
                            <CheckCircle className="w-3 h-3" /> In linea
                          </span>
                        ) : (
                          <span className="text-xs text-amber-500 flex items-center gap-1 justify-end">
                            <AlertCircle className="w-3 h-3" /> Ritardo
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Varianti Tab */}
        <TabsContent value="varianti" className="mt-6">
          <VariantiManager />
        </TabsContent>
      </Tabs>

      {/* New SAL Dialog */}
      <Dialog open={showNewSALDialog} onOpenChange={setShowNewSALDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuovo SAL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Cantiere *</label>
              <Select 
                value={salForm.cantiereId} 
                onValueChange={(v) => setSalForm({ ...salForm, cantiereId: v, contrattoId: '', importoContratto: 0 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona cantiere" />
                </SelectTrigger>
                <SelectContent>
                  {activeCantieri.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.codiceCommessa} - {c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contract Selection - NEW */}
            {salForm.cantiereId && (
              <div>
                <label className="text-sm font-medium mb-1 block">Contratto *</label>
                <Select value={salForm.contrattoId} onValueChange={handleContrattoSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona contratto esistente" />
                  </SelectTrigger>
                  <SelectContent>
                    {contrattiForCantiere.length === 0 ? (
                      <div className="py-2 px-3 text-sm text-muted-foreground">Nessun contratto - creane uno prima</div>
                    ) : (
                      contrattiForCantiere.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.codiceContratto} - {TIPO_LAVORAZIONE_LABELS[c.tipoLavorazione]} - {formatCurrency(c.importoTotale)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {contrattiForCantiere.length === 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Devi prima creare un contratto per questo cantiere
                  </p>
                )}
              </div>
            )}

            {/* Show impresa when contract is selected */}
            {salForm.contrattoId && (
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Impresa:</span>
                    <p className="font-medium">{getImpresaName(salForm.impresaId)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo Lavorazione:</span>
                    <p className="font-medium">{TIPO_LAVORAZIONE_LABELS[salForm.tipoLavorazione]}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Importo Contratto:</span>
                    <p className="font-medium text-primary">{formatCurrency(salForm.importoContratto)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lavori Precedenti:</span>
                    <p className="font-medium">{formatCurrency(salForm.importoLavoriPrecedenti)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Numero SAL</label>
                <Input
                  type="number"
                  value={salForm.numeroSAL}
                  onChange={(e) => setSalForm({ ...salForm, numeroSAL: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Mese</label>
                <Input
                  type="month"
                  value={salForm.mese}
                  onChange={(e) => setSalForm({ ...salForm, mese: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Lavori Periodo € *</label>
                <Input
                  type="number"
                  value={salForm.importoLavoriPeriodo}
                  onChange={(e) => {
                    const periodo = parseFloat(e.target.value) || 0;
                    setSalForm({ 
                      ...salForm, 
                      importoLavoriPeriodo: periodo,
                      importoLavoriEseguiti: salForm.importoLavoriPrecedenti + periodo
                    });
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Totale Eseguito €</label>
                <Input
                  type="number"
                  value={salForm.importoLavoriEseguiti}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            {salForm.importoContratto > 0 && (
              <div className="p-2 rounded-lg bg-primary/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avanzamento:</span>
                  <span className="font-bold text-primary">
                    {((salForm.importoLavoriEseguiti / salForm.importoContratto) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">Note</label>
              <Textarea
                value={salForm.note}
                onChange={(e) => setSalForm({ ...salForm, note: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSALDialog(false)}>Annulla</Button>
            <Button onClick={handleCreateSAL} disabled={!salForm.contrattoId}>Crea SAL</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Contratto Dialog */}
      <Dialog open={showNewContrattoDialog} onOpenChange={setShowNewContrattoDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuovo Contratto Lavorazione</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Codice Contratto</label>
                <Input
                  value={contrattoForm.codiceContratto}
                  onChange={(e) => setContrattoForm({ ...contrattoForm, codiceContratto: e.target.value })}
                  placeholder="Es. CTR-2024-001"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Stato</label>
                <Select value={contrattoForm.stato} onValueChange={(v) => setContrattoForm({ ...contrattoForm, stato: v as StatoContratto })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATO_CONTRATTO_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Cantiere *</label>
                <Select value={contrattoForm.cantiereId} onValueChange={(v) => setContrattoForm({ ...contrattoForm, cantiereId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona cantiere" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCantieri.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.codiceCommessa} - {c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Impresa *</label>
                <Select value={contrattoForm.impresaId} onValueChange={(v) => setContrattoForm({ ...contrattoForm, impresaId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona impresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {imprese.map(i => (
                      <SelectItem key={i.id} value={i.id}>{i.ragioneSociale}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tipo Lavorazione</label>
              <Select value={contrattoForm.tipoLavorazione} onValueChange={(v) => setContrattoForm({ ...contrattoForm, tipoLavorazione: v as TipoLavorazione })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_LAVORAZIONE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Descrizione *</label>
              <Input
                value={contrattoForm.descrizione}
                onChange={(e) => setContrattoForm({ ...contrattoForm, descrizione: e.target.value })}
                placeholder="Es. Impianto elettrico edificio A"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Importo Contratto € *</label>
                <Input
                  type="number"
                  value={contrattoForm.importoContratto}
                  onChange={(e) => setContrattoForm({ ...contrattoForm, importoContratto: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Varianti €</label>
                <Input
                  type="number"
                  value={contrattoForm.importoVarianti}
                  onChange={(e) => setContrattoForm({ ...contrattoForm, importoVarianti: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Ritenuta Garanzia %</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={contrattoForm.ritenute}
                  onChange={(e) => setContrattoForm({ ...contrattoForm, ritenute: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Anticipo €</label>
                <Input
                  type="number"
                  value={contrattoForm.anticipi}
                  onChange={(e) => setContrattoForm({ ...contrattoForm, anticipi: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Data Inizio</label>
                <Input
                  type="date"
                  value={contrattoForm.dataInizio}
                  onChange={(e) => setContrattoForm({ ...contrattoForm, dataInizio: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Data Fine</label>
                <Input
                  type="date"
                  value={contrattoForm.dataFine}
                  onChange={(e) => setContrattoForm({ ...contrattoForm, dataFine: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Note</label>
              <Textarea
                value={contrattoForm.note}
                onChange={(e) => setContrattoForm({ ...contrattoForm, note: e.target.value })}
                rows={2}
                placeholder="Note aggiuntive..."
              />
            </div>

            {/* Summary */}
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="font-medium">Importo Totale Contratto:</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(contrattoForm.importoContratto + contrattoForm.importoVarianti)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewContrattoDialog(false)}>Annulla</Button>
            <Button onClick={handleCreateContratto}>Crea Contratto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Previsione Dialog */}
      <Dialog open={showNewPrevisioneDialog} onOpenChange={setShowNewPrevisioneDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuova Previsione SAL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cantiere *</Label>
              <Select value={previsioneForm.cantiereId} onValueChange={(v) => setPrevisioneForm({ ...previsioneForm, cantiereId: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleziona cantiere" />
                </SelectTrigger>
                <SelectContent>
                  {activeCantieri.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.codiceCommessa} - {c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mese</Label>
                <Input
                  type="month"
                  className="mt-1"
                  value={previsioneForm.mese}
                  onChange={(e) => setPrevisioneForm({ ...previsioneForm, mese: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo Lavorazione</Label>
                <Select value={previsioneForm.tipoLavorazione} onValueChange={(v) => setPrevisioneForm({ ...previsioneForm, tipoLavorazione: v as TipoLavorazione })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_LAVORAZIONE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Importo Previsto €</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={previsioneForm.importoPrevisto}
                  onChange={(e) => setPrevisioneForm({ ...previsioneForm, importoPrevisto: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>% Avanzamento Prevista</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  className="mt-1"
                  value={previsioneForm.percentualePrevista}
                  onChange={(e) => setPrevisioneForm({ ...previsioneForm, percentualePrevista: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label>Note</Label>
              <Input
                className="mt-1"
                value={previsioneForm.note}
                onChange={(e) => setPrevisioneForm({ ...previsioneForm, note: e.target.value })}
                placeholder="Note opzionali..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPrevisioneDialog(false)}>Annulla</Button>
            <Button onClick={handleCreatePrevisione}>Crea Previsione</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
