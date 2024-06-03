import { render } from '@testing-library/react';

import Homepage from './Homepage';

describe('Homepage', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Homepage />);
    expect(baseElement).toBeTruthy();
  });
});
