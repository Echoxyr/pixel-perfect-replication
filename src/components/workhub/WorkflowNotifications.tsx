import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  BellRing,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Archive,
  Trash2,
  MoreVertical,
  Filter,
  RefreshCw,
  Zap,
  FileText,
  ShoppingCart,
  Truck,
  Receipt,
  Shield,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface WorkflowNotificationsProps {
  className?: string;
  maxItems?: number;
  compact?: boolean;
}

interface Notification {
  id: string;
  tipo: string;
  entita_tipo: string;
  entita_id: string;
  titolo: string;
  messaggio: string;
  priorita: string;
  stato: string;
  azione_suggerita: string | null;
  link_azione: string | null;
  created_at: string;
  letta_at: string | null;
}

const PRIORITA_COLORS: Record<string, string> = {
  bassa: 'bg-gray-100 text-gray-700',
  media: 'bg-blue-100 text-blue-700',
  alta: 'bg-amber-100 text-amber-700',
  critica: 'bg-red-100 text-red-700',
};

const TIPO_ICONS: Record<string, React.ReactNode> = {
  conversione: <Zap className="w-4 h-4" />,
  scadenza: <Calendar className="w-4 h-4" />,
  alert: <AlertTriangle className="w-4 h-4" />,
  approvazione: <CheckCircle className="w-4 h-4" />,
};

const ENTITA_ICONS: Record<string, React.ReactNode> = {
  preventivo: <FileText className="w-4 h-4 text-blue-500" />,
  ordine: <ShoppingCart className="w-4 h-4 text-amber-500" />,
  ddt: <Truck className="w-4 h-4 text-purple-500" />,
  fattura: <Receipt className="w-4 h-4 text-green-500" />,
  documento: <Shield className="w-4 h-4 text-red-500" />,
};

export default function WorkflowNotifications({ 
  className, 
  maxItems = 50,
  compact = false 
}: WorkflowNotificationsProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'tutte' | 'non_lette' | 'alte'>('tutte');

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['workflow_notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(maxItems);
      if (error) throw error;
      return data as Notification[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mark as read
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflow_notifications')
        .update({ stato: 'letta', letta_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_notifications'] });
    }
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('workflow_notifications')
        .update({ stato: 'letta', letta_at: new Date().toISOString() })
        .eq('stato', 'non_letta');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_notifications'] });
      toast.success('Tutte le notifiche segnate come lette');
    }
  });

  // Archive notification
  const archiveNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflow_notifications')
        .update({ stato: 'archiviata' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_notifications'] });
      toast.success('Notifica archiviata');
    }
  });

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflow_notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_notifications'] });
      toast.success('Notifica eliminata');
    }
  });

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let result = notifications.filter(n => n.stato !== 'archiviata');
    
    if (filter === 'non_lette') {
      result = result.filter(n => n.stato === 'non_letta');
    } else if (filter === 'alte') {
      result = result.filter(n => n.priorita === 'alta' || n.priorita === 'critica');
    }
    
    return result;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => n.stato === 'non_letta').length;
  const highPriorityCount = notifications.filter(n => 
    n.stato === 'non_letta' && (n.priorita === 'alta' || n.priorita === 'critica')
  ).length;

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              {unreadCount > 0 ? (
                <BellRing className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-2 border-b flex items-center justify-between">
              <span className="font-medium">Notifiche</span>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => markAllAsRead.mutate()}
                >
                  Segna tutte lette
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Nessuna notifica
                </div>
              ) : (
                filteredNotifications.slice(0, 10).map((notif) => (
                  <div 
                    key={notif.id}
                    className={cn(
                      "p-3 border-b hover:bg-muted/50 cursor-pointer",
                      notif.stato === 'non_letta' && "bg-blue-50/50"
                    )}
                    onClick={() => markAsRead.mutate(notif.id)}
                  >
                    <div className="flex items-start gap-2">
                      {ENTITA_ICONS[notif.entita_tipo] || <Bell className="w-4 h-4" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notif.titolo}</p>
                        <p className="text-xs text-muted-foreground truncate">{notif.messaggio}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: it })}
                        </span>
                      </div>
                      <Badge className={cn("text-xs", PRIORITA_COLORS[notif.priorita])}>
                        {notif.priorita}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BellRing className="w-5 h-5" />
          Centro Notifiche Workflow
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} nuove</Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                {filter === 'tutte' && 'Tutte'}
                {filter === 'non_lette' && 'Non lette'}
                {filter === 'alte' && 'Priorità alta'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter('tutte')}>
                Tutte le notifiche
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('non_lette')}>
                Solo non lette ({unreadCount})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('alte')}>
                Priorità alta ({highPriorityCount})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Segna tutte lette
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nessuna notifica</p>
            <p className="text-sm text-muted-foreground">
              Le notifiche del workflow appariranno qui
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    notif.stato === 'non_letta' && "bg-blue-50/50 border-blue-200",
                    notif.priorita === 'critica' && "border-red-300 bg-red-50/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {ENTITA_ICONS[notif.entita_tipo] || TIPO_ICONS[notif.tipo] || <Bell className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notif.titolo}</h4>
                          <Badge className={cn("text-xs", PRIORITA_COLORS[notif.priorita])}>
                            {notif.priorita}
                          </Badge>
                          {notif.stato === 'non_letta' && (
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notif.messaggio}</p>
                        {notif.azione_suggerita && (
                          <p className="text-sm mt-2">
                            <strong>Azione:</strong> {notif.azione_suggerita}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: it })}
                          </span>
                          {notif.link_azione && (
                            <Link 
                              to={notif.link_azione}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              Vai <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {notif.stato === 'non_letta' && (
                          <DropdownMenuItem onClick={() => markAsRead.mutate(notif.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Segna come letta
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => archiveNotification.mutate(notif.id)}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archivia
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteNotification.mutate(notif.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
