import { IPlugin, PluginSandbox } from 'remote/types';

// Sample Calendar Plugin
const calendarPlugin: IPlugin = {
  id: 'calendar-plugin',
  name: 'Mini Calendar',
  description: 'Quick calendar view',
  version: '1.0.0',
  icon: '📅',
  color: '#ef4444',
  isActive: false,
  trusted: true,

  permissions: {
    storage: {
      maxSize: 256 * 1024, // 256KB
      allowedKeys: ['calendar-view', 'selected-date'],
    },
    network: {
      allowedDomains: [],
      maxRequests: 0,
    },
    events: {
      canEmit: ['calendar:date-selected'],
      canSubscribe: ['app:date:changed'],
    },
    ui: {
      maxHeight: 200,
      allowedComponents: ['div', 'span', 'button'],
    },
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return <CalendarPluginContent date={date} data={data} sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('selected-date', date.toISOString());
    } catch (error) {
      console.error('Calendar plugin activation error:', error);
    }
  },
};

function CalendarPluginContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  const selectDate = async () => {
    try {
      await sandbox?.storage.set('selected-date', date.toISOString());
      sandbox?.hostAPI.emitEvent('calendar:date-selected', {
        date: date.toISOString(),
      });
    } catch (error) {
      console.error('Error selecting date:', error);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Calendar</h4>
      <div
        className="bg-red-50 p-3 rounded text-center cursor-pointer hover:bg-red-100"
        onClick={selectDate}
      >
        <div className="text-2xl font-bold text-red-900">{date.getDate()}</div>
        <div className="text-red-800">
          {date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })}
        </div>
        {isToday && <div className="text-xs text-red-600 mt-1">Today</div>}
      </div>
    </div>
  );
}

export default calendarPlugin;
