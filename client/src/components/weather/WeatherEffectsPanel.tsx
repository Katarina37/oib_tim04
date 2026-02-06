import React, { useMemo, useState } from 'react';
import { Zap, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { PlantEffectDetail, WeatherEffectResultDTO } from '../../models/weather/WeatherDTO';
import { formatDate } from '../../helpers/formatters';
import './WeatherEffectsPanel.css';

interface WeatherEffectsPanelProps {
  selectedDate: string | null;
  onApplyEffects: (date: string) => Promise<WeatherEffectResultDTO>;
  hasWeatherData: boolean;
}

export const WeatherEffectsPanel: React.FC<WeatherEffectsPanelProps> = ({
  selectedDate,
  onApplyEffects,
  hasWeatherData,
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [result, setResult] = useState<WeatherEffectResultDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApplyEffects = async () => {
    if (!selectedDate) return;

    setIsApplying(true);
    setError(null);
    setResult(null);

    try {
      const effectResult = await onApplyEffects(selectedDate);
      setResult(effectResult);
    } catch (err) {
      setError((err as Error).message || 'Greška pri primeni efekata');
    } finally {
      setIsApplying(false);
    }
  };

  const getEffectIcon = (effectType: WeatherEffectResultDTO['effectType']) => {
    switch (effectType) {
      case 'damage':
      case 'drought':
        return <AlertTriangle size={20} className="effect-icon warning" />;
      case 'boost':
      case 'ideal':
        return <CheckCircle size={20} className="effect-icon success" />;
    }
  };

  const getEffectClass = (effectType: WeatherEffectResultDTO['effectType']) => {
    switch (effectType) {
      case 'damage':
      case 'drought':
        return 'effect-warning';
      case 'boost':
      case 'ideal':
        return 'effect-success';
    }
  };

  const formattedDate = useMemo(() => {
    return selectedDate ? formatDate(selectedDate) : '';
  }, [selectedDate]);

  const getActionLabel = (action: PlantEffectDetail['action']) => {
    switch (action) {
      case 'removed':
        return 'Uginula';
      case 'boosted':
        return 'Pojačana';
      case 'oil-reduced':
        return 'Smanjena jačina';
      case 'duplicated':
        return 'Umnožena';
    }
  };

  const getActionClass = (action: PlantEffectDetail['action']) => {
    switch (action) {
      case 'removed':
        return 'action-removed';
      case 'boosted':
        return 'action-boosted';
      case 'oil-reduced':
        return 'action-reduced';
      case 'duplicated':
        return 'action-duplicated';
    }
  };

  const affectedPlants = useMemo(() => {
    return result?.affectedPlantDetails ?? [];
  }, [result]);

  return (
    <div className="weather-effects-panel">
      <h3>Primeni vremenske efekte</h3>
      <p className="effects-description">
        Primeni uticaj vremenskih uslova na biljke u proizvodnji.
        Ovo može prouzrokovati promene u jačini ulja, umnožavanje ili propadanje biljaka.
      </p>

      {!selectedDate && (
        <div className="effects-notice">
          Izaberite datum na kalendaru za primenu efekata.
        </div>
      )}

      {selectedDate && !hasWeatherData && (
        <div className="effects-notice warning">
          Nema vremenskih podataka za izabrani datum. Unesite podatke prvo.
        </div>
      )}

      {selectedDate && hasWeatherData && (
        <>
          <button
            className="apply-effects-btn"
            onClick={handleApplyEffects}
            disabled={isApplying}
          >
            {isApplying ? (
              <>
                <Loader2 size={18} className="spinner" />
                Primenjujem...
              </>
            ) : (
              <>
                <Zap size={18} />
                Primeni efekte za {formattedDate}
              </>
            )}
          </button>

          {error && (
            <div className="effects-error">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {result && (
            <div className={`effects-result ${getEffectClass(result.effectType)}`}>
              <div className="result-header">
                {getEffectIcon(result.effectType)}
                <span className="effect-type">{result.effectType.toUpperCase()}</span>
              </div>
              <p className="result-description">{result.description}</p>
              <div className="result-stats">
                <span>Pogođeno biljaka: <strong>{result.affectedPlants}</strong></span>
              </div>

              {affectedPlants.length > 0 && (
                <div className="affected-plants">
                  <div className="affected-list">
                    {affectedPlants.map((plant) => (
                      <div key={`${plant.action}-${plant.id}`} className="affected-item">
                        <span className={`effect-chip ${getActionClass(plant.action)}`}>
                          {getActionLabel(plant.action)}
                        </span>
                        <span className="plant-name">{plant.commonName}</span>
                        <span className="plant-meta">#{plant.id}</span>
                        {plant.previousOilStrength !== undefined &&
                          plant.newOilStrength !== undefined && (
                            <span className="plant-delta">
                              {plant.previousOilStrength.toFixed(1)} → {plant.newOilStrength.toFixed(1)}
                            </span>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="effects-rules">
        <h4>Pravila vremenskih efekata:</h4>
        <ul>
          <li>
            <span className="rule-condition">❄️ Hladno + Vlažno</span>
            <span className="rule-effect">→ 10% biljaka propada</span>
          </li>
          <li>
            <span className="rule-condition">☀️ Vruće + OK + Slabe padavine</span>
            <span className="rule-effect">→ Jačina ulja +0.2</span>
          </li>
          <li>
            <span className="rule-condition">🏜️ Suvo + Bez padavina</span>
            <span className="rule-effect">→ Suša: ulje -0.3, neke biljke uginu</span>
          </li>
          <li>
            <span className="rule-condition">🌱 Umereno + OK</span>
            <span className="rule-effect">→ Idealno: +1 nova biljka</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WeatherEffectsPanel;
