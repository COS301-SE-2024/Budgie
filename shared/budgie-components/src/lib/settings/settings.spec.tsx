import { render } from '@testing-library/react';

import Settings from './settings';
import React from 'react';

describe('Settings', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Settings />);
    expect(baseElement).toBeTruthy();
  });
});
