import React, { useState, useEffect } from 'react';
import { PlantDTO, CreatePlantDTO, UpdatePlantDTO, PlantState } from '../../models/plants/PlantDTO';
import { X } from 'lucide-react';

interface PlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePlantDTO | UpdatePlantDTO) => void;
  plant?: PlantDTO | null;
  isLoading?: boolean;
}

export const PlantModal: React.FC<PlantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  plant,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreatePlantDTO>({
    commonName: '',
    latinName: '',
    countryOfOrigin: '',
    oilStrength: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!plant;

  useEffect(() => {
    if (plant) {
      setFormData({
        commonName: plant.commonName,
        latinName: plant.latinName,
        countryOfOrigin: plant.countryOfOrigin,
        oilStrength: plant.oilStrength,
      });
    } else {
      setFormData({
        commonName: '',
        latinName: '',
        countryOfOrigin: '',
        oilStrength: undefined,
      });
    }
    setErrors({});
  }, [plant, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.commonName.trim()) {
      newErrors.commonName = 'Naziv je obavezan';
    }
    if (!formData.latinName.trim()) {
      newErrors.latinName = 'Latinski naziv je obavezan';
    }
    if (!formData.countryOfOrigin.trim()) {
      newErrors.countryOfOrigin = 'Zemlja porekla je obavezna';
    }
    if (formData.oilStrength !== undefined) {
      if (formData.oilStrength < 1.0 || formData.oilStrength > 5.0) {
        newErrors.oilStrength = 'Jačina ulja mora biti između 1.0 i 5.0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'oilStrength' ? (value ? parseFloat(value) : undefined) : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">
            {isEditMode ? 'Izmeni biljku' : 'Dodaj novu biljku'}
          </h2>
          <button className="btn btn--ghost btn--icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="input-group mb-md">
              <label className="input-group__label" htmlFor="commonName">
                Naziv biljke *
              </label>
              <input
                type="text"
                id="commonName"
                name="commonName"
                className={`input ${errors.commonName ? 'input--error' : ''}`}
                placeholder="npr. Lavanda"
                value={formData.commonName}
                onChange={handleChange}
              />
              {errors.commonName && (
                <span className="text-error" style={{ fontSize: 'var(--font-size-xs)' }}>
                  {errors.commonName}
                </span>
              )}
            </div>

            <div className="input-group mb-md">
              <label className="input-group__label" htmlFor="latinName">
                Latinski naziv *
              </label>
              <input
                type="text"
                id="latinName"
                name="latinName"
                className={`input ${errors.latinName ? 'input--error' : ''}`}
                placeholder="npr. Lavandula angustifolia"
                value={formData.latinName}
                onChange={handleChange}
              />
              {errors.latinName && (
                <span className="text-error" style={{ fontSize: 'var(--font-size-xs)' }}>
                  {errors.latinName}
                </span>
              )}
            </div>

            <div className="input-group mb-md">
              <label className="input-group__label" htmlFor="countryOfOrigin">
                Zemlja porekla *
              </label>
              <input
                type="text"
                id="countryOfOrigin"
                name="countryOfOrigin"
                className={`input ${errors.countryOfOrigin ? 'input--error' : ''}`}
                placeholder="npr. Francuska"
                value={formData.countryOfOrigin}
                onChange={handleChange}
              />
              {errors.countryOfOrigin && (
                <span className="text-error" style={{ fontSize: 'var(--font-size-xs)' }}>
                  {errors.countryOfOrigin}
                </span>
              )}
            </div>

            <div className="input-group">
              <label className="input-group__label" htmlFor="oilStrength">
                Jačina aromatičnih ulja (1.0 - 5.0)
              </label>
              <input
                type="number"
                id="oilStrength"
                name="oilStrength"
                className={`input ${errors.oilStrength ? 'input--error' : ''}`}
                placeholder="Automatski generisano ako nije uneto"
                value={formData.oilStrength ?? ''}
                onChange={handleChange}
                step="0.1"
                min="1.0"
                max="5.0"
              />
              {errors.oilStrength && (
                <span className="text-error" style={{ fontSize: 'var(--font-size-xs)' }}>
                  {errors.oilStrength}
                </span>
              )}
              <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                Ostavite prazno za nasumično generisanje
              </span>
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn btn--outline" onClick={onClose}>
              Otkaži
            </button>
            <button type="submit" className="btn btn--primary" disabled={isLoading}>
              {isLoading ? 'Čuvanje...' : isEditMode ? 'Sačuvaj izmene' : 'Dodaj biljku'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlantModal;