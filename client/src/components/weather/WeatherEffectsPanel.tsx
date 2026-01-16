import React, { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { WeatherEffectResultDTO } from '../../models/weather/WeatherDTO';
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
                Primeni efekte za {selectedDate}
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
