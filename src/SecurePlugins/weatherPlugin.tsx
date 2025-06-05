import { useEffect, useState } from 'react';
import { IPlugin, PluginSandbox } from 'remote/types';

// Sample Weather Plugin
const weatherPlugin: IPlugin = {
  id: 'weather-plugin',
  name: 'Weather',
  description: 'Current weather information',
  version: '1.0.0',
  icon: '🌤️',
  color: '#f59e0b',
  isActive: false,
  trusted: true,

  permissions: {
    storage: {
      maxSize: 512 * 1024, // 512KB
      allowedKeys: ['weather-cache', 'location'],
    },
    network: {
      allowedDomains: ['api.openweathermap.org'], // Example weather API
      maxRequests: 60, // 1 per minute
    },
    events: {
      canEmit: ['weather:updated'],
      canSubscribe: ['app:date:changed'],
    },
    ui: {
      maxHeight: 200,
      allowedComponents: ['div', 'span', 'button'],
    },
  },

  data: {
    weather: { temp: '24°C', condition: 'Partly Cloudy', humidity: '52%' },
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return <WeatherPluginContent date={date} data={data} sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('last-updated', date.toISOString());
    } catch (error) {
      console.error('Weather plugin activation error:', error);
    }
  },
};

function WeatherPluginContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const [weather, setWeather] = useState(
    data?.weather || {
      temp: '22°C',
      condition: 'Sunny',
      humidity: '45%',
    },
  );

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const cachedWeather = await sandbox?.storage.get('weather-cache');
        if (cachedWeather) {
          setWeather(cachedWeather);
        }
      } catch (error) {
        console.error('Error loading weather:', error);
      }
    };
    loadWeather();
  }, [sandbox]);

  const refreshWeather = async () => {
    // Simulate weather refresh
    const conditions = ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'];
    const temps = ['18°C', '22°C', '24°C', '26°C', '28°C'];

    const newWeather = {
      temp: temps[Math.floor(Math.random() * temps.length)],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      humidity: `${Math.floor(Math.random() * 40) + 30}%`,
    };

    setWeather(newWeather);

    try {
      await sandbox?.storage.set('weather-cache', newWeather);
      sandbox?.hostAPI.updatePluginData({ weather: newWeather });
      sandbox?.hostAPI.emitEvent('weather:updated', newWeather);
    } catch (error) {
      console.error('Error saving weather:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm">Weather</h4>
        <button
          onClick={refreshWeather}
          className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
        >
          Refresh
        </button>
      </div>
      <div className="bg-yellow-50 p-3 rounded">
        <div className="text-lg font-bold text-yellow-900">{weather.temp}</div>
        <div className="text-yellow-800">{weather.condition}</div>
        <div className="text-sm text-yellow-700">
          Humidity: {weather.humidity}
        </div>
      </div>
    </div>
  );
}

export default weatherPlugin;
