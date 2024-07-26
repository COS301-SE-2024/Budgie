import { MonthlyTransactionsView } from './MonthlyTransactionsView';

export default {
  component: MonthlyTransactionsView,
  parameters: {
    layout: 'fullscreen',
  },
};

export const DefaultMonthlyTransactionsView = {
  render: () => <MonthlyTransactionsView />, // this function specifies how to render a variant
};