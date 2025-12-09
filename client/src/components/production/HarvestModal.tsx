import React, { useState, useEffect } from 'react';
import { HarvestPlantsDTO, PlantDTO, PlantState } from '../../models/plants/PlantDTO';
import { X, Scissors } from 'lucide-react';

interface HarvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHarvest: (data: HarvestPlantsDTO) => void;
  availablePlants: PlantDTO[];
  isLoading?: boolean;
}

export const HarvestModal: React.FC<HarvestModalProps> = ({
  isOpen,
  onClose,
  onHarvest,
  availablePlants,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<HarvestPlantsDTO>({
    commonName: '',
    quantity: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter only planted plants
  const plantedPlants = availablePlants.filter(p => p.state === PlantState.PLANTED);
  
  // Group plants by name and count
  const plantGroups = plantedPlants.reduce((acc, plant) => {
    if (!acc[plant.commonName]) {
      acc[plant.commonName] = 0;
    }
    acc[plant.commonName]++;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    if (isOpen) {
      const firstPlant = Object.keys(plantGroups)[0] || '';
      setFormData({
        commonName: firstPlant,
        quantity: 1,
      });
      setErrors({});
    }
  }, [isOpen]);

  const maxQuantity = formData.commonName ? plantGroups[formData.commonName] || 0 : 0;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.commonName) {
      newErrors.commonName = 'Izaberite vrstu biljke';
    }
    if (formData.quantity < 1) {
      newErrors.quantity = 'Količina mora biti najmanje 1';
    }
    if (formData.quantity > maxQuantity) {
      newErrors.quantity = `Maksimalna količina je ${maxQuantity}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onHarvest(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title flex items-center gap-sm">
            <Scissors size={20} className="text-muted" />
            Uberi biljke
          </h2>
          <button className="btn btn--ghost btn--icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            {Object.keys(plantGroups).length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                <p className="text-muted">Nema posađenih biljaka za berbu</p>
              </div>
            ) : (
              <>
                <div className="input-group mb-md">
                  <label className="input-group__label" htmlFor="commonName">
                    Vrsta biljke *
                  </label>
                  <select
                    id="commonName"
                    name="commonName"
                    className={`input select ${errors.commonName ? 'input--error' : ''}`}
                    value={formData.commonName}
                    onChange={handleChange}
                  >
                    <option value="">Izaberite biljku</option>
                    {Object.entries(plantGroups).map(([name, count]) => (
                      <option key={name} value={name}>
                        {name} ({count} dostupno)
                      </option>
                    ))}
                  </select>
                  {errors.commonName && (
                    <span className="text-error" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {errors.commonName}
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-group__label" htmlFor="quantity">
                    Količina *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    className={`input ${errors.quantity ? 'input--error' : ''}`}
                    value={formData.quantity}
                    onChange={handleChange}
                    min={1}
                    max={maxQuantity}
                  />
                  {errors.quantity && (
                    <span className="text-error" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {errors.quantity}
                    </span>
                  )}
                  {formData.commonName && (
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                      Maksimalno: {maxQuantity} biljaka
                    </span>
                  )}
                </div>
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
              disabled={isLoading || Object.keys(plantGroups).length === 0}
            >
              {isLoading ? 'Berba...' : 'Uberi biljke'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HarvestModal;