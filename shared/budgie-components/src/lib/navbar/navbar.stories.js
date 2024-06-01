import { Navbar } from './navbar';

export default {
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
  },
};

export const DefaultNavBar = {
  render: () => <Navbar />, // this function specifies how to render a variant
};