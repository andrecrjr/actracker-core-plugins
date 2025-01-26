// FILE: src/ac-components/lib/plugins/core/menstrualCyclePlugin.tsx
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Calendar,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'remote/Components';
import { useHabitStore } from 'remote/hooks';
import type { Habit, HabitPlugin } from 'remote/types';
import { cn, formatDate, getMonthWeeks } from 'remote/utils';

const PLUGIN_ID = 'menstrual-cycle-plugin';

const menstrualCyclePlugin: HabitPlugin = {
  id: PLUGIN_ID,
  name: 'Cycle Tracker',
  description: 'Track and predict menstrual cycles',
  version: '1.0.1',
  settings: {
    minCycleLength: 21,
    maxCycleLength: 35,
    defaultCycleLength: 28,
    lutealPhase: 14,
  },

  RenderHabitCard(habit: Habit, date: Date) {
    return <CycleDayIndicator habit={habit} date={date} />;
  },

  RenderHabitForm(habit: Habit | null, handleSettingChange) {
    return habit && <CycleSettingsForm habit={habit} />;
  },
};

// Helper component for habit card display
const CycleDayIndicator = ({ habit, date }: { habit: Habit; date: Date }) => {
  const { getCurrentHabitById } = useHabitStore();
  const fullHabit = getCurrentHabitById(habit.id) || habit;
  const cycleData = fullHabit.pluginData?.[PLUGIN_ID] || {};
  const currentDate = formatDate(date);

  const getCycleEvent = () => {
    if (cycleData.cycleStart === currentDate) return 'menstruation';
    if (cycleData.ovulationDate === currentDate) return 'ovulation';
    if (
      currentDate >= cycleData.fertileWindow?.start &&
      currentDate <= cycleData.fertileWindow?.end
    )
      return 'fertile';
    return null;
  };

  const event = getCycleEvent();

  return (
    <div className="space-y-1">
      {event === 'menstruation' && (
        <Badge variant="destructive" className="w-full text-xs">
          Menstruation Start
        </Badge>
      )}
      {event === 'ovulation' && (
        <Badge variant="default" className="w-full text-xs">
          Ovulation Day
        </Badge>
      )}
      {event === 'fertile' && (
        <Badge variant="secondary" className="w-full text-xs">
          Fertile Window
        </Badge>
      )}
    </div>
  );
};

// Main form component for cycle configuration
const CycleSettingsForm = ({ habit }: { habit: Habit }) => {
  const { handleHabitPartialUpdate } = useHabitStore();
  const [startDate, setStartDate] = useState<Date | undefined>(
    habit.startDate ? new Date(habit.startDate) : undefined,
  );

  const [cycleLength, setCycleLength] = useState(
    habit.pluginData?.[PLUGIN_ID]?.cycleLength ||
      menstrualCyclePlugin.settings?.defaultCycleLength,
  );

  const predictCycle = useCallback((start: Date, length: number) => {
    const cycleStart = new Date(start);
    const nextPeriod = new Date(cycleStart);
    nextPeriod.setDate(cycleStart.getDate() + length);

    const ovulationDate = new Date(cycleStart);
    ovulationDate.setDate(cycleStart.getDate() + (length - 14));

    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(ovulationDate.getDate() - 3);

    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(ovulationDate.getDate() + 1);

    return {
      nextPeriod: formatDate(nextPeriod),
      ovulationDate: formatDate(ovulationDate),
      fertileWindow: {
        start: formatDate(fertileStart),
        end: formatDate(fertileEnd),
      },
    };
  }, []);

  useEffect(() => {
    if (startDate && habit) {
      const predictions = predictCycle(startDate, cycleLength);
      handleHabitPartialUpdate(habit.id, {
        pluginData: {
          ...habit.pluginData,
          [PLUGIN_ID]: {
            cycleStart: formatDate(startDate),
            cycleLength,
            ...predictions,
          },
        },
      });
    }
  }, [startDate, cycleLength, handleHabitPartialUpdate, habit, predictCycle]);

  const handleCycleLengthChange = (value: number) => {
    const clampedValue = Math.min(
      Math.max(value, menstrualCyclePlugin.settings?.minCycleLength),
      menstrualCyclePlugin.settings?.maxCycleLength,
    );
    setCycleLength(clampedValue);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Last Menstrual Start</label>
        <Calendar
          mode="single"
          selected={startDate}
          onSelect={setStartDate}
          className="rounded-md border"
          disabled={date => date > new Date()}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">
          Cycle Length (days) - {cycleLength}
        </label>
        <input
          type="range"
          min={menstrualCyclePlugin.settings?.minCycleLength}
          max={menstrualCyclePlugin.settings?.maxCycleLength}
          value={cycleLength}
          onChange={e => handleCycleLengthChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {startDate && (
        <CycleCalendar
          startDate={startDate}
          cycleLength={cycleLength}
          predictions={predictCycle(startDate, cycleLength)}
        />
      )}
    </div>
  );
};

// Calendar visualization component
const CycleCalendar = ({
  startDate,
  cycleLength,
  predictions,
}: {
  startDate: Date;
  cycleLength: number;
  predictions: {
    nextPeriod: string;
    ovulationDate: string;
    fertileWindow: { start: string; end: string };
  };
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(startDate));
  const weeks = getMonthWeeks(currentMonth);

  const navigateMonth = (months: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + months);
    setCurrentMonth(newDate);
  };

  const getCycleDayType = (date: Date) => {
    const dateStr = formatDate(date);
    if (dateStr === predictions.nextPeriod) return 'period';
    if (dateStr === predictions.ovulationDate) return 'ovulation';
    if (
      dateStr >= predictions.fertileWindow.start &&
      dateStr <= predictions.fertileWindow.end
    )
      return 'fertile';
    return 'neutral';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {currentMonth.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
            >
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px">
          {weeks.flat().map(date => {
            const type = getCycleDayType(date);
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

            return (
              <div
                key={formatDate(date)}
                className={cn(
                  'aspect-square text-center p-1 text-xs',
                  isCurrentMonth ? 'bg-background' : 'bg-muted/50',
                  type === 'period' && 'bg-red-500/80 text-white',
                  type === 'ovulation' && 'bg-green-500/80 text-white',
                  type === 'fertile' && 'bg-yellow-500/80',
                )}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500/80 rounded-sm" />
            <span className="text-xs">Menstruation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-500/80 rounded-sm" />
            <span className="text-xs">Ovulation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-yellow-500/80 rounded-sm" />
            <span className="text-xs">Fertile Window</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default menstrualCyclePlugin;
