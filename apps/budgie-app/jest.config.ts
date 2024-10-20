/* eslint-disable */

import { join } from 'path';
export default {
  displayName: 'budgie-app',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/budgie-app',
  coverageReporters: ['text', 'lcov', 'clover', 'cobertura'],
  setupFilesAfterEnv: [join(__dirname, 'jest.setup.js')],
};