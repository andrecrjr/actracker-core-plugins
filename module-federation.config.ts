import { createModuleFederationConfig } from '@module-federation/modern-js';

export default createModuleFederationConfig({
  name: 'corePlugin',
  filename: 'static/remoteEntry.js',
  exposes: {
    './DueDatePlugin': './src/components/DueDatePlugin.tsx',
    './NotePlugin': './src/components/NotePlugin.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
  remotes: {
    remote: 'actracker@http://localhost:8080/static/mf-manifest.json',
  },
  manifest: {
    filePath: 'static',
  },
});
