export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  startDate: string;
  endDate?: string;
  completedDates: string[];
  daysOfWeek?: number[];
  specificDayOfMonth?: number | null;
  repeatMonthly?: boolean;
  archived?: boolean;
  archiveDate?: string;
  hidden?: boolean;
  plugins?: PluginHabit[];
  pluginData?: Record<string, any>;
}
export interface PluginHabit {
  id: string;
  enabled: boolean;
  settings?: Record<string, any>;
}
