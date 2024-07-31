const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        TripSans: 'TripSans',
      },
      colors: {
        BudgieGreen1: '#8EE5A2',
        BudgieGreen2: '#B4E5A2',
        BudgieGreen3: '#71C194',
        BudgieBlue: '#293652',
        BudgieWhite: '#F8F8F8',
        BudgieGray: '#E1E1E1',
        BudgieGrayLight: '#EAEAEA',
      },
    },
  },
  plugins: [],
};
