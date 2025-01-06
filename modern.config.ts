import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js';

export default defineConfig({
  dev: {
    port: 3051,
  },
  runtime: {
    router: true,
  },
  output: {
    assetPrefix:
      process.env.NODE_ENV === 'production' && process.env.CDN_DOMAIN
        ? process.env.CDN_DOMAIN
        : '/',
  },
  plugins: [
    appTools({
      bundler: 'rspack',
    }),
    moduleFederationPlugin(),
  ],
});
