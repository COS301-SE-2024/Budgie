import { help } from './help-modal';

export default {
  component: help,
  parameters: {
    layout: 'fullscreen',
  },
};

export const helpPage = {
  render: () => <help />, // this function specifies how to render a variant
};
