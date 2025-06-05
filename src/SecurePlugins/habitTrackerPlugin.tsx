import { useEffect, useState } from 'react';
import { IPlugin, PluginSandbox } from 'remote/types';

// Sample Habit Tracker Plugin (for backward compatibility)
const habitTrackerPlugin: IPlugin = {
  id: 'habit-tracker-plugin',
  name: 'Habit Tracker',
  description: 'Track your daily habits',
  version: '1.0.0',
  icon: '🎯',
  color: '#8b5cf6',
  isActive: false,
  trusted: true,

  permissions: {
    storage: {
      maxSize: 1024 * 1024, // 1MB
      allowedKeys: ['habits', 'streaks', 'stats'],
    },
    network: {
      allowedDomains: [],
      maxRequests: 0,
    },
    events: {
      canEmit: ['habit:completed', 'habit:streak'],
      canSubscribe: ['app:date:changed'],
    },
    ui: {
      maxHeight: 350,
      allowedComponents: ['div', 'span', 'button', 'checkbox'],
    },
  },

  data: {
    habits: [],
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return <HabitTrackerContent date={date} data={data} sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('last-checked', date.toISOString());
    } catch (error) {
      console.error('Habit tracker activation error:', error);
    }
  },
};

function HabitTrackerContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const [habits, setHabits] = useState(data?.habits || []);

  useEffect(() => {
    const loadHabits = async () => {
      try {
        const savedHabits = await sandbox?.storage.get('habits');
        if (savedHabits) {
          setHabits(savedHabits);
        }
      } catch (error) {
        console.error('Error loading habits:', error);
      }
    };
    loadHabits();
  }, [sandbox]);

  const toggleHabit = async (index: number) => {
    const updatedHabits = habits.map((habit: any, i: number) =>
      i === index ? { ...habit, completed: !habit.completed } : habit,
    );
    setHabits(updatedHabits);

    try {
      await sandbox?.storage.set('habits', updatedHabits);
      sandbox?.hostAPI.updatePluginData({ habits: updatedHabits });

      const completedCount = updatedHabits.filter(
        (h: any) => h.completed,
      ).length;
      sandbox?.hostAPI.emitEvent('habit:completed', {
        total: updatedHabits.length,
        completed: completedCount,
      });
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Habits</h4>
      <div className="space-y-1">
        {habits.map((habit: any, idx: number) => (
          <div
            key={idx}
            className={`flex items-center justify-between text-sm p-2 rounded cursor-pointer ${
              habit.completed ? 'bg-purple-50' : 'bg-gray-50'
            }`}
            onClick={() => toggleHabit(idx)}
          >
            <span className={habit.completed ? 'line-through' : ''}>
              {habit.name}
            </span>
            <span
              className={habit.completed ? 'text-purple-600' : 'text-gray-400'}
            >
              {habit.completed ? '✓' : '○'}
            </span>
          </div>
        ))}
        {habits.length === 0 && (
          <div className="text-muted-foreground text-sm italic">
            No habits configured
          </div>
        )}
      </div>
    </div>
  );
}

export default habitTrackerPlugin;
