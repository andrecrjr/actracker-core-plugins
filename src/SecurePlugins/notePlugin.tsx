import { useEffect, useState } from 'react';
import { IPlugin, PluginSandbox } from 'remote/types';

// Sample Note Plugin
export const notePlugin: IPlugin = {
  id: 'note-plugin',
  name: 'Daily Notes',
  description: 'Quick notes for the day',
  version: '1.0.0',
  icon: '📝',
  color: '#3b82f6',
  isActive: false,
  trusted: true,

  permissions: {
    storage: {
      maxSize: 1024 * 1024, // 1MB
      allowedKeys: ['notes', 'drafts'],
    },
    network: {
      allowedDomains: [],
      maxRequests: 0,
    },
    events: {
      canEmit: ['note:saved'],
      canSubscribe: ['app:date:changed'],
    },
    ui: {
      maxHeight: 300,
      allowedComponents: ['div', 'span', 'textarea', 'button'],
    },
  },

  data: {
    note: 'Working on the new plugin architecture. Great progress so far! Need to add more interactive features.',
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return <NotePluginContent date={date} data={data} sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('last-opened', date.toISOString());
    } catch (error) {
      console.error('Note plugin activation error:', error);
    }
  },

  onDataUpdate: async (data: any, sandbox?: PluginSandbox) => {
    try {
      await sandbox?.storage.set('notes', data.note);
      sandbox?.hostAPI.emitEvent('note:saved', {
        length: data.note?.length || 0,
      });
    } catch (error) {
      console.error('Note plugin data update error:', error);
    }
  },
};

function NotePluginContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const [note, setNote] = useState(data?.note || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadNote = async () => {
      try {
        const savedNote = await sandbox?.storage.get('notes');
        if (savedNote) {
          setNote(savedNote);
        }
      } catch (error) {
        console.error('Error loading note:', error);
      }
    };
    loadNote();
  }, [sandbox]);

  const saveNote = async () => {
    try {
      await sandbox?.storage.set('notes', note);
      sandbox?.hostAPI.updatePluginData({ note });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm">Daily Note</h4>
        <button
          onClick={() => (isEditing ? saveNote() : setIsEditing(true))}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="text-sm">
        {isEditing ? (
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full p-2 border rounded text-xs resize-none"
            rows={4}
            placeholder="Write your note here..."
          />
        ) : note ? (
          <p className="bg-blue-50 p-3 rounded text-blue-900">{note}</p>
        ) : (
          <p className="text-muted-foreground italic">No note for today</p>
        )}
      </div>
    </div>
  );
}
