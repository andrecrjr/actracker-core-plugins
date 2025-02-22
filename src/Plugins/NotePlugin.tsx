import type React from 'react';
import { useEffect, useState } from 'react';
import { HabitProvider, useHabitStore } from 'remote/hooks';
import type { Habit } from 'remote/types';
import type { HabitPlugin } from 'remote/types';

export const notesPlugin: HabitPlugin = {
  id: 'core-notes',
  name: 'Notes',
  description: 'Add notes and reflections to your habit completions',
  version: '1.0.0',

  settings: {
    enabled: true,
    maxLength: 500,
    enableTags: true,
  },

  async onHabitComplete(habit: Habit, date: string): Promise<void> {
    console.log(`Ready to add notes for ${habit.title} on ${date}`);
  },
  RenderHabitCard(habit: Habit, date: Date) {
    return <NotesPluginComponent noteHabit={habit} date={date} plugin={this} />;
  },
};

const NotesPluginComponent = ({
  noteHabit,
  plugin,
  date,
}: { noteHabit: Habit; date: Date; plugin: HabitPlugin }) => {
  const { partialUpdateHabit, getHabitById, habits } = useHabitStore();
  const currentDate = date.toISOString().split('T')[0];

  const [habit, setHabit] = useState<Habit | null>(null);
  const [updateNote, setNote] = useState('');

  useEffect(() => {
    const currentHabit = getHabitById(noteHabit.id) as Habit;
    setHabit(currentHabit);

    const habitPluginTextData = currentHabit?.pluginData?.[plugin?.id]?.filter(
      (item: Record<string, any>) => item.noteDate === currentDate,
    );

    if (habitPluginTextData?.length > 0) {
      setNote(habitPluginTextData[0].text || '');
    } else {
      setNote('');
    }
  }, [habits, noteHabit.id, plugin.id, currentDate, getHabitById]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
  };

  const updateNoteOnBlur = () => {
    if (!habit) return;

    const updatedPluginData = [
      ...(habit.pluginData?.[plugin.id] || []).filter(
        (item: Record<string, any>) => item.noteDate !== currentDate,
      ),
      {
        text: updateNote,
        noteDate: date.toISOString().split('T')[0],
      },
    ];

    partialUpdateHabit(habit.id, {
      pluginData: {
        ...habit.pluginData,
        [plugin.id]: updatedPluginData,
      },
    });
  };

  return (
    <textarea
      className="w-full"
      placeholder={'Take your note for'}
      key={habit?.id}
      value={updateNote}
      onChange={handleNoteChange}
      onBlur={updateNoteOnBlur}
      maxLength={plugin?.settings?.maxLength || 500}
    />
  );
};

export default notesPlugin;
