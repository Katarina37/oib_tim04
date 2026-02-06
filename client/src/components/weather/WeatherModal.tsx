import React, { useState, useEffect } from 'react';
import { X, Thermometer, Droplets, CloudRain, Save } from 'lucide-react';
import { CreateWeatherDTO, WeatherDTO } from '../../models/weather/WeatherDTO';
import { formatDate } from '../../helpers/formatters';
import './WeatherModal.css';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateWeatherDTO) => Promise<void>;
  selectedDate: string;
  existingWeather?: WeatherDTO | null;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  existingWeather,
}) => {
  const [temperatureC, setTemperatureC] = useState<number>(15);
  const [humidityPct, setHumidityPct] = useState<number>(50);
  const [precipitationMm, setPrecipitationMm] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingWeather) {
      setTemperatureC(existingWeather.temperatureC);
      setHumidityPct(existingWeather.humidityPct);
      setPrecipitationMm(existingWeather.precipitationMm);
      setNote(existingWeather.note || '');
    } else {
      setTemperatureC(15);
      setHumidityPct(50);
      setPrecipitationMm(0);
      setNote('');
    }
  }, [existingWeather, selectedDate]);

  const getTemperatureState = (temp: number): string => {
    if (temp <= 5) return 'COLD (Hladno)';
    if (temp >= 23) return 'HOT (Vruće)';
    return 'MODERATE (Umereno)';
  };

  const getHumidityState = (hum: number): string => {
    if (hum <= 35) return 'DRY (Suvo)';
    if (hum >= 71) return 'HUMID (Vlažno)';
    return 'OK';
  };

  const getPrecipitationState = (precip: number): string => {
    if (precip === 0) return 'NONE (Bez padavina)';
    if (precip <= 10) return 'LIGHT (Slabe)';
    return 'HEAVY (Jake)';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave({
        date: selectedDate,
        temperatureC,
        humidityPct,
        precipitationMm,
        note: note || undefined,
      });
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Greška pri čuvanju');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal weather-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">
            {existingWeather ? 'Izmeni vremenske uslove' : 'Unesi vremenske uslove'}
          </h2>
          <button className="btn btn--ghost btn--icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal__body">
          <div className="weather-modal__date">
            {formatDate(selectedDate)}
          </div>

          {error && <div className="modal-error">{error}</div>}

          <form id="weather-form" onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="temperature">
                <Thermometer size={16} />
                Temperatura (°C)
              </label>
              <div className="input-with-preview">
                <input
                  type="number"
                  id="temperature"
                  value={temperatureC}
                  onChange={(e) => setTemperatureC(Number(e.target.value))}
                  min={-50}
                  max={60}
                  step={0.1}
                  required
                />
                <span className="state-preview temp">{getTemperatureState(temperatureC)}</span>
              </div>
              <input
                type="range"
                value={temperatureC}
                onChange={(e) => setTemperatureC(Number(e.target.value))}
                min={-20}
                max={45}
                step={1}
                className="range-slider"
              />
            </div>

            <div className="form-group">
              <label htmlFor="humidity">
                <Droplets size={16} />
                Vlažnost (%)
              </label>
              <div className="input-with-preview">
                <input
                  type="number"
                  id="humidity"
                  value={humidityPct}
                  onChange={(e) => setHumidityPct(Number(e.target.value))}
                  min={0}
                  max={100}
                  required
                />
                <span className="state-preview humidity">{getHumidityState(humidityPct)}</span>
              </div>
              <input
                type="range"
                value={humidityPct}
                onChange={(e) => setHumidityPct(Number(e.target.value))}
                min={0}
                max={100}
                step={1}
                className="range-slider"
              />
            </div>

            <div className="form-group">
              <label htmlFor="precipitation">
                <CloudRain size={16} />
                Padavine (mm)
              </label>
              <div className="input-with-preview">
                <input
                  type="number"
                  id="precipitation"
                  value={precipitationMm}
                  onChange={(e) => setPrecipitationMm(Number(e.target.value))}
                  min={0}
                  max={500}
                  step={0.1}
                  required
                />
                <span className="state-preview precip">{getPrecipitationState(precipitationMm)}</span>
              </div>
              <input
                type="range"
                value={precipitationMm}
                onChange={(e) => setPrecipitationMm(Number(e.target.value))}
                min={0}
                max={50}
                step={1}
                className="range-slider"
              />
            </div>

            <div className="form-group">
              <label htmlFor="note">Napomena (opciono)</label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Dodatne napomene o vremenskim uslovima..."
                rows={3}
                maxLength={500}
              />
            </div>
          </form>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn btn--outline" onClick={onClose}>
            Otkaži
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            form="weather-form"
            disabled={isSubmitting}
          >
            <Save size={16} />
            {isSubmitting ? 'Čuvanje...' : 'Sačuvaj'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeatherModal;
