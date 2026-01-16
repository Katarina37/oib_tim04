import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Snowflake, Sun, Cloud, CloudRain, Droplets } from 'lucide-react';
import { WeatherDTO, TemperatureState, HumidityState, PrecipitationState } from '../../models/weather/WeatherDTO';
import './WeatherCalendar.css';

interface WeatherCalendarProps {
  weatherData: WeatherDTO[];
  selectedDate: string | null;
  onDateClick: (date: string) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const getWeatherIcon = (weather: WeatherDTO): React.ReactNode => {
  const { temperatureState, precipitationState } = weather;
  
  if (precipitationState === PrecipitationState.HEAVY) {
    return <CloudRain size={16} className="weather-icon rain" />;
  }
  if (precipitationState === PrecipitationState.LIGHT) {
    return <Cloud size={16} className="weather-icon cloudy" />;
  }
  if (temperatureState === TemperatureState.COLD) {
    return <Snowflake size={16} className="weather-icon cold" />;
  }
  if (temperatureState === TemperatureState.HOT) {
    return <Sun size={16} className="weather-icon hot" />;
  }
  return <Sun size={16} className="weather-icon moderate" />;
};

const getHumidityIcon = (humidity: HumidityState): React.ReactNode => {
  if (humidity === HumidityState.HUMID) {
    return <Droplets size={12} className="humidity-icon humid" />;
  }
  if (humidity === HumidityState.DRY) {
    return <Droplets size={12} className="humidity-icon dry" />;
  }
  return null;
};

const getDayClass = (weather: WeatherDTO | undefined): string => {
  if (!weather) return '';
  
  const classes: string[] = ['has-weather'];
  
  if (weather.temperatureState === TemperatureState.COLD) {
    classes.push('temp-cold');
  } else if (weather.temperatureState === TemperatureState.HOT) {
    classes.push('temp-hot');
  } else {
    classes.push('temp-moderate');
  }
  
  return classes.join(' ');
};

const formatTemperatureState = (state: TemperatureState): string => {
  switch (state) {
    case TemperatureState.COLD: return 'Hladno';
    case TemperatureState.MODERATE: return 'Umereno';
    case TemperatureState.HOT: return 'Vruće';
  }
};

const formatHumidityState = (state: HumidityState): string => {
  switch (state) {
    case HumidityState.DRY: return 'Suvo';
    case HumidityState.OK: return 'OK';
    case HumidityState.HUMID: return 'Vlažno';
  }
};

const formatPrecipitationState = (state: PrecipitationState): string => {
  switch (state) {
    case PrecipitationState.NONE: return 'Bez padavina';
    case PrecipitationState.LIGHT: return 'Slabe';
    case PrecipitationState.HEAVY: return 'Jake';
  }
};

export const WeatherCalendar: React.FC<WeatherCalendarProps> = ({
  weatherData,
  selectedDate,
  onDateClick,
  currentMonth,
  onMonthChange,
}) => {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const weatherMap = useMemo(() => {
    const map = new Map<string, WeatherDTO>();
    weatherData.forEach(w => map.set(w.date, w));
    return map;
  }, [weatherData]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday start
    
    const days: (Date | null)[] = [];
    
    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  }, [currentMonth]);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const monthName = currentMonth.toLocaleString('sr-RS', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  return (
    <div className="weather-calendar">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={handlePrevMonth}>
          <ChevronLeft size={20} />
        </button>
        <h3 className="calendar-title">{monthName}</h3>
        <button className="calendar-nav-btn" onClick={handleNextMonth}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-weekdays">
        <span>Pon</span>
        <span>Uto</span>
        <span>Sre</span>
        <span>Čet</span>
        <span>Pet</span>
        <span>Sub</span>
        <span>Ned</span>
      </div>

      <div className="calendar-grid">
        {daysInMonth.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="calendar-day empty" />;
          }

          const dateStr = formatDate(day);
          const weather = weatherMap.get(dateStr);
          const isSelected = selectedDate === dateStr;
          const isHovered = hoveredDate === dateStr;
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div
              key={dateStr}
              className={`calendar-day ${getDayClass(weather)} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => onDateClick(dateStr)}
              onMouseEnter={() => setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              <span className="day-number">{day.getDate()}</span>
              {weather && (
                <div className="day-weather">
                  {getWeatherIcon(weather)}
                  {getHumidityIcon(weather.humidityState)}
                </div>
              )}
              
              {/* Tooltip */}
              {isHovered && weather && (
                <div className="weather-tooltip">
                  <div className="tooltip-row">
                    <span>Temp:</span>
                    <strong>{weather.temperatureC}°C ({formatTemperatureState(weather.temperatureState)})</strong>
                  </div>
                  <div className="tooltip-row">
                    <span>Vlažnost:</span>
                    <strong>{weather.humidityPct}% ({formatHumidityState(weather.humidityState)})</strong>
                  </div>
                  <div className="tooltip-row">
                    <span>Padavine:</span>
                    <strong>{weather.precipitationMm}mm ({formatPrecipitationState(weather.precipitationState)})</strong>
                  </div>
                  {weather.note && (
                    <div className="tooltip-note">{weather.note}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherCalendar;
