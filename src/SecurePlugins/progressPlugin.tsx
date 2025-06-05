import { useEffect, useState } from 'react';
import { IPlugin, PluginSandbox } from 'remote/types';

// Sample Progress Plugin
const progressPlugin: IPlugin = {
  id: 'progress-plugin',
  name: 'Daily Progress',
  description: 'Track your daily progress',
  version: '1.0.0',
  icon: '📊',
  color: '#06b6d4',
  isActive: false,
  trusted: true,

  permissions: {
    storage: {
      maxSize: 512 * 1024, // 512KB
      allowedKeys: ['progress', 'goals', 'history'],
    },
    network: {
      allowedDomains: [],
      maxRequests: 0,
    },
    events: {
      canEmit: ['progress:updated'],
      canSubscribe: ['app:date:changed', 'todo:completed', 'habit:completed'],
    },
    ui: {
      maxHeight: 250,
      allowedComponents: ['div', 'span', 'button'],
    },
  },

  data: {
    progress: {
      completed: 7,
      total: 12,
      percentage: 58,
    },
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return <ProgressPluginContent date={date} data={data} sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('last-updated', date.toISOString());

      // Subscribe to other plugins' events
      sandbox?.hostAPI.subscribeToEvent('todo:completed', eventData => {
        console.log('Progress plugin: Todos updated', eventData);
      });

      sandbox?.hostAPI.subscribeToEvent('habit:completed', eventData => {
        console.log('Progress plugin: Habits updated', eventData);
      });
    } catch (error) {
      console.error('Progress plugin activation error:', error);
    }
  },
};

export default progressPlugin;

function ProgressPluginContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const [progress, setProgress] = useState(
    data?.progress || {
      completed: 0,
      total: 0,
      percentage: 0,
    },
  );

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await sandbox?.storage.get('progress');
        if (savedProgress) {
          setProgress(savedProgress);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };
    loadProgress();
  }, [sandbox]);

  const updateProgress = async (completed: number, total: number) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const newProgress = { completed, total, percentage };

    setProgress(newProgress);

    try {
      await sandbox?.storage.set('progress', newProgress);
      sandbox?.hostAPI.updatePluginData({ progress: newProgress });
      sandbox?.hostAPI.emitEvent('progress:updated', newProgress);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm">Daily Progress</h4>
        <button
          onClick={() =>
            updateProgress(progress.completed + 1, progress.total + 1)
          }
          className="text-xs bg-cyan-500 text-white px-2 py-1 rounded hover:bg-cyan-600"
        >
          Add Task
        </button>
      </div>
      <div className="bg-cyan-50 p-3 rounded">
        <div className="text-cyan-900 mb-2">
          {progress.completed}/{progress.total} tasks completed
        </div>
        <div className="w-full bg-cyan-200 rounded-full h-2">
          <div
            className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <div className="text-sm text-cyan-700 mt-1">
          {progress.percentage}% complete
        </div>
      </div>
    </div>
  );
}
