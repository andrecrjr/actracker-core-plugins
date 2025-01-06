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
    remote: `actracker@${
      process.env.ACTRACKER_MF_JSON && process.env.NODE_ENV === 'production'
        ? `${process.env.ACTRACKER_MF_JSON}`
        : `http://localhost:8080/static/mf-manifest.json`
    }`,
  },
  manifest: {
    filePath: 'static',
  },
});
