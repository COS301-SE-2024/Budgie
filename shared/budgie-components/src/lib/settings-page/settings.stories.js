import { Settings } from './settings';

export default {
  component: Settings,
  parameters: {
    layout: 'fullscreen',
  },
};

export const DefaultNavBar = {
  render: () => <Settings />, // this function specifies how to render a variant
};