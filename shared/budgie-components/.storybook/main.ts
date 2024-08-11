import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  // stories: ['../src/lib/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  stories: ['../src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],

  addons: ['@storybook/addon-essentials', '@chromatic-com/storybook'],

  framework: {
    name: '@storybook/nextjs',
    options: {},
  },

  docs: {
    autodocs: true
  }
};

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/recipes/storybook/custom-builder-configs
