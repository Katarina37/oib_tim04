import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Save, RotateCcw, Info } from 'lucide-react';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const [demoDate, setDemoDate] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedDate = localStorage.getItem('demoDate');
    if (savedDate) {
      setDemoDate(savedDate);
    }
  }, []);

  const handleSave = () => {
    if (demoDate) {
      localStorage.setItem('demoDate', demoDate);
    } else {
      localStorage.removeItem('demoDate');
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    setDemoDate('');
    localStorage.removeItem('demoDate');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'Sistemski datum';
    const date = new Date(dateStr);
    return date.toLocaleDateString('sr-RS', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="page-title">
          <Settings size={28} className="page-icon" />
          <div>
            <h1>Podešavanja</h1>
            <p>Konfigurisanje sistema za demonstraciju</p>
          </div>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-card">
          <div className="card-header">
            <Calendar size={20} />
            <h2>Demo datum</h2>
          </div>

          <div className="card-description">
            <Info size={16} />
            <p>
              Postavite demo datum za potrebe prezentacije. Kada je demo datum aktivan,
              svi API pozivi će koristiti ovaj datum umesto stvarnog sistemskog datuma.
              Ovo omogućava demonstraciju sezonskih efekata na biljke.
            </p>
          </div>

          <div className="current-date">
            <span className="label">Trenutno aktivan datum:</span>
            <span className="value">{formatDate(demoDate)}</span>
          </div>

          <div className="form-group">
            <label htmlFor="demo-date">Izaberite demo datum</label>
            <input
              type="date"
              id="demo-date"
              value={demoDate}
              onChange={(e) => setDemoDate(e.target.value)}
            />
          </div>

          <div className="settings-actions">
            <button className="btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} />
              Resetuj na sistemski
            </button>
            <button className="btn-primary" onClick={handleSave}>
              <Save size={16} />
              Sačuvaj
            </button>
          </div>

          {isSaved && (
            <div className="save-confirmation">
              ✓ Podešavanja su sačuvana
            </div>
          )}
        </div>

        <div className="settings-card info-card">
          <h3>Kako koristiti demo datum?</h3>
          <ol>
            <li>Izaberite željeni datum u polju iznad</li>
            <li>Kliknite "Sačuvaj" da aktivirate demo datum</li>
            <li>Svi vremenski efekti će se računati u odnosu na ovaj datum</li>
            <li>Za povratak na stvarni datum, kliknite "Resetuj na sistemski"</li>
          </ol>

          <div className="example-scenarios">
            <h4>Primeri scenarija za demonstraciju:</h4>
            <ul>
              <li>
                <strong>Zimski scenario:</strong> Izaberite datum u januaru,
                unesite hladne i vlažne uslove, i pokažite kako biljke propadaju.
              </li>
              <li>
                <strong>Letnji scenario:</strong> Izaberite datum u julu,
                unesite vruće uslove sa blagom kišom, i pokažite povećanje jačine ulja.
              </li>
              <li>
                <strong>Scenario suše:</strong> Izaberite bilo koji datum,
                unesite suve uslove bez padavina, i pokažite efekte suše.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
