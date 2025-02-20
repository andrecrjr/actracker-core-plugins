import React, { useEffect, useState, useMemo } from 'react';
import {
  Badge,
  Calendar,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'remote/Components';
import { useHabits } from 'remote/hooks';
import type { Habit, HabitPlugin } from 'remote/types';
import { cn, formatDate, formatDisplayDate, getMonthWeeks } from 'remote/utils';

const menstrualCyclePlugin: HabitPlugin = {
  id: 'menstrual-cycle-plugin',
  name: 'Menstrual Cycle Tracker',
  description: 'Track and predict menstrual cycles.',
  version: '1.5.0',
  settings: {
    enabled: true,
    cycleLength: 28,
    lutealPhase: 14,
    predictionCount: 6,
  },

  RenderHabitCard(habit: Habit, date: Date) {
    return <CycleSummary habit={habit} date={date} />;
  },

  RenderHabitForm(
    habit: Habit | null,
    handleSettingChange: (updatedHabit: Habit) => void,
  ) {
    return habit ? (
      <CycleForm habit={habit} handleSettingChange={handleSettingChange} />
    ) : null;
  },
};

const CycleSummary = ({ habit, date }: { habit: Habit; date: Date }) => {
  const { getHabitById } = useHabits();
  const fullHabit = getHabitById(habit.id) || habit;
  const cycleData = fullHabit.pluginData?.['menstrual-cycle-plugin'] || {};
  const currentDateStr = formatDate(date);

  return (
    <div className="space-y-2">
      {cycleData.predictions?.map((prediction: any, index: number) => (
        <div key={index}>
          {prediction.cycleStart === currentDateStr && (
            <Badge variant="destructive">Cycle Start</Badge>
          )}
          {prediction.ovulationDate === currentDateStr && (
            <Badge variant="default">Ovulation Day</Badge>
          )}
          {prediction.fertileWindow &&
            isDateInRange(
              date,
              prediction.fertileWindow.start,
              prediction.fertileWindow.end,
            ) && (
              <Badge variant="secondary">
                Fertile Window: {prediction.fertileWindow.start} -{' '}
                {prediction.fertileWindow.end}
              </Badge>
            )}
        </div>
      ))}
    </div>
  );
};

const CycleForm = ({
  habit,
  handleSettingChange,
}: {
  habit: Habit;
  handleSettingChange: (updatedHabit: Habit) => void;
}) => {
  const { partialUpdateHabit } = useHabits();
  const cycleData = habit.pluginData?.['menstrual-cycle-plugin'] || {};

  const [startDate, setStartDate] = useState<Date>(
    habit.startDate ? new Date(habit.startDate) : new Date(),
  );
  const [cycleLength, setCycleLength] = useState<number>(
    cycleData.cycleLength || 28,
  );
  const [lutealPhase, setLutealPhase] = useState<number>(
    cycleData.lutealPhase || 14,
  );
  const [predictionCount, setPredictionCount] = useState<number>(
    cycleData.predictionCount || 6,
  );
  const [predictions, setPredictions] = useState(() =>
    generatePredictions(startDate, cycleLength, lutealPhase, predictionCount),
  );

  const isValid = cycleLength > lutealPhase + 5;

  const updateHabitData = (updatedStartDate: Date) => {
    const newPredictions = generatePredictions(
      updatedStartDate,
      cycleLength,
      lutealPhase,
      predictionCount,
    );
    setPredictions(newPredictions);

    const updatedData = {
      ...habit,
      startDate: formatDate(updatedStartDate),
      pluginData: {
        ...habit.pluginData,
        'menstrual-cycle-plugin': {
          cycleStart: formatDate(updatedStartDate),
          cycleLength,
          lutealPhase,
          predictionCount,
          predictions: newPredictions,
        },
      },
    };

    partialUpdateHabit(habit.id, updatedData);
    handleSettingChange(updatedData);
  };

  useEffect(() => {
    if (isValid && startDate) {
      const newPredictions = generatePredictions(
        startDate,
        cycleLength,
        lutealPhase,
        predictionCount,
      );
      setPredictions(newPredictions);
      updateHabitData(startDate);
    }
  }, [startDate, cycleLength, lutealPhase, predictionCount]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      updateHabitData(date);
    }
  };

  return (
    <details open className="space-y-4">
      <summary className="text-lg font-bold cursor-pointer mb-2">
        Menstrual Cycle Settings
      </summary>
      <div className="grid gap-2">
        <label>Last Cycle Start</label>
        <Calendar
          mode="single"
          selected={startDate}
          onSelect={handleDateChange}
        />
      </div>

      <div className="grid gap-2">
        <label>Cycle Length (days)</label>
        <input
          type="number"
          value={cycleLength}
          onChange={e => setCycleLength(Number(e.target.value))}
          min={21}
          max={35}
        />
      </div>

      <div className="grid gap-2">
        <label>Luteal Phase (days)</label>
        <input
          type="number"
          value={lutealPhase}
          onChange={e => setLutealPhase(Number(e.target.value))}
          min={10}
          max={cycleLength - 5}
          className={isValid ? '' : 'border-red-500'}
        />
        {!isValid && (
          <span className="text-red-500">
            Luteal phase must be at least 5 days shorter than cycle length.
          </span>
        )}
      </div>

      <div className="grid gap-2">
        <label>Prediction Count</label>
        <input
          type="number"
          value={predictionCount}
          onChange={e => setPredictionCount(Number(e.target.value))}
          min={1}
          max={12}
        />
      </div>

      <CycleCalendar
        startDate={startDate}
        cycleLength={cycleLength}
        lutealPhase={lutealPhase}
        predictions={predictions}
      />
    </details>
  );
};

