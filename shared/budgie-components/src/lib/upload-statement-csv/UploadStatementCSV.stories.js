import { UploadStatementCSV } from './UploadStatementCSV';

export default {
  component: UploadStatementCSV,
  parameters: {
    layout: 'fullscreen',
  },
};

export const DefaultUploadStatementCSV = {
  render: () => <UploadStatementCSV />, // this function specifies how to render a variant
};