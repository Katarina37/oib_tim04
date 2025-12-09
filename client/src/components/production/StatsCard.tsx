import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label, trend }) => {
  return (
    <div className="stat-card">
      <div className="stat-card__icon">
        {icon}
      </div>
      <div className="stat-card__content">
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">{label}</div>
        {trend && (
          <div 
            className="stat-card__trend"
            style={{ 
              color: trend.isPositive ? 'var(--color-success)' : 'var(--color-error)',
              fontSize: 'var(--font-size-xs)',
              marginTop: 'var(--space-xs)'
            }}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;