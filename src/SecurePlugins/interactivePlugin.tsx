import { useEffect, useState } from 'react';
import { IPlugin, PluginSandbox } from 'remote/types';

// Sample Interactive Plugin with buttons
const interactivePlugin: IPlugin = {
  id: 'interactive-plugin',
  name: 'Interactive Demo',
  description: 'Demo plugin with interactive elements',
  version: '1.0.0',
  icon: '🎮',
  color: '#f97316',
  isActive: false,
  trusted: true,

  permissions: {
    storage: {
      maxSize: 256 * 1024, // 256KB
      allowedKeys: ['counter', 'history', 'settings'],
    },
    network: {
      allowedDomains: [],
      maxRequests: 0,
    },
    events: {
      canEmit: ['interactive:clicked', 'interactive:reset'],
      canSubscribe: ['app:date:changed'],
    },
    ui: {
      maxHeight: 300,
      allowedComponents: ['div', 'span', 'button'],
    },
  },

  data: {
    counter: 0,
    lastClicked: null,
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return (
      <InteractivePluginContent date={date} data={data} sandbox={sandbox} />
    );
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('session-start', date.toISOString());
    } catch (error) {
      console.error('Interactive plugin activation error:', error);
    }
  },
};

function InteractivePluginContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const [counter, setCounter] = useState(data?.counter || 0);
  const [lastClicked, setLastClicked] = useState(data?.lastClicked);
  console.log('localStorage', localStorage);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedCounter = await sandbox?.storage.get('counter');
        const savedLastClicked = await sandbox?.storage.get('lastClicked');

        if (savedCounter !== null) setCounter(savedCounter);
        if (savedLastClicked) setLastClicked(savedLastClicked);
      } catch (error) {
        console.error('Error loading interactive data:', error);
      }
    };
    loadData();
  }, [sandbox]);

  const handleIncrement = async () => {
    const newCounter = counter + 1;
    const timestamp = new Date().toISOString();

    setCounter(newCounter);
    setLastClicked(timestamp);

    try {
      await sandbox?.storage.set('counter', newCounter);
      await sandbox?.storage.set('lastClicked', timestamp);

      sandbox?.hostAPI.updatePluginData({
        counter: newCounter,
        lastClicked: timestamp,
      });

      sandbox?.hostAPI.emitEvent('interactive:clicked', {
        counter: newCounter,
        timestamp,
      });
    } catch (error) {
      console.error('Error incrementing counter:', error);
    }
  };

  const handleReset = async () => {
    setCounter(0);
    const timestamp = new Date().toISOString();
    setLastClicked(timestamp);

    try {
      await sandbox?.storage.set('counter', 0);
      await sandbox?.storage.set('lastClicked', timestamp);

      sandbox?.hostAPI.updatePluginData({
        counter: 0,
        lastClicked: timestamp,
      });

      sandbox?.hostAPI.emitEvent('interactive:reset', { timestamp });
    } catch (error) {
      console.error('Error resetting counter:', error);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Interactive Demo</h4>
      <div className="bg-orange-50 p-3 rounded">
        <div className="text-center mb-3">
          <div className="text-2xl font-bold text-orange-900">{counter}</div>
          <div className="text-sm text-orange-700">Click count</div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleIncrement}
            className="flex-1 bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
          >
            + Increment
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-orange-200 text-orange-800 px-3 py-1 rounded text-sm hover:bg-orange-300 transition-colors"
          >
            Reset
          </button>
        </div>

        {lastClicked && (
          <div className="text-xs text-orange-600 mt-2">
            Last clicked: {new Date(lastClicked).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default interactivePlugin;
