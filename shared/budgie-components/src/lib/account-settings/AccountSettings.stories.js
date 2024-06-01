import { AccountSettings } from './AccountSettings';

export default {
  component: AccountSettings,
  parameters: {
    layout: 'fullscreen',
  },
};

export const DefaultAccountSettings = {
  render: () => <AccountSettings />, // this function specifies how to render a variant
};