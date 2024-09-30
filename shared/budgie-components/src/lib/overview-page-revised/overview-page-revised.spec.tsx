import { render } from '@testing-library/react';

import OverviewPageRevised from './overview-page-revised';

describe('OverviewPageRevised', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<OverviewPageRevised />);
    expect(baseElement).toBeTruthy();
  });
});
