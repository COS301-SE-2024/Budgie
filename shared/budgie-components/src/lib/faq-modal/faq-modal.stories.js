import { faq } from './faq-modal';

export default {
  component: faq,
  parameters: {
    layout: 'fullscreen',
  },
};

export const faqPage = {
  render: () => <faq />, // this function specifies how to render a variant
};
