import { DisplaySettings } from './DisplaySettings';

export default {
  component: DisplaySettings,
  parameters: {
    layout: 'fullscreen',
  },
};

export const DefaultDisplaySettings = {
  render: () => <DisplaySettings />, // this function specifies how to render a variant
};
