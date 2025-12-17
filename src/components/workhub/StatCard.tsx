import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'default',
  onClick
}: StatCardProps) {
  const colorClasses = {
    default: 'border-border bg-card',
    primary: 'border-primary/30 bg-primary/5',
    success: 'border-emerald-500/30 bg-emerald-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    danger: 'border-red-500/30 bg-red-500/5'
  };

  const valueColorClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-red-500'
  };

  return (
    <div
      className={cn(
        'p-5 rounded-xl border transition-colors',
        colorClasses[color],
        onClick && 'cursor-pointer hover:border-primary/50'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        {icon && (
          <div className={cn(
            'p-2 rounded-lg',
            color === 'default' ? 'bg-muted' :
            color === 'primary' ? 'bg-primary/10' :
            color === 'success' ? 'bg-emerald-500/10' :
            color === 'warning' ? 'bg-amber-500/10' :
            'bg-red-500/10'
          )}>
            {icon}
          </div>
        )}
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            trend.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className={cn('text-3xl font-bold', valueColorClasses[color])}>{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: number;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

export function MiniStat({ label, value, color = 'default' }: MiniStatProps) {
  const colorClasses = {
    default: 'text-foreground',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-red-500'
  };

  return (
    <div className="text-center">
      <p className={cn('text-xl font-bold', colorClasses[color])}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
