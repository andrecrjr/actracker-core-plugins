import { useEffect, useState } from 'react';
import { IPlugin, PluginSandbox } from 'remote/types';

// Sample Todo Plugin
const todoPlugin: IPlugin = {
  id: 'todo-plugin',
  name: 'Daily Todo',
  description: 'Manage your daily tasks',
  version: '1.0.0',
  icon: '✅',
  color: '#10b981',
  isActive: false,
  trusted: true, // Sample plugins are trusted

  permissions: {
    storage: {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedKeys: ['todos', 'settings', 'completed-count'],
    },
    network: {
      allowedDomains: [],
      maxRequests: 0,
    },
    events: {
      canEmit: ['todo:completed', 'todo:added'],
      canSubscribe: ['app:date:changed'],
    },
    ui: {
      maxHeight: 400,
      allowedComponents: ['div', 'span', 'button', 'input', 'checkbox'],
    },
  },

  data: {
    todos: [],
  },

  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => {
    return <TodoPluginContent date={date} data={data} sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    console.log('Todo plugin activated for', date);
    try {
      await sandbox?.storage.set('last-activated', date.toISOString());
    } catch (error) {
      console.error('Todo plugin activation error:', error);
    }
  },

  onDataUpdate: async (data: any, sandbox?: PluginSandbox) => {
    console.log('Todo data updated:', data);
    try {
      await sandbox?.storage.set('todos', data.todos);
      sandbox?.hostAPI.emitEvent('todo:completed', {
        completedCount: data.todos?.filter((t: any) => t.completed).length,
      });
    } catch (error) {
      console.error('Todo plugin data update error:', error);
    }
  },
};

function TodoPluginContent({
  date,
  data,
  sandbox,
}: { date: Date; data?: any; sandbox?: PluginSandbox }) {
  const [todos, setTodos] = useState<any[]>(data?.todos || []);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const savedTodos = await sandbox?.storage.get('todos');
        if (savedTodos) {
          setTodos(savedTodos);
        }
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    };
    loadTodos();
  }, [sandbox]);

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const updatedTodos = [...todos, { text: newTodo, completed: false }];
    setTodos(updatedTodos);
    setNewTodo('');

    try {
      await sandbox?.storage.set('todos', updatedTodos);
      sandbox?.hostAPI.updatePluginData({ todos: updatedTodos });
      sandbox?.hostAPI.emitEvent('todo:added', { text: newTodo });
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (index: number) => {
    const updatedTodos = todos.map((todo, i) =>
      i === index ? { ...todo, completed: !todo.completed } : todo,
    );
    setTodos(updatedTodos);

    try {
      await sandbox?.storage.set('todos', updatedTodos);
      sandbox?.hostAPI.updatePluginData({ todos: updatedTodos });
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Today's Tasks</h4>

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder="Add new task..."
          className="flex-1 text-xs border rounded px-2 py-1"
          onKeyPress={e => e.key === 'Enter' && addTodo()}
        />
        <button
          onClick={addTodo}
          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          Add
        </button>
      </div>

      <div className="space-y-1">
        {todos.map((todo: any, idx: number) => (
          <div
            key={idx}
            className={`flex items-center gap-2 text-sm p-2 rounded cursor-pointer ${
              todo.completed
                ? 'bg-green-50 text-green-800 line-through'
                : 'bg-gray-50'
            }`}
            onClick={() => toggleTodo(idx)}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => {}} // handled by onClick
              className="mr-1"
            />
            <span className="flex-1">{todo.text}</span>
            {todo.completed && <span>✓</span>}
          </div>
        ))}
        {todos.length === 0 && (
          <div className="text-muted-foreground text-sm italic">
            No tasks for today
          </div>
        )}
      </div>
    </div>
  );
}

export default todoPlugin;
