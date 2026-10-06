import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rrobinson.me',
  integrations: [mdx(), sitemap()],
  // Plain static files: the container just serves dist/ with nginx.
  output: 'static',
  trailingSlash: 'ignore',
});
