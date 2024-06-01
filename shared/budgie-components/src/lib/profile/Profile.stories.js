import { Profile } from './Profile';

export default {
  component: Profile,
  parameters: {
    layout: 'fullscreen',
  },
};

export const DefaultProfile = {
  render: () => <Profile />, // this function specifies how to render a variant
};