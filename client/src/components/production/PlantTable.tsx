import React from 'react';
import { PlantDTO, PlantState } from '../../models/plants/PlantDTO';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';

interface PlantTableProps {
  plants: PlantDTO[];
  onEdit: (plant: PlantDTO) => void;
  onDelete: (plant: PlantDTO) => void;
  isLoading?: boolean;
}

const getStateLabel = (state: PlantState): string => {
  switch (state) {
    case PlantState.PLANTED:
      return 'Posađena';
    case PlantState.HARVESTED:
      return 'Ubrana';
    case PlantState.PROCESSED:
      return 'Prerađena';
    default:
      return state;
  }
};

const getStateBadgeClass = (state: PlantState): string => {
  switch (state) {
    case PlantState.PLANTED:
      return 'badge--planted';
    case PlantState.HARVESTED:
      return 'badge--harvested';
    case PlantState.PROCESSED:
      return 'badge--processed';
    default:
      return '';
  }
};

export const PlantTable: React.FC<PlantTableProps> = ({ 
  plants, 
  onEdit, 
  onDelete,
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="spinner" />
        <p className="mt-md text-muted">Učitavanje biljaka...</p>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2v1m0 18v1m9-10h1M2 12h1m15.5-6.5l.7.7M4.8 19.2l.7.7m12.7 0l.7-.7M4.8 4.8l.7.7" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </div>
        <h3 className="empty-state__title">Nema biljaka</h3>
        <p className="empty-state__description">
          Dodajte novu biljku da biste započeli proizvodnju
        </p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Naziv</th>
            <th>Latinski naziv</th>
            <th>Jačina ulja</th>
            <th>Zemlja porekla</th>
            <th>Stanje</th>
            <th style={{ width: '100px' }}>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {plants.map((plant) => (
            <tr key={plant.id}>
              <td>
                <span className="font-medium">{plant.commonName}</span>
              </td>
              <td>
                <span className="text-muted" style={{ fontStyle: 'italic' }}>
                  {plant.latinName}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-sm">
                  <div className="oil-strength-meter" style={{ width: '80px' }}>
                    <div 
                      className="oil-strength-meter__fill" 
                      style={{ width: `${(plant.oilStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="oil-strength-value">{plant.oilStrength.toFixed(1)}</span>
                </div>
              </td>
              <td>{plant.countryOfOrigin}</td>
              <td>
                <span className={`badge ${getStateBadgeClass(plant.state)}`}>
                  {getStateLabel(plant.state)}
                </span>
              </td>
              <td>
                <div className="flex gap-sm">
                  <button 
                    className="btn btn--ghost btn--icon btn--sm"
                    onClick={() => onEdit(plant)}
                    title="Izmeni"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="btn btn--ghost btn--icon btn--sm"
                    onClick={() => onDelete(plant)}
                    title="Obriši"
                    style={{ color: 'var(--color-error)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlantTable;