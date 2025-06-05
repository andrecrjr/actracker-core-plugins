import { createModuleFederationConfig } from '@module-federation/modern-js';

export default createModuleFederationConfig({
  name: 'corePlugin',
  filename: 'static/remoteEntry.js',
  exposes: {
    './TodoPlugin': './src/SecurePlugins/todoPlugin.tsx',
    './NotePlugin': './src/SecurePlugins/notePlugin.tsx',
    './WeatherPlugin': './src/SecurePlugins/weatherPlugin.tsx',
    './HabitTrackerPlugin': './src/SecurePlugins/habitTrackerPlugin.tsx',
    './CalendarPlugin': './src/SecurePlugins/calendarPlugin.tsx',
    './ProgressPlugin': './src/SecurePlugins/progressPlugin.tsx',
    './InteractivePlugin': './src/SecurePlugins/interactivePlugin.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  remotes: {
    remote: `daystack@${
      process.env.DAYSTACK_MF_JSON && process.env.NODE_ENV === 'production'
        ? `${process.env.DAYSTACK_MF_JSON}`
        : `http://localhost:8080/mf-manifest.json`
    }`,
  },
  manifest: {
    filePath: 'static',
  },
});
