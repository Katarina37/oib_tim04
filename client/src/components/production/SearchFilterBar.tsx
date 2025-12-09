import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { PlantState, PlantSearchCriteriaDTO } from '../../models/plants/PlantDTO';

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: PlantSearchCriteriaDTO;
  onFilterChange: (filters: PlantSearchCriteriaDTO) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  showFilters,
  onToggleFilters,
}) => {
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as PlantState | '';
    onFilterChange({
      ...filters,
      state: value || undefined,
    });
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      countryOfOrigin: e.target.value || undefined,
    });
  };

  const handleMinOilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    onFilterChange({
      ...filters,
      minOilStrength: value,
    });
  };

  const handleMaxOilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    onFilterChange({
      ...filters,
      maxOilStrength: value,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
    onSearchChange('');
  };

  const hasActiveFilters = 
    searchTerm || 
    filters.state || 
    filters.countryOfOrigin || 
    filters.minOilStrength !== undefined || 
    filters.maxOilStrength !== undefined;

  return (
    <div className="search-filter-container">
      <div className="search-bar">
        <div className="search-bar__input-wrapper">
          <Search size={18} className="search-bar__icon" />
          <input
            type="text"
            className="input"
            placeholder="Pretraži biljke po nazivu..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="search-bar__filters">
          <button 
            className={`btn ${showFilters ? 'btn--primary' : 'btn--outline'}`}
            onClick={onToggleFilters}
          >
            <Filter size={16} />
            Filteri
          </button>
          {hasActiveFilters && (
            <button 
              className="btn btn--ghost"
              onClick={clearFilters}
              title="Očisti filtere"
            >
              <X size={16} />
              Očisti
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-panel__row">
            <div className="input-group">
              <label className="input-group__label">Stanje</label>
              <select
                className="input select"
                value={filters.state || ''}
                onChange={handleStateChange}
              >
                <option value="">Sva stanja</option>
                <option value={PlantState.PLANTED}>Posađena</option>
                <option value={PlantState.HARVESTED}>Ubrana</option>
                <option value={PlantState.PROCESSED}>Prerađena</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-group__label">Zemlja porekla</label>
              <input
                type="text"
                className="input"
                placeholder="npr. Francuska"
                value={filters.countryOfOrigin || ''}
                onChange={handleCountryChange}
              />
            </div>

            <div className="input-group">
              <label className="input-group__label">Min. jačina ulja</label>
              <input
                type="number"
                className="input"
                placeholder="1.0"
                min="1.0"
                max="5.0"
                step="0.1"
                value={filters.minOilStrength ?? ''}
                onChange={handleMinOilChange}
              />
            </div>

            <div className="input-group">
              <label className="input-group__label">Max. jačina ulja</label>
              <input
                type="number"
                className="input"
                placeholder="5.0"
                min="1.0"
                max="5.0"
                step="0.1"
                value={filters.maxOilStrength ?? ''}
                onChange={handleMaxOilChange}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .search-filter-container {
          margin-bottom: var(--space-lg);
        }
        
        .filter-panel {
          margin-top: var(--space-md);
          padding: var(--space-md);
          background: var(--color-white);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-light);
        }
        
        .filter-panel__row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: var(--space-md);
        }
      `}</style>
    </div>
  );
};

export default SearchFilterBar;