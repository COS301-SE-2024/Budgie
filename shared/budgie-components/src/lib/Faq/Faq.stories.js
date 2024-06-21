import { Faq } from './Faq';

export default {
  component: Faq,
  parameters: {
    layout: 'fullscreen',
  },
};

export const DefaultFaq = {
  render: () => <Faq />, // this function specifies how to render a variant
};
