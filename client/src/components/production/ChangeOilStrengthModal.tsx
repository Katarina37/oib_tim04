import React, { useState, useEffect } from 'react';
import { ChangeOilStrengthDTO, PlantDTO } from '../../models/plants/PlantDTO';
import { X, Droplets } from 'lucide-react';

interface ChangeOilStrengthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChange: (data: ChangeOilStrengthDTO) => void;
  availablePlants: PlantDTO[];
  isLoading?: boolean;
}

export const ChangeOilStrengthModal: React.FC<ChangeOilStrengthModalProps> = ({
  isOpen,
  onClose,
  onChange,
  availablePlants,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ChangeOilStrengthDTO>({
    plantId: 0,
    percentageChange: 0,
  });
  const [selectedPlant, setSelectedPlant] = useState<PlantDTO | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        plantId: 0,
        percentageChange: 0,
      });
      setSelectedPlant(null);
      setErrors({});
    }
  }, [isOpen]);

  const handlePlantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plantId = parseInt(e.target.value);
    const plant = availablePlants.find(p => p.id === plantId) || null;
    setSelectedPlant(plant);
    setFormData(prev => ({ ...prev, plantId }));
    if (errors.plantId) {
      setErrors(prev => ({ ...prev, plantId: '' }));
    }
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentageChange = parseFloat(e.target.value) || 0;
    setFormData(prev => ({ ...prev, percentageChange }));
    if (errors.percentageChange) {
      setErrors(prev => ({ ...prev, percentageChange: '' }));
    }
  };

  const calculateNewStrength = (): number => {
    if (!selectedPlant) return 0;
    const change = selectedPlant.oilStrength * (formData.percentageChange / 100);
    const newStrength = selectedPlant.oilStrength + change;
    return Math.max(1.0, Math.min(5.0, newStrength));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.plantId) {
      newErrors.plantId = 'Izaberite biljku';
    }
    if (formData.percentageChange === 0) {
      newErrors.percentageChange = 'Unesite procenat promene';
    }
    if (formData.percentageChange < -100 || formData.percentageChange > 100) {
      newErrors.percentageChange = 'Procenat mora biti između -100% i 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onChange(formData);
    }
  };

  if (!isOpen) return null;

  const newStrength = calculateNewStrength();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title flex items-center gap-sm">
            <Droplets size={20} className="text-muted" />
            Promeni jačinu ulja
          </h2>
          <button className="btn btn--ghost btn--icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {availablePlants.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                <p className="text-muted">Nema dostupnih biljaka</p>
              </div>
            ) : (
              <>
                <div className="input-group mb-md">
                  <label className="input-group__label" htmlFor="plantId">
                    Izaberite biljku *
                  </label>
                  <select
                    id="plantId"
                    name="plantId"
                    className={`input select ${errors.plantId ? 'input--error' : ''}`}
                    value={formData.plantId || ''}
                    onChange={handlePlantChange}
                  >
                    <option value="">Izaberite biljku</option>
                    {availablePlants.map((plant) => (
                      <option key={plant.id} value={plant.id}>
                        {plant.commonName} (ID: {plant.id}) - Trenutno: {plant.oilStrength.toFixed(1)}
                      </option>
                    ))}
                  </select>
                  {errors.plantId && (
                    <span className="text-error" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {errors.plantId}
                    </span>
                  )}
                </div>

                <div className="input-group mb-md">
                  <label className="input-group__label" htmlFor="percentageChange">
                    Procenat promene (%) *
                  </label>
                  <input
                    type="number"
                    id="percentageChange"
                    name="percentageChange"
                    className={`input ${errors.percentageChange ? 'input--error' : ''}`}
                    placeholder="npr. -15 za smanjenje ili 20 za povećanje"
                    value={formData.percentageChange || ''}
                    onChange={handlePercentageChange}
                    step="1"
                    min="-100"
                    max="100"
                  />
                  {errors.percentageChange && (
                    <span className="text-error" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {errors.percentageChange}
                    </span>
                  )}
                  <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                    Negativna vrednost smanjuje, pozitivna povećava jačinu
                  </span>
                </div>

                {selectedPlant && formData.percentageChange !== 0 && (
                  <div 
                    className="card" 
                    style={{ 
                      background: 'var(--color-primary-subtle)', 
                      border: '1px solid var(--color-primary-light)',
                      padding: 'var(--space-md)'
                    }}
                  >
                    <div className="flex justify-between items-center mb-sm">
                      <span className="text-muted">Trenutna jačina:</span>
                      <span className="font-bold">{selectedPlant.oilStrength.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-sm">
                      <span className="text-muted">Promena:</span>
                      <span 
                        className="font-bold"
                        style={{ color: formData.percentageChange > 0 ? 'var(--color-success)' : 'var(--color-error)' }}
                      >
                        {formData.percentageChange > 0 ? '+' : ''}{formData.percentageChange}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Nova jačina:</span>
                      <span 
                        className="font-bold"
                        style={{ 
                          color: newStrength >= 4.0 ? 'var(--color-warning)' : 'var(--color-primary)'
                        }}
                      >
                        {newStrength.toFixed(1)}
                        {newStrength >= 4.0 && ' ⚠️'}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn--outline" onClick={onClose}>
              Otkaži
            </button>
            <button 
              type="submit" 
              className="btn btn--primary" 
              disabled={isLoading || availablePlants.length === 0}
            >
              {isLoading ? 'Primena...' : 'Primeni promenu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeOilStrengthModal;