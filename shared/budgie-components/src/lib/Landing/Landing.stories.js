import { Landing } from './Landing';

export default {
  component: Landing,
  parameters: {
    layout: 'fullscreen',
  },
};

export const DefaultNavBar = {
  render: () => <Landing />, // this function specifies how to render a variant
};
