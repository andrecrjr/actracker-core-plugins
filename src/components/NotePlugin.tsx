import type React from 'react';
import { useEffect, useState } from 'react';
import { useHabitStore } from 'remote/hooks';
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
  const { handleHabitPartialUpdate, getCurrentHabitById } = useHabitStore();
  const habit = getCurrentHabitById(noteHabit.id) as Habit;
  console.log(habit);
  const currentDate = date.toISOString().split('T')[0];
  const [updateNote, setNote] = useState('');

  useEffect(() => {
    console.log(plugin?.id);
    const habitPluginTextData = habit?.pluginData?.[plugin?.id]?.filter(
      (item: Record<string, any>) => item.noteDate === currentDate,
    );

    if (habitPluginTextData?.length > 0) {
      setNote(habitPluginTextData[0].text || '');
    } else {
      setNote('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habit.pluginData, date]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
    const updatedPluginData = [
      ...(habit.pluginData?.[plugin.id] || []).filter(
        (item: Record<string, any>) => item.noteDate !== currentDate,
      ),
      {
        text: newNote,
        noteDate: date.toISOString().split('T')[0],
      },
    ];

    handleHabitPartialUpdate(habit.id, {
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
      key={habit.id}
      value={updateNote}
      onChange={handleNoteChange}
      maxLength={plugin?.settings?.maxLength || 500}
    />
  );
};

export default notesPlugin;
