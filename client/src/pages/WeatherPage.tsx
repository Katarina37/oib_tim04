import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { CloudSun, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuthHook';
import { useServices } from '../contexts/ServiceContext';
import { WeatherDTO, CreateWeatherDTO, WeatherEffectResultDTO } from '../models/weather/WeatherDTO';
import { WeatherCalendar, WeatherModal, WeatherEffectsPanel } from '../components/weather';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatDate } from '../helpers/formatters';
import './WeatherPage.css';

export const WeatherPage: React.FC = () => {
  const { token } = useAuth();
  const { weatherAPI } = useServices();

  const [weatherData, setWeatherData] = useState<WeatherDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const yearMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, [currentMonth]);

  const selectedWeather = useMemo(() => {
    if (!selectedDate) return null;
    return weatherData.find(w => w.date === selectedDate) || null;
  }, [selectedDate, weatherData]);

  const fetchWeatherData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await weatherAPI.getWeatherByMonth(yearMonth, token);
      setWeatherData(data);
    } catch (err) {
      setError('Greška pri učitavanju vremenskih podataka');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [weatherAPI, token, yearMonth]);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleDateDoubleClick = (date: string) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSaveWeather = async (data: CreateWeatherDTO) => {
    if (!token) return;
    await weatherAPI.saveWeather(data, token);
    await fetchWeatherData();
  };

  const handleApplyEffects = async (date: string): Promise<WeatherEffectResultDTO> => {
    if (!token) throw new Error('Niste prijavljeni');
    return weatherAPI.applyWeatherEffects(date, token);
  };

  const handleDeleteWeather = async () => {
    if (!token || !selectedDate) return;
    setIsDeleting(true);
    try {
      await weatherAPI.deleteWeather(selectedDate, token);
      await fetchWeatherData();
      setSelectedDate(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Greška pri brisanju:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    if (!selectedDate) return;
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="weather-page">
      <div className="page-header">
        <div className="page-title">
          <CloudSun size={28} className="page-icon" />
          <div>
            <h1>Vremenski uslovi</h1>
            <p>Upravljanje vremenskim podacima i njihovim uticajem na proizvodnju</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      <div className="weather-content">
        <div className="weather-main">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Učitavanje...</span>
            </div>
          ) : (
            <WeatherCalendar
              weatherData={weatherData}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onDateDoubleClick={handleDateDoubleClick}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          )}
        </div>

        <div className="weather-sidebar">
          {selectedDate && (
            <div className="selected-date-info">
              <div className="info-header">
                <Calendar size={18} />
                <span>Izabrani datum</span>
              </div>
              <div className="info-date">{formatDate(selectedDate)}</div>
              {selectedWeather && (
                <>
                  <div className="info-details">
                    <div className="detail-row">
                      <span>Temperatura:</span>
                      <strong>{selectedWeather.temperatureC}°C</strong>
                    </div>
                    <div className="detail-row">
                      <span>Vlažnost:</span>
                      <strong>{selectedWeather.humidityPct}%</strong>
                    </div>
                    <div className="detail-row">
                      <span>Padavine:</span>
                      <strong>{selectedWeather.precipitationMm}mm</strong>
                    </div>
                  </div>
                  <button className="delete-btn" onClick={handleDeleteClick}>
                    <Trash2 size={16} />
                    Obriši podatke
                  </button>
                </>
              )}
            </div>
          )}

          <WeatherEffectsPanel
            selectedDate={selectedDate}
            onApplyEffects={handleApplyEffects}
            hasWeatherData={!!selectedWeather}
          />
        </div>
      </div>

      <WeatherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWeather}
        selectedDate={selectedDate || ''}
        existingWeather={selectedWeather}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteWeather}
        title="Obriši vremenske podatke"
        message={`Da li ste sigurni da želite da obrišete vremenske podatke za ${selectedDate ? formatDate(selectedDate) : ''}?`}
        confirmText="Obriši"
        cancelText="Otkaži"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default WeatherPage;