const CycleCalendar = ({
  startDate,
  cycleLength,
  lutealPhase,
  predictions,
}: {
  startDate: Date;
  cycleLength: number;
  lutealPhase: number;
  predictions: {
    cycleStart: string;
    nextPeriod: string;
    ovulationDate: string;
    fertileWindow: { start: string; end: string };
  }[];
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const weeks = useMemo(() => getMonthWeeks(currentMonth), [currentMonth]);

  const eventMap: Record<string, string[]> = useMemo(() => {
    const map: Record<string, string[]> = {};

    predictions.forEach(cycle => {
      if (!map[cycle.cycleStart]) map[cycle.cycleStart] = [];
      map[cycle.cycleStart].push('period');

      if (!map[cycle.ovulationDate]) map[cycle.ovulationDate] = [];
      map[cycle.ovulationDate].push('ovulation');

      const fertileStart = cycle.fertileWindow.start;
      const fertileEnd = cycle.fertileWindow.end;

      for (
        let d = new Date(fertileStart);
        d <= new Date(fertileEnd);
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = formatDate(d);
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push('fertile');
      }
    });

    return map;
  }, [predictions]);

  const getEventTypes = (date: Date) => {
    const dateStr = formatDate(date);
    return eventMap[dateStr] || [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-center">
          Cycle Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => {
              const prevMonth = new Date(currentMonth);
              prevMonth.setMonth(currentMonth.getMonth() - 1);
              setCurrentMonth(prevMonth);
            }}
            aria-label="Previous month"
          >
            &lt;
          </button>
          <span className="font-bold">
            {currentMonth.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            onClick={() => {
              const nextMonth = new Date(currentMonth);
              nextMonth.setMonth(currentMonth.getMonth() + 1);
              setCurrentMonth(nextMonth);
            }}
            aria-label="Next month"
          >
            &gt;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-xs">
              {day}
            </div>
          ))}

          {weeks.flat().map((date, index) => {
            const eventTypes = getEventTypes(date);
            const bgClass = eventTypes.includes('period')
              ? 'bg-red-500'
              : eventTypes.includes('ovulation')
                ? 'bg-green-500'
                : eventTypes.includes('fertile')
                  ? 'bg-yellow-500'
                  : 'bg-gray-100';

            return (
              <div
                key={index}
                className={cn(
                  'aspect-square text-xs flex items-center justify-center',
                  bgClass,
                )}
              >
                {date.getDate()}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const generatePredictions = (
  startDate: Date,
  cycleLength: number,
  lutealPhase: number,
  count: number,
) => {
  const predictions = [];
  let currentStart = new Date(startDate);

  for (let i = 0; i < count; i++) {
    const nextStart = new Date(currentStart);
    nextStart.setDate(currentStart.getDate() + cycleLength);

    const ovulationDate = new Date(currentStart);
    ovulationDate.setDate(currentStart.getDate() + (cycleLength - lutealPhase));

    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(ovulationDate.getDate() - 5);

    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(ovulationDate.getDate() + 1);

    predictions.push({
      cycleStart: formatDate(currentStart),
      nextPeriod: formatDate(nextStart),
      ovulationDate: formatDate(ovulationDate),
      fertileWindow: {
        start: formatDate(fertileStart),
        end: formatDate(fertileEnd),
      },
    });

    currentStart = nextStart;
  }

  return predictions;
};

const isDateInRange = (date: Date, start: string, end: string) => {
  const target = date.setHours(0, 0, 0, 0);
  return (
    new Date(start).setHours(0, 0, 0, 0) <= target &&
    target <= new Date(end).setHours(0, 0, 0, 0)
  );
};

export default menstrualCyclePlugin;
