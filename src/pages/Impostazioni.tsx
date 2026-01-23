import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Bell, Shield, Database, Building2, Save, Upload, Trash2, FileText, LayoutGrid, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWorkHub } from '@/contexts/WorkHubContext';
import { useSidebarModules, SIDEBAR_MODULES, SECTIONS } from '@/hooks/useSidebarModules';
import { cn } from '@/lib/utils';

export default function Impostazioni() {
  const { toast } = useToast();
  const { datiAzienda, updateDatiAzienda } = useWorkHub();
  const {
    isModuleVisible,
    toggleModule,
    toggleSection,
    resetToDefaults,
    isSectionFullyVisible,
  } = useSidebarModules();
  
  const [notifications, setNotifications] = useState({
    emailScadenze: true,
    emailDocumenti: true,
    giorniAnticipo: 30
  });

  const timbroInputRef = useRef<HTMLInputElement>(null);
  const templateWordRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    toast({
      title: "Impostazioni salvate",
      description: "Le modifiche sono state salvate con successo."
    });
  };

  const handleClearCache = () => {
    if (confirm('Sei sicuro di voler svuotare la cache?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const handleTimbroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB for any format)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File troppo grande', description: 'Dimensione massima 5MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateDatiAzienda({ timbro: reader.result as string });
      toast({ title: 'Timbro caricato con successo' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveTimbro = () => {
    updateDatiAzienda({ timbro: undefined });
    toast({ title: 'Timbro rimosso' });
  };

  const handleTemplateWordUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    // Nota: la generazione documenti usa un motore basato su .docx (formato zip). I .doc non sono supportati.
    const isDocx =
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.docx');
    if (!isDocx) {
      toast({ title: 'Formato non valido', description: 'Carica solo file Word .DOCX', variant: 'destructive' });
      return;
    }

    // Check file size (max 10MB for Word documents)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File troppo grande', description: 'Dimensione massima 10MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateDatiAzienda({ 
        templateDocumentoBase: reader.result as string,
        templateDocumentoNome: file.name 
      });
      toast({ title: 'Template Word caricato', description: 'Questo file verrà usato come base per tutti i moduli' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveTemplateWord = () => {
    updateDatiAzienda({ templateDocumentoBase: undefined, templateDocumentoNome: undefined });
    toast({ title: 'Template Word rimosso' });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Impostazioni</h1>
        <p className="text-muted-foreground">Configura le preferenze dell'applicazione</p>
      </div>

      <Tabs defaultValue="azienda" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto scrollbar-hidden whitespace-nowrap">
          <TabsTrigger value="azienda" className="gap-2 flex-none text-xs sm:text-sm">
            <Building2 className="w-4 h-4" />
            Dati Azienda
          </TabsTrigger>
          <TabsTrigger value="documenti" className="gap-2 flex-none text-xs sm:text-sm">
            <FileText className="w-4 h-4" />
            Documenti Azienda
          </TabsTrigger>
          <TabsTrigger value="menu" className="gap-2 flex-none text-xs sm:text-sm">
            <LayoutGrid className="w-4 h-4" />
            Menu
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2 flex-none text-xs sm:text-sm">
            <Settings className="w-4 h-4" />
            Generali
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 flex-none text-xs sm:text-sm">
            <Bell className="w-4 h-4" />
            Notifiche
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 flex-none text-xs sm:text-sm">
            <Shield className="w-4 h-4" />
            Sicurezza
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2 flex-none text-xs sm:text-sm">
            <Database className="w-4 h-4" />
            Dati
          </TabsTrigger>
        </TabsList>

        {/* Dati Azienda */}
        <TabsContent value="azienda" className="mt-6 space-y-6">
          {/* Dati Azienda */}
          <Card>
            <CardHeader>
              <CardTitle>Dati Azienda</CardTitle>
              <CardDescription>
                Questi dati verranno utilizzati automaticamente nei moduli e documenti ufficiali
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ragione Sociale *</Label>
                  <Input 
                    placeholder="Nome azienda" 
                    value={datiAzienda.ragioneSociale}
                    onChange={(e) => updateDatiAzienda({ ragioneSociale: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Partita IVA *</Label>
                  <Input 
                    placeholder="IT00000000000" 
                    value={datiAzienda.partitaIva}
                    onChange={(e) => updateDatiAzienda({ partitaIva: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Codice Fiscale Azienda</Label>
                  <Input 
                    placeholder="00000000000" 
                    value={datiAzienda.codiceFiscaleAzienda}
                    onChange={(e) => updateDatiAzienda({ codiceFiscaleAzienda: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Iscrizione REA</Label>
                  <Input 
                    placeholder="TV-000000" 
                    value={datiAzienda.iscrizioneREA}
                    onChange={(e) => updateDatiAzienda({ iscrizioneREA: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sede Legale</Label>
                <Input 
                  placeholder="Via/Piazza, n. civico" 
                  value={datiAzienda.sedeLegale}
                  onChange={(e) => updateDatiAzienda({ sedeLegale: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CAP</Label>
                  <Input 
                    placeholder="00000" 
                    value={datiAzienda.cap}
                    onChange={(e) => updateDatiAzienda({ cap: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Città</Label>
                  <Input 
                    placeholder="Città" 
                    value={datiAzienda.citta}
                    onChange={(e) => updateDatiAzienda({ citta: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Input 
                    placeholder="TV" 
                    value={datiAzienda.provincia}
                    onChange={(e) => updateDatiAzienda({ provincia: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>PEC</Label>
                  <Input 
                    type="email" 
                    placeholder="azienda@pec.it" 
                    value={datiAzienda.pec}
                    onChange={(e) => updateDatiAzienda({ pec: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    placeholder="info@azienda.it" 
                    value={datiAzienda.email}
                    onChange={(e) => updateDatiAzienda({ email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input 
                  placeholder="+39 000 0000000" 
                  value={datiAzienda.telefono}
                  onChange={(e) => updateDatiAzienda({ telefono: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dati Titolare */}
          <Card>
            <CardHeader>
              <CardTitle>Dati Titolare / Legale Rappresentante</CardTitle>
              <CardDescription>
                Dati del legale rappresentante per dichiarazioni e nomine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input 
                    placeholder="Nome" 
                    value={datiAzienda.nomeTitolare}
                    onChange={(e) => updateDatiAzienda({ nomeTitolare: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cognome *</Label>
                  <Input 
                    placeholder="Cognome" 
                    value={datiAzienda.cognomeTitolare}
                    onChange={(e) => updateDatiAzienda({ cognomeTitolare: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Codice Fiscale *</Label>
                <Input 
                  placeholder="RSSMRA80A01H501Z" 
                  value={datiAzienda.codiceFiscaleTitolare}
                  onChange={(e) => updateDatiAzienda({ codiceFiscaleTitolare: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Data di Nascita</Label>
                  <Input 
                    type="date" 
                    value={datiAzienda.dataNascitaTitolare}
                    onChange={(e) => updateDatiAzienda({ dataNascitaTitolare: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Luogo di Nascita</Label>
                  <Input 
                    placeholder="Città" 
                    value={datiAzienda.luogoNascitaTitolare}
                    onChange={(e) => updateDatiAzienda({ luogoNascitaTitolare: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Input 
                    placeholder="TV" 
                    value={datiAzienda.provinciaNascitaTitolare}
                    onChange={(e) => updateDatiAzienda({ provinciaNascitaTitolare: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Residenza</Label>
                <Input 
                  placeholder="Via, n. civico - CAP Città (Prov.)" 
                  value={datiAzienda.residenzaTitolare}
                  onChange={(e) => updateDatiAzienda({ residenzaTitolare: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Carta d'Identità</Label>
                  <Input 
                    placeholder="CA00000AA" 
                    value={datiAzienda.ciTitolare}
                    onChange={(e) => updateDatiAzienda({ ciTitolare: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cellulare</Label>
                  <Input 
                    placeholder="+39 333 0000000" 
                    value={datiAzienda.cellulareTitolare}
                    onChange={(e) => updateDatiAzienda({ cellulareTitolare: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timbro Aziendale */}
          <Card>
            <CardHeader>
              <CardTitle>Timbro Aziendale</CardTitle>
              <CardDescription>
                Carica il timbro aziendale. Verrà inserito automaticamente nei documenti quando selezioni "Firma". 
                Qualsiasi formato immagine è supportato (max 5MB).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {datiAzienda.timbro ? (
                <div className="relative border border-border rounded-lg p-4 bg-muted/20">
                  <img 
                    src={datiAzienda.timbro} 
                    alt="Timbro" 
                    className="max-h-32 w-auto mx-auto object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveTimbro}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 cursor-pointer transition-colors"
                  onClick={() => timbroInputRef.current?.click()}
                >
                  <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Clicca per caricare il timbro</p>
                  <p className="text-xs text-muted-foreground mt-1">Qualsiasi formato immagine (max 5MB)</p>
                </div>
              )}
              <input
                ref={timbroInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleTimbroUpload}
              />
            </CardContent>
          </Card>

          {/* Template Word Base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Template Documento Base (Word)
              </CardTitle>
              <CardDescription>
                Carica un file Word (.docx) con la tua carta intestata già configurata. 
                Questo file verrà usato come base <strong>"intoccabile"</strong> per generare tutti i moduli ufficiali.
                L'intestazione, il footer e la formattazione del tuo documento verranno preservati.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {datiAzienda.templateDocumentoBase ? (
                <div className="relative border border-border rounded-lg p-6 bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{datiAzienda.templateDocumentoNome || 'Template Word'}</p>
                      <p className="text-sm text-muted-foreground">Template caricato e pronto all'uso</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveTemplateWord}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Rimuovi
                    </Button>
                  </div>
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      ✓ I moduli D.Lgs 81/2008 utilizzeranno questo documento come base
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 cursor-pointer transition-colors"
                  onClick={() => templateWordRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">Clicca per caricare il template Word</p>
                  <p className="text-sm text-muted-foreground mt-1">File .docx con carta intestata aziendale (max 10MB)</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Il documento deve contenere l'intestazione superiore e inferiore già configurate
                  </p>
                </div>
              )}
              <input
                ref={templateWordRef}
                type="file"
                accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                className="hidden"
                onChange={handleTemplateWordUpload}
              />
              
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-1">
                  ⚠️ Informazioni importanti
                </p>
                <ul className="text-xs text-amber-600 dark:text-amber-300 space-y-1 list-disc list-inside">
                  <li>Il file Word deve avere l'intestazione e il piè di pagina già configurati</li>
                  <li>I moduli generati inseriranno i contenuti nel corpo del documento</li>
                  <li>Le citazioni normative verranno inserite dove richiesto dalla legge</li>
                  <li>I tuoi dati aziendali verranno usati solo nei campi obbligatori per legge</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documenti Azienda - Required for public tenders */}
        <TabsContent value="documenti" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documenti Aziendali Obbligatori</CardTitle>
              <CardDescription>
                Carica i documenti richiesti per appalti pubblici e gare. Questi documenti saranno disponibili 
                per la generazione automatica di fascicoli documentali.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* DURC */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">DURC</h4>
                      <p className="text-sm text-muted-foreground">Documento Unico Regolarità Contributiva</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Carica
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Scadenza: Non caricato</p>
              </div>

              {/* Visura Camerale */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Visura Camerale</h4>
                      <p className="text-sm text-muted-foreground">Visura aggiornata Camera di Commercio</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Carica
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Validità: 6 mesi</p>
              </div>

              {/* DVR */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Shield className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">DVR</h4>
                      <p className="text-sm text-muted-foreground">Documento Valutazione Rischi (D.Lgs 81/2008)</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Carica
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Aggiornamento: alla variazione dei rischi</p>
              </div>

              {/* Polizza RCT/RCO */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Polizza RCT/RCO</h4>
                      <p className="text-sm text-muted-foreground">Responsabilità Civile Terzi e Operai</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Carica
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Scadenza: Non caricato</p>
              </div>

              {/* Certificazione SOA */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <FileText className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Certificazione SOA</h4>
                      <p className="text-sm text-muted-foreground">Attestazione Qualificazione Lavori Pubblici</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Carica
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Validità: 5 anni (se applicabile)</p>
              </div>

              {/* Certificato Casellario Giudiziale */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Casellario Giudiziale</h4>
                      <p className="text-sm text-muted-foreground">Certificato casellario del legale rappresentante</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Carica
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Validità: 6 mesi</p>
              </div>

              {/* Certificato Carichi Pendenti */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Carichi Pendenti</h4>
                      <p className="text-sm text-muted-foreground">Certificato carichi pendenti del legale rappresentante</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Carica
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Validità: 6 mesi</p>
              </div>

              {/* Certificazioni ISO */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Certificazioni ISO</h4>
                      <p className="text-sm text-muted-foreground">ISO 9001, ISO 14001, ISO 45001</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Carica
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Validità: vedi certificato</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Altri Documenti</CardTitle>
              <CardDescription>
                Documenti aggiuntivi per specifiche esigenze contrattuali
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dichiarazione Antimafia */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Dichiarazione Antimafia</h4>
                      <p className="text-sm text-muted-foreground">Autocertificazione requisiti antimafia</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Carica
                  </Button>
                </div>
              </div>

              {/* Documento identità legale rappresentante */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Documento Identità</h4>
                      <p className="text-sm text-muted-foreground">Carta d'identità del legale rappresentante</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Carica
                  </Button>
                </div>
              </div>

              {/* Codice Fiscale Azienda */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Certificato Attribuzione P.IVA</h4>
                      <p className="text-sm text-muted-foreground">Certificato Agenzia Entrate</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Carica
                  </Button>
                </div>
              </div>

              {/* Libro Unico Lavoro */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Libro Unico Lavoro (LUL)</h4>
                      <p className="text-sm text-muted-foreground">Estratto LUL ultimo mese</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Carica
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personalizzazione Menu */}
        <TabsContent value="menu" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5" />
                    Personalizza Menu Sidebar
                  </CardTitle>
                  <CardDescription>
                    Scegli quali moduli visualizzare nella barra laterale. Le modifiche sono applicate immediatamente.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={resetToDefaults}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Default
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {SECTIONS.map(section => {
                    const sectionModules = SIDEBAR_MODULES.filter(m => m.section === section.id);
                    const isFullyVisible = isSectionFullyVisible(section.id);
                    
                    return (
                      <div key={section.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold uppercase text-muted-foreground">
                            {section.label}
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => toggleSection(section.id, !isFullyVisible)}
                          >
                            {isFullyVisible ? 'Nascondi tutti' : 'Mostra tutti'}
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {sectionModules.map(module => (
                            <div
                              key={module.id}
                              className={cn(
                                'flex items-center justify-between p-3 rounded-lg border transition-colors',
                                isModuleVisible(module.id) 
                                  ? 'bg-card border-border' 
                                  : 'bg-muted/30 border-transparent'
                              )}
                            >
                              <span className={cn(
                                'text-sm',
                                !isModuleVisible(module.id) && 'text-muted-foreground'
                              )}>
                                {module.label}
                              </span>
                              <Switch
                                checked={isModuleVisible(module.id)}
                                onCheckedChange={() => toggleModule(module.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              
              <p className="text-xs text-muted-foreground pt-4 mt-4 border-t">
                Le modifiche vengono salvate automaticamente e applicate immediatamente alla sidebar.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aspetto</CardTitle>
              <CardDescription>
                Personalizza l'interfaccia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Tema Scuro</Label>
                  <p className="text-sm text-muted-foreground">Attiva il tema scuro per ridurre l'affaticamento visivo</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Animazioni</Label>
                  <p className="text-sm text-muted-foreground">Abilita le animazioni dell'interfaccia</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Promemoria Scadenze</CardTitle>
              <CardDescription>
                Configura come ricevere i promemoria per le scadenze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email per scadenze documenti</Label>
                  <p className="text-sm text-muted-foreground">Ricevi un'email quando un documento sta per scadere</p>
                </div>
                <Switch 
                  checked={notifications.emailDocumenti}
                  onCheckedChange={(v) => setNotifications(prev => ({ ...prev, emailDocumenti: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email per scadenze formazioni</Label>
                  <p className="text-sm text-muted-foreground">Ricevi un'email quando una formazione sta per scadere</p>
                </div>
                <Switch 
                  checked={notifications.emailScadenze}
                  onCheckedChange={(v) => setNotifications(prev => ({ ...prev, emailScadenze: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Giorni di anticipo</Label>
                <p className="text-sm text-muted-foreground mb-2">Quanti giorni prima della scadenza vuoi essere avvisato?</p>
                <Input 
                  type="number" 
                  value={notifications.giorniAnticipo}
                  onChange={(e) => setNotifications(prev => ({ ...prev, giorniAnticipo: parseInt(e.target.value) || 30 }))}
                  className="w-24"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifiche In-App</CardTitle>
              <CardDescription>
                Configura le notifiche visualizzate nell'applicazione
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Badge notifiche</Label>
                  <p className="text-sm text-muted-foreground">Mostra il numero di elementi critici nella sidebar</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Avvisi popup</Label>
                  <p className="text-sm text-muted-foreground">Mostra notifiche popup per eventi importanti</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parametri HSE</CardTitle>
              <CardDescription>
                Configura le soglie per i controlli di sicurezza
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Soglia "In scadenza" (giorni)</Label>
                  <Input type="number" defaultValue={30} className="w-24" />
                </div>
                <div className="space-y-2">
                  <Label>Soglia critica (giorni)</Label>
                  <Input type="number" defaultValue={7} className="w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documenti Obbligatori</CardTitle>
              <CardDescription>
                Definisci quali documenti sono obbligatori per le imprese
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                'DURC',
                'Visura camerale',
                'Polizza RCT/RCO',
                'DVR',
                'POS'
              ].map(doc => (
                <div key={doc} className="flex items-center justify-between">
                  <Label>{doc}</Label>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Dati</CardTitle>
              <CardDescription>
                Importa, esporta o ripristina i dati dell'applicazione
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Esporta dati</p>
                  <p className="text-sm text-muted-foreground">Scarica un backup di tutti i dati in formato JSON</p>
                </div>
                <Button variant="outline">Esporta</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Importa dati</p>
                  <p className="text-sm text-muted-foreground">Carica un file JSON per ripristinare i dati</p>
                </div>
                <Button variant="outline">Importa</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <div>
                  <p className="font-medium text-amber-600">Cancella cache locale</p>
                  <p className="text-sm text-muted-foreground">Svuota la cache del browser per questa applicazione</p>
                </div>
                <Button variant="outline" onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  toast({ title: 'Cache svuotata', description: 'Ricarica la pagina per applicare le modifiche.' });
                }}>Svuota Cache</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Archiviazione</CardTitle>
              <CardDescription>
                Informazioni sullo spazio utilizzato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spazio utilizzato (localStorage)</span>
                  <span className="font-medium">~50 KB</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-1 bg-primary rounded-full" />
                </div>
                <p className="text-xs text-muted-foreground">
                  I dati sono salvati localmente nel browser. Per una soluzione persistente, 
                  considera di connettere un database esterno.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Salva Impostazioni
        </Button>
      </div>
    </div>
  );
}
