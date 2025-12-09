import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export interface LogEntry {
  id: number;
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface ProductionLogProps {
  logs: LogEntry[];
  isLoading?: boolean;
}

const LogIcon: React.FC<{ type: LogEntry['type'] }> = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={16} />;
    case 'warning':
      return <AlertTriangle size={16} />;
    case 'error':
      return <XCircle size={16} />;
    default:
      return <Info size={16} />;
  }
};

export const ProductionLog: React.FC<ProductionLogProps> = ({ logs, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="spinner" />
        <p className="mt-md text-muted">Učitavanje dnevnika...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
        <div className="empty-state__icon">
          <Info size={48} />
        </div>
        <h3 className="empty-state__title">Nema aktivnosti</h3>
        <p className="empty-state__description">
          Ovde će se prikazivati sve aktivnosti vezane za proizvodnju
        </p>
      </div>
    );
  }

  return (
    <div className="log-panel">
      {logs.map((log) => (
        <div key={log.id} className="log-entry">
          <span className="log-entry__time">{log.time}</span>
          <span className={`log-entry__icon log-entry__icon--${log.type}`}>
            <LogIcon type={log.type} />
          </span>
          <span className="log-entry__message">{log.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ProductionLog;