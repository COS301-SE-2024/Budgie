import { SignInModal } from './SignInModal';

export default {
  component: SignInModal,
  parameters: {
    layout: 'fullscreen',
  },
};

export const SignIn = {
  render: () => <SignInModal />, // this function specifies how to render a variant
};
