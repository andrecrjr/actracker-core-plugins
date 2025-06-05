# Daystack Plugins

This directory contains modular plugin components that are exposed via Module Federation for use in the DayStack application.

## Structure

Each plugin is now in its own dedicated file for better maintainability and modularity:

- `todoPlugin.tsx` - Daily Todo management plugin
- `notePlugin.tsx` - Quick notes for the day plugin
- `weatherPlugin.tsx` - Weather information plugin
- `habitTrackerPlugin.tsx` - Daily habit tracking plugin
- `calendarPlugin.tsx` - Mini calendar view plugin
- `progressPlugin.tsx` - Daily progress tracking plugin
- `interactivePlugin.tsx` - Interactive demo plugin with counter

## Module Federation Exports

The following exports are available through Module Federation:

### Individual Plugins
- `./TodoPlugin` - Access to `todoPlugin` component
- `./NotePlugin` - Access to `notePlugin` component
- `./WeatherPlugin` - Access to `weatherPlugin` component
- `./HabitTrackerPlugin` - Access to `habitTrackerPlugin` component
- `./CalendarPlugin` - Access to `calendarPlugin` component
- `./ProgressPlugin` - Access to `progressPlugin` component
- `./InteractivePlugin` - Access to `interactivePlugin` component

### Bulk Export
- `./SecurePlugins` - Access to all plugins array and individual exports

## Usage

### Importing Individual Plugins
```typescript
// Import a specific plugin
import { todoPlugin } from 'corePlugin/TodoPlugin';

// Import multiple individual plugins
import { todoPlugin } from 'corePlugin/TodoPlugin';
import { notePlugin } from 'corePlugin/NotePlugin';
```

### Importing All Plugins
```typescript
// Import all plugins as array
import samplePlugins from 'corePlugin/SecurePlugins';

// Import individual plugins from main export
import { todoPlugin, notePlugin, weatherPlugin } from 'corePlugin/SecurePlugins';
```

## Plugin Interface

Each plugin implements the `IPlugin` interface with the following structure:

```typescript
interface IPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  color: string;
  isActive: boolean;
  trusted: boolean;
  permissions: PluginPermissions;
  data?: any;
  renderContent: (date: Date, data?: any, sandbox?: PluginSandbox) => React.ReactElement;
  onActivate?: (date: Date, sandbox?: PluginSandbox) => Promise<void>;
  onDataUpdate?: (data: any, sandbox?: PluginSandbox) => Promise<void>;
}
```

## Development

When adding new plugins:

1. Create a new file in this directory (e.g., `newPlugin.tsx`)
2. Export the plugin with a descriptive name (e.g., `export const newPlugin`)
3. Add the export to `index.tsx`
4. Add the Module Federation expose entry in `module-federation.config.ts`
5. Update this README with the new plugin documentation
