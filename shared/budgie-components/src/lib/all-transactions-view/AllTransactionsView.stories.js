import { AllTransactionsView } from './AllTransactionsView';

export default {
  component: AllTransactionsView,
  parameters: {
    layout: 'fullscreen',
  },
};

export const DefaultAllTransactionsView = {
  render: () => <AllTransactionsView />, // this function specifies how to render a variant
};