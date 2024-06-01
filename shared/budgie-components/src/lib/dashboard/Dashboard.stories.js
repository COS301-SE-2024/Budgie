import { Dashboard } from './Dashboard';

export default {
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
  },
};

export const DefaultDashboard = {
  render: () => <Dashboard />, // this function specifies how to render a variant
};