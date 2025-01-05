import { createModuleFederationConfig } from '@module-federation/modern-js';

export default createModuleFederationConfig({
  name: 'reminderPlugin',
  filename: 'remoteEntry.js',
  exposes: {
    './ReminderPlugin': './src/components/ReminderPlugin.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  remotes: {
    remote: 'actracker@http://localhost:8080/mf-manifest.json',
  },
});
