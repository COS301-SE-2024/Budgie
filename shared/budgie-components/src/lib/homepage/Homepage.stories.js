import { Homepage } from './Homepage';

export default {
  component: Homepage,
  parameters: {
    layout: 'fullscreen',
  },
};

export const DefaultHomepage = {
  render: () => <Homepage />, // this function specifies how to render a variant
};