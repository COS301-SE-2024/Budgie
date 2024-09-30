import { render } from '@testing-library/react';

import DataContext from './DataContext';

describe('DataContext', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DataContext />);
    expect(baseElement).toBeTruthy();
  });
});
