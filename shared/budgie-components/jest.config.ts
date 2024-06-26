/* eslint-disable */
export default {
  displayName: 'shared-budgie-components',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/shared/budgie-components',
  coverageReporters: ['text', 'lcov', 'clover', 'cobertura'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
