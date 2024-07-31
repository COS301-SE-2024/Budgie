import { render } from '@testing-library/react';

import Support from './support';

describe('Support', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Support />);
    expect(baseElement).toBeTruthy();
  });
});
