import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Check, CheckCheck, X, AlertCircle, Clock, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface Notifica {
  id: string;
  tipo: 'scadenza' | 'avviso' | 'urgente' | 'info';
  titolo: string;
  messaggio: string;
  entita_tipo: string | null;
  entita_id: string | null;
  letta: boolean;
  data_scadenza: string | null;
  created_at: string;
}

export function NotificationCenter() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifiche = [], isLoading } = useQuery({
    queryKey: ['notifiche'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifiche')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notifica[];
    },
    refetchInterval: 30000, // Refresh ogni 30 secondi
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifiche')
        .update({ letta: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifiche'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifiche')
        .update({ letta: true })
        .eq('letta', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifiche'] });
    },
  });

  const deleteNotificaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifiche')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifiche'] });
    },
  });

  const unreadCount = notifiche.filter(n => !n.letta).length;

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'scadenza': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'avviso': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getBgColor = (tipo: string, letta: boolean) => {
    if (letta) return 'bg-muted/30';
    switch (tipo) {
      case 'urgente': return 'bg-red-500/10 border-l-2 border-l-red-500';
      case 'scadenza': return 'bg-amber-500/10 border-l-2 border-l-amber-500';
      case 'avviso': return 'bg-orange-500/10 border-l-2 border-l-orange-500';
      default: return 'bg-primary/10 border-l-2 border-l-primary';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Notifiche</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-xs"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Segna tutte lette
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Caricamento...
            </div>
          ) : notifiche.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nessuna notifica</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifiche.map((notifica) => (
                <div
                  key={notifica.id}
                  className={cn(
                    'p-4 transition-colors hover:bg-muted/50 cursor-pointer relative group',
                    getBgColor(notifica.tipo, notifica.letta)
                  )}
                  onClick={() => {
                    if (!notifica.letta) {
                      markAsReadMutation.mutate(notifica.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(notifica.tipo)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm',
                        !notifica.letta && 'font-medium'
                      )}>
                        {notifica.titolo}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notifica.messaggio}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notifica.created_at), { 
                          addSuffix: true, 
                          locale: it 
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notifica.letta && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReadMutation.mutate(notifica.id);
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotificaMutation.mutate(notifica.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
