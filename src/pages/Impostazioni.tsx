import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Shield, Database, Palette, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Impostazioni() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    emailScadenze: true,
    emailDocumenti: true,
    giorniAnticipo: 30
  });

  const handleSave = () => {
    toast({
      title: "Impostazioni salvate",
      description: "Le modifiche sono state salvate con successo."
    });
  };

  const handleReset = () => {
    if (confirm('Sei sicuro di voler ripristinare tutti i dati di esempio?')) {
      localStorage.removeItem('workhub_data_v1');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Impostazioni</h1>
        <p className="text-muted-foreground">Configura le preferenze dell'applicazione</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" />
            Generali
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifiche
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Sicurezza
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="w-4 h-4" />
            Dati
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Azienda</CardTitle>
              <CardDescription>
                Configura i dati della tua azienda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ragione Sociale</Label>
                  <Input placeholder="Nome azienda" />
                </div>
                <div className="space-y-2">
                  <Label>Partita IVA</Label>
                  <Input placeholder="IT00000000000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Indirizzo</Label>
                <Input placeholder="Via, Città, CAP" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="info@azienda.it" />
                </div>
                <div className="space-y-2">
                  <Label>Telefono</Label>
                  <Input placeholder="+39 000 0000000" />
                </div>
              </div>
            </CardContent>
          </Card>

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
              <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5">
                <div>
                  <p className="font-medium text-red-500">Ripristina dati di esempio</p>
                  <p className="text-sm text-muted-foreground">Elimina tutti i dati e ripristina quelli di esempio</p>
                </div>
                <Button variant="destructive" onClick={handleReset}>Ripristina</Button>
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
