import { SignUpModal } from './SignUpModal';

export default {
  component: SignUpModal,
  parameters: {
    layout: 'fullscreen',
  },
};

export const SignUp = {
  render: () => <SignUpModal />, // this function specifies how to render a variant
};
